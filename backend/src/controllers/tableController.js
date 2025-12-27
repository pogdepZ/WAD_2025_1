const prisma = require("../config/prisma");
const jwt = require("jsonwebtoken");
const QRCode = require('qrcode');
const archiver = require('archiver');

const QR_SECRET = process.env.QR_SECRET || "secret_bi_mat_cua_nhom";

const generateQRToken = (table) => {
  const payload = {
    tableId: table.id,
    version: table.qrVersion,
  };
  return jwt.sign(payload, QR_SECRET);
};

// 1. Tạo bàn
exports.createTable = async (req, res) => {
  try {
    const { name, capacity, location } = req.body;

    const tempToken = `temp_${Date.now()}_${Math.random()}`;

    const newTable = await prisma.table.create({
      data: {
        name,
        capacity: parseInt(capacity),
        location, // [SỬA] Đã thêm location vào đây
        status: "ACTIVE", // [SỬA] Mặc định là ACTIVE
        qrToken: tempToken,
        qrVersion: 1,
      },
    });

    const token = generateQRToken(newTable);
    const updatedTable = await prisma.table.update({
      where: { id: newTable.id },
      data: { qrToken: token },
    });

    res.json(updatedTable);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Cập nhật thông tin (Dùng cho Modal Sửa)
exports.updateTable = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, capacity, location, status } = req.body;

    const updatedTable = await prisma.table.update({
      where: { id: id },
      data: {
        name,
        capacity: parseInt(capacity),
        location,
        status, // 'ACTIVE' hoặc 'INACTIVE'
      },
    });

    res.json(updatedTable);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Tên bàn đã tồn tại" });
    }
    res.status(500).json({ error: error.message });
  }
};

// 3. Lấy danh sách
exports.getTables = async (req, res) => {
  const tables = await prisma.table.findMany();
  res.json(tables);
};

// 4. Regenerate QR
exports.regenerateQR = async (req, res) => {
  try {
    const { id } = req.params;
    const table = await prisma.table.findUnique({ where: { id } });

    const newVersion = (table.qrVersion || 1) + 1;
    const newToken = jwt.sign(
      { tableId: table.id, version: newVersion },
      QR_SECRET
    );

    const updatedTable = await prisma.table.update({
      where: { id },
      data: { qrVersion: newVersion, qrToken: newToken },
    });

    res.json(updatedTable);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// [CẦN KHỚP VỚI SCHEMA]
// Nếu bạn muốn dùng hàm này riêng để bật tắt nhanh, hãy ánh xạ boolean sang string
exports.updateTableStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body; // Frontend gửi true/false

    const updatedTable = await prisma.table.update({
      where: { id },
      data: { status: isActive ? "ACTIVE" : "INACTIVE" }, // [SỬA] Chuyển sang String
    });

    res.json(updatedTable);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 5. Verify QR (Logic quét mã)
exports.verifyQR = async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = jwt.verify(token, QR_SECRET);

    const table = await prisma.table.findUnique({
      where: { id: decoded.tableId },
    });

    if (!table) {
      return res.status(404).json({ error: "Bàn không tồn tại" });
    }

    // [SỬA] Kiểm tra status string thay vì isActive boolean
    if (table.status !== "ACTIVE") {
      return res.status(403).json({
        error: "Bàn này đang tạm ngưng phục vụ. Vui lòng liên hệ nhân viên.",
      });
    }

    if (decoded.version < table.qrVersion) {
      return res
        .status(400)
        .json({ error: "Mã QR này đã cũ. Vui lòng xin mã mới." });
    }

    res.json({
      valid: true,
      table: { id: table.id, name: table.name },
    });
  } catch (error) {
    res.status(400).json({ error: "Mã QR không hợp lệ" });
  }
};

// TẢI TẤT CẢ QR (ZIP)
exports.downloadAllQRs = async (req, res) => {
  try {
    const tables = await prisma.table.findMany({
      where: { status: "ACTIVE" }, // Chỉ tải bàn đang hoạt động
    });

    if (tables.length === 0)
      return res.status(404).json({ error: "Không có bàn nào" });

    // Thiết lập Header để trình duyệt hiểu đây là file zip
    res.attachment("All_QR_Codes.zip");

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(res); // Nối luồng nén thẳng vào response

    // Duyệt từng bàn, tạo ảnh QR và ném vào file zip
    for (const table of tables) {
      // URL khách quét (Lưu ý: Thay localhost bằng IP máy hoặc domain thật khi deploy)
      // Tốt nhất là lấy từ biến môi trường: process.env.FRONTEND_URL
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      const qrData = `${frontendUrl}/scan/${table.qrToken}`;

      // Tạo Buffer ảnh PNG
      const qrBuffer = await QRCode.toBuffer(qrData, {
        width: 500,
        margin: 2,
      });

      // Thêm file vào zip với tên: "Ban-1.png"
      archive.append(qrBuffer, { name: `${table.name}.png` });
    }

    await archive.finalize();
  } catch (error) {
    console.error(error);
    // Nếu lỗi khi đang stream file thì không gửi json được nữa
    if (!res.headersSent) res.status(500).json({ error: error.message });
  }
};

// 6. Làm mới TOÀN BỘ QR
exports.regenerateAllQRs = async (req, res) => {
  try {
    // 1. Lấy tất cả bàn đang hoạt động
    const tables = await prisma.table.findMany({
      where: { status: 'ACTIVE' }
    });

    if (tables.length === 0) return res.json({ message: "Không có bàn nào cần làm mới", count: 0 });

    // 2. Duyệt qua từng bàn và cập nhật
    // (Dùng Promise.all để chạy song song cho nhanh)
    const updates = tables.map(table => {
      const newVersion = (table.qrVersion || 1) + 1;
      const newToken = jwt.sign({ tableId: table.id, version: newVersion }, QR_SECRET);
      
      return prisma.table.update({
        where: { id: table.id },
        data: { qrVersion: newVersion, qrToken: newToken }
      });
    });

    await Promise.all(updates);

    res.json({ 
      message: "Đã làm mới thành công", 
      count: tables.length,
      tables: tables.map(t => t.name) // Trả về danh sách tên bàn để hiển thị
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};