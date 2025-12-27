const prisma = require("../config/prisma");

// TẠO ĐƠN HÀNG MỚI
exports.createOrder = async (req, res) => {
  try {
    const { tableId, items } = req.body; // items = [{ menuItemId: "...", quantity: 1, note: "..." }]

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Giỏ hàng trống!" });
    }

    // 1. Kiểm tra xem bàn này đang có Session nào mở không?
    let session = await prisma.tableSession.findFirst({
      where: {
        tableId: tableId,
        status: "OPEN",
      },
    });

    // 2. Nếu chưa có Session mở, tạo mới (Khách mới vào)
    if (!session) {
      session = await prisma.tableSession.create({
        data: {
          tableId: tableId,
          status: "OPEN",
        },
      });
    }

    // 3. Tạo Order (Mặc định status là PENDING chờ duyệt)
    const newOrder = await prisma.order.create({
      data: {
        sessionId: session.id,
        status: "PENDING",
        items: {
          create: items.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            note: item.note || "",
          })),
        },
      },
      include: {
        items: { include: { menuItem: true } }, // Lấy chi tiết món để trả về
        session: { include: { table: true } }, // Lấy tên bàn
      },
    });

    // 4. BẮN SOCKET CHO WAITER (Quan trọng!)
    // Gửi sự kiện 'new_order' tới room 'waiter_room'
    req.io.to("waiter_room").emit("new_order", newOrder);

    res.status(201).json(newOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi tạo đơn hàng" });
  }
};

// CẬP NHẬT TRẠNG THÁI ĐƠN (Duyệt / Từ chối / Xong)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // status: 'ACCEPTED', 'REJECTED', 'READY', 'SERVED'

    // 1. Update DB
    const updatedOrder = await prisma.order.update({
      where: { id: id }, // Lưu ý: Nếu dùng MongoDB thì id là string, không cần parseInt
      data: { status },
      include: {
        items: { include: { menuItem: true } },
        session: { include: { table: true } },
      },
    });

    // 2. Bắn Socket thông báo
    // - Báo cho Bếp (nếu Duyệt)
    if (status === "ACCEPTED") {
      req.io.to("kitchen_room").emit("kitchen_new_order", updatedOrder);
    }

    // - Báo ngược lại cho Khách (để khách biết đơn đã được nhận)
    // (Tạm thời bắn chung, sau này có thể bắn riêng theo tableId)
    req.io.emit("order_status_update", updatedOrder);

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: "Lỗi cập nhật đơn hàng" });
  }
};

// THANH TOÁN & ĐÓNG SESSION
exports.checkoutSession = async (req, res) => {
  try {
    const { tableId } = req.body;

    // 1. Tìm session đang mở
    const session = await prisma.tableSession.findFirst({
      where: { tableId, status: "OPEN" },
      include: {
        orders: {
          include: { items: { include: { menuItem: true } } }, // Join để lấy giá tiền
        },
      },
    });

    if (!session)
      return res.status(404).json({ error: "Không tìm thấy phiên ăn" });

    // 2. Tính tổng tiền
    let total = 0;
    session.orders.forEach((order) => {
      // Chỉ tính tiền các món đã được DUYỆT hoặc RA MÓN (tránh tính món bị từ chối)
      if (["ACCEPTED", "PREPARING", "READY", "SERVED"].includes(order.status)) {
        order.items.forEach((item) => {
          total += item.quantity * item.menuItem.price;
        });
      }
    });

    // 3. Update DB: Đóng session, lưu tổng tiền
    const updatedSession = await prisma.tableSession.update({
      where: { id: session.id },
      data: {
        status: "CLOSED",
        endTime: new Date(),
        totalAmount: total,
      },
    });

    res.json({
      message: "Thanh toán thành công",
      total,
      session: updatedSession,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// XEM TỔNG TIỀN (PREVIEW)
exports.previewSession = async (req, res) => {
  try {
    const { tableId } = req.body;
    const session = await prisma.tableSession.findFirst({
      where: { tableId, status: "OPEN" },
      include: {
        orders: {
          include: { items: { include: { menuItem: true } } },
        },
      },
    });

    if (!session) return res.status(404).json({ error: "Không tìm thấy" });

    let total = 0;
    session.orders.forEach((order) => {
      // Chỉ tính món ĐÃ DUYỆT hoặc ĐÃ RA (Accepted/Served)
      if (["ACCEPTED", "PREPARING", "READY", "SERVED"].includes(order.status)) {
        order.items.forEach((item) => {
          total += item.quantity * item.menuItem.price;
        });
      }
    });

    res.json({ total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
