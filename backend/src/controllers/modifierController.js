const prisma = require('../config/prisma');

// 1. Lấy tất cả nhóm Topping (kèm options)
exports.getModifiers = async (req, res) => {
  try {
    const groups = await prisma.modifierGroup.findMany({
      include: { options: true }
    });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Tạo Nhóm Topping Mới (Kèm luôn options bên trong)
exports.createModifierGroup = async (req, res) => {
  try {
    const { name, isRequired, selectionType, options } = req.body;
    // options là mảng: [{ name: "Size L", priceAdjustment: 5000 }, ...]

    const newGroup = await prisma.modifierGroup.create({
      data: {
        name,
        isRequired,
        selectionType, // 'SINGLE' hoặc 'MULTIPLE'
        options: {
          create: options.map(opt => ({
            name: opt.name,
            priceAdjustment: parseFloat(opt.price || 0)
          }))
        }
      },
      include: { options: true }
    });
    res.json(newGroup);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Gán Topping vào Món Ăn
exports.attachToItem = async (req, res) => {
  try {
    const { itemId, groupId } = req.body;
    
    // Cập nhật món ăn, nối thêm groupId vào mảng modifierGroupIds
    const updatedItem = await prisma.menuItem.update({
      where: { id: itemId },
      data: {
        modifierGroups: {
          connect: { id: groupId }
        }
      },
      include: { modifierGroups: true }
    });
    
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};