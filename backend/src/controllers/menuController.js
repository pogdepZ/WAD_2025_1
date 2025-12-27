// server/src/controllers/menuController.js
const prisma = require("../config/prisma");

// --- 1. CÁC API CHO CATEGORY (DANH MỤC) ---

// Lấy danh sách Category (Admin dùng, chỉ lấy info, không lấy items)
exports.getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { displayOrder: "asc" },
      include: { _count: { select: { items: true } } },
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Tạo Category
exports.createCategory = async (req, res) => {
  try {
    const { name, description, displayOrder, status } = req.body;

    // VALIDATION: Check trùng tên (Unique per restaurant)
    // Lưu ý: Nếu làm multi-tenant thì phải thêm where: { name, restaurantId }
    const exist = await prisma.category.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" }, // Không phân biệt hoa thường
      },
    });

    if (exist) {
      return res.status(400).json({ error: "Tên danh mục này đã tồn tại!" });
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
        displayOrder: parseInt(displayOrder || 0),
        status: status || "ACTIVE",
      },
    });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Cập nhật Category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, displayOrder, status } = req.body;

    // VALIDATION: Check trùng tên khi update
    // Tìm xem có thằng nào KHÁC id này mà lại có cùng tên không
    const exist = await prisma.category.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
        id: { not: id }, // Quan trọng: Loại trừ chính nó ra
      },
    });

    if (exist) {
      return res
        .status(400)
        .json({ error: "Tên danh mục này đã được sử dụng!" });
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name,
        description,
        displayOrder: parseInt(displayOrder || 0),
        status,
      },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Xóa Category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    // Vẫn giữ logic chặn xóa nếu còn món
    const itemsCount = await prisma.menuItem.count({
      where: { categoryId: id },
    });
    if (itemsCount > 0) return res.status(400).json({ error: "..." });

    // Thay vì delete, ta update status
    await prisma.category.update({
      where: { id },
      data: { status: "DELETED" }, // Hoặc 'INACTIVE' tùy quy ước
    });
    res.json({ message: "Đã xóa danh mục" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- 2. CÁC API CHO MENU ITEM (MÓN ĂN) & GUEST VIEW ---

// Lấy toàn bộ Menu (Gộp theo danh mục) - Dùng cho Khách & App
// Lấy toàn bộ Menu (Bao gồm Ảnh và Modifiers)
exports.getFullMenu = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { status: "ACTIVE" },
      orderBy: { displayOrder: "asc" },
      include: {
        items: {
          where: { isDeleted: false, status: "AVAILABLE" },
          include: {
            photos: true, // Lấy ảnh
            modifierGroups: {
              // LẤY KÈM MODIFIER GROUPS VÀ OPTIONS
              include: { options: true },
            },
          },
        },
      },
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Tạo Món ăn mới
exports.createItem = async (req, res) => {
  try {
    const {
      name,
      price,
      categoryId,
      description,
      image,
      prepTimeMinutes,
      status,
      isChefRecommended,
      modifierGroupIds, // Mảng ID các nhóm Topping
    } = req.body;

    const newItem = await prisma.menuItem.create({
      data: {
        name,
        price: parseFloat(price),
        categoryId,
        description,
        image,
        prepTimeMinutes: parseInt(prepTimeMinutes || 0),
        status: status || "AVAILABLE",
        isChefRecommended: Boolean(isChefRecommended),

        // Gán nhóm Topping vào món ăn
        modifierGroups: {
          connect: modifierGroupIds?.map((id) => ({ id })) || [],
        },
      },
      include: { modifierGroups: true }, // Trả về để check
    });
    res.json(newItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cập nhật món ăn
exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      price,
      categoryId,
      description,
      image,
      prepTimeMinutes,
      status,
      isChefRecommended,
      modifierGroupIds,
    } = req.body;

    const updatedItem = await prisma.menuItem.update({
      where: { id },
      data: {
        name,
        price: parseFloat(price),
        categoryId,
        description,
        image,
        prepTimeMinutes: parseInt(prepTimeMinutes || 0),
        status,
        isChefRecommended: Boolean(isChefRecommended),

        // Cập nhật lại danh sách Topping (Ghi đè bằng 'set')
        modifierGroups: {
          set: modifierGroupIds?.map((id) => ({ id })) || [],
        },
      },
      include: { modifierGroups: true },
    });

    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Xóa mềm món ăn (Soft Delete)
exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Thay vì delete, ta update isDeleted = true
    const updatedItem = await prisma.menuItem.update({
      where: { id },
      data: {
        isDeleted: true,
        status: "UNAVAILABLE", // Tắt luôn status cho chắc
      },
    });

    res.json({ message: "Đã xóa món ăn (Soft Delete)", item: updatedItem });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 5. Thêm ảnh cho món ăn
exports.addItemPhotos = async (req, res) => {
  try {
    const { id } = req.params; // MenuItem ID
    const files = req.files; // Mảng file từ Multer

    if (!files || files.length === 0)
      return res.status(400).json({ error: "Chưa chọn ảnh" });

    // Lưu vào bảng MenuItemPhoto
    const createPhotos = files.map((file) => ({
      url: file.path,
      menuItemId: id,
      isPrimary: false,
    }));

    await prisma.menuItemPhoto.createMany({ data: createPhotos });

    res.json({ message: "Upload thành công", count: files.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 6. Xóa ảnh
exports.deleteItemPhoto = async (req, res) => {
  try {
    const { photoId } = req.params;
    await prisma.menuItemPhoto.delete({ where: { id: photoId } });
    res.json({ message: "Đã xóa ảnh" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 7. Chọn ảnh đại diện (Primary)
exports.setPrimaryPhoto = async (req, res) => {
  try {
    const { itemId, photoId } = req.params;

    // Transaction: Reset tất cả ảnh của món này về false -> Set ảnh được chọn thành true
    await prisma.$transaction([
      prisma.menuItemPhoto.updateMany({
        where: { menuItemId: itemId },
        data: { isPrimary: false },
      }),
      prisma.menuItemPhoto.update({
        where: { id: photoId },
        data: { isPrimary: true },
      }),
    ]);

    // Cập nhật luôn vào bảng MenuItem cha để query cho nhanh (Cache)
    const photo = await prisma.menuItemPhoto.findUnique({
      where: { id: photoId },
    });
    await prisma.menuItem.update({
      where: { id: itemId },
      data: { image: photo.url },
    });

    res.json({ message: "Đã cập nhật ảnh đại diện" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
