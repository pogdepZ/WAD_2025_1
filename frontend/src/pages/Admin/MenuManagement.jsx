import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import api, { menuService } from "../../services/api";
import axios from "axios"; // <--- THÊM DÒNG NÀY

// --- Sub-component: Menu Card ---
const MenuCard = ({ item, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
      <div className="h-40 bg-gray-100 flex items-center justify-center relative overflow-hidden">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <span className="text-4xl">🍽️</span>
        )}

        <span
          className={`absolute top-3 right-3 w-3 h-3 rounded-full border-2 border-white ${
            item.status === "AVAILABLE"
              ? "bg-green-500"
              : item.status === "SOLD_OUT"
              ? "bg-red-500"
              : "bg-gray-400"
          }`}
        ></span>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-1">
          <h4
            className="font-bold text-[#2c3e50] text-lg leading-tight line-clamp-1"
            title={item.name}
          >
            {item.name}
          </h4>
        </div>

        <p className="text-xs font-bold text-blue-500 uppercase tracking-wide mb-2">
          {item.category?.name || "Uncategorized"}
        </p>
        <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">
          {item.description || "Chưa có mô tả"}
        </p>

        <div className="flex justify-between items-center text-sm font-medium text-gray-700 mb-3 bg-gray-50 p-2 rounded-lg">
          <span className="text-[#2c3e50] font-bold">
            {(item.price || 0).toLocaleString()} đ
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            ⏳ {item.prepTimeMinutes || 15} min
          </span>
        </div>

        <div className="flex gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={() => onEdit(item)}
            className="flex-1 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition text-sm font-semibold flex items-center justify-center gap-1"
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="flex-1 py-2 rounded-lg text-red-500 hover:bg-red-50 transition text-sm font-semibold flex items-center justify-center gap-1"
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default function MenuManagement() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [refresh, setRefresh] = useState(0);

  // Filter States
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

  // [MỚI] Sorting & Pagination States
  const [sortBy, setSortBy] = useState("NEWEST"); // NEWEST, PRICE_ASC, PRICE_DESC
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Số lượng món trên 1 trang

  // Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // State lưu danh sách tất cả Modifier Groups để hiển thị cho user chọn
  const [allModifiers, setAllModifiers] = useState([]);

  // State lưu danh sách ID của các group đã chọn cho món hiện tại
  const [selectedModifierIds, setSelectedModifierIds] = useState([]);

  // State quản lý danh sách ảnh khi Edit
  const [photos, setPhotos] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  // Upload ảnh
  const [uploading, setUploading] = useState(false);

  // 1. Load Data
  useEffect(() => {
    api.get("/modifiers").then((res) => setAllModifiers(res.data));
    api.get("/menu").then((res) => {
      const allItems = res.data.flatMap((cat) =>
        cat.items.map((i) => ({
          ...i,
          category: { id: cat.id, name: cat.name },
        }))
      );
      setItems(allItems);
      setCategories(res.data);
    });
  }, [refresh]);

  // --- LOGIC LỌC & SẮP XẾP (ĐÃ CẬP NHẬT) ---
  const processedItems = useMemo(() => {
    // 1. Lọc
    let result = items.filter((item) => {
      const matchSearch = item.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchCat = filterCat === "ALL" || item.category?.id === filterCat;
      const matchStatus =
        filterStatus === "ALL" || item.status === filterStatus;
      return matchSearch && matchCat && matchStatus;
    });

    // 2. Sắp xếp (Sort)
    result.sort((a, b) => {
      if (sortBy === "NEWEST") {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      if (sortBy === "PRICE_ASC") {
        return a.price - b.price;
      }
      if (sortBy === "PRICE_DESC") {
        return b.price - a.price;
      }
      return 0;
    });

    return result;
  }, [items, search, filterCat, filterStatus, sortBy]); // Thêm sortBy vào dependency

  // --- LOGIC PHÂN TRANG ---
  const totalPages = Math.ceil(processedItems.length / itemsPerPage);
  const paginatedItems = processedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset về trang 1 khi thay đổi bộ lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterCat, filterStatus, sortBy]);

  // 3. Handlers
  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      setValue("name", item.name);
      setValue("price", item.price);
      setValue("categoryId", item.category.id);
      setValue("description", item.description);
      setValue("image", item.image);
      setValue("prepTimeMinutes", item.prepTimeMinutes);
      setValue("status", item.status);
      setValue("isChefRecommended", item.isChefRecommended);
      setPhotos(item.photos || []);
      // Giả sử item trả về có mảng modifierGroupIds hoặc modifierGroups
      // Nếu API getMenu chưa trả về, bạn cần update API backend getFullMenu (include: modifierGroups: true)
      const currentIds = item.modifierGroups?.map((g) => g.id) || [];
      setSelectedModifierIds(currentIds);
    } else {
      reset();
      setPhotos([]);
      setSelectedModifierIds([]);
    }
    setIsModalOpen(true);
  };

  // Hàm xử lý chọn/bỏ chọn checkbox
  const toggleModifier = (groupId) => {
    setSelectedModifierIds((prev) => {
      if (prev.includes(groupId)) return prev.filter((id) => id !== groupId);
      return [...prev, groupId];
    });
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        price: parseFloat(data.price),
        prepTimeMinutes: parseInt(data.prepTimeMinutes || 0),
        status: data.status.toUpperCase(),
        modifierGroupIds: selectedModifierIds, // Gửi mảng ID lên
      };

      if (editingItem) {
        await menuService.updateItem(editingItem.id, payload);
        toast.success("Cập nhật thành công");
      } else {
        await api.post("/menu/items", payload);
        toast.success("Thêm món mới thành công");
      }

      setIsModalOpen(false);
      setRefresh((p) => p + 1);
    } catch (err) {
      toast.error(err.response?.data?.error || "Lỗi lưu dữ liệu");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa món này?")) return;
    try {
      await menuService.deleteItem(id);
      toast.success("Đã xóa món ăn");
      setRefresh((p) => p + 1);
    } catch (err) {
      toast.error("Lỗi xóa món");
    }
  };

  // Upload ảnh
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);
    try {
      // Gọi API upload (Lưu ý: api.js phải hỗ trợ multipart, hoặc gọi axios trực tiếp)
      // Cách nhanh nhất là dùng axios trực tiếp ở đây để tránh config header phức tạp
      const res = await axios.post(
        "http://localhost:5000/api/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // Upload xong -> Điền URL vào form
      setValue("image", res.data.url);
      toast.success("Upload ảnh thành công!");
    } catch (err) {
      console.error("Chi tiết lỗi upload:", err); // <-- THÊM DÒNG NÀY
      console.log("Response data:", err.response?.data); // <-- VÀ DÒNG NÀY
      toast.error(err.response?.data?.error || "Lỗi upload ảnh");
    } finally {
      setUploading(false);
    }
  };

  // Hàm Upload nhiều ảnh (Chỉ dùng khi Edit)
  const handleUploadMultiple = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("photos", files[i]);
    }

    const toastId = toast.loading("Đang upload...");
    try {
      await api.post(`/menu/items/${editingItem.id}/photos`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Upload thành công!", { id: toastId });
      setRefresh((p) => p + 1); // Reload lại list để lấy ảnh mới
      setIsModalOpen(false); // Tạm đóng modal để refresh data (hoặc gọi API get detail lại)
    } catch (err) {
      toast.error("Lỗi upload", { id: toastId });
    }
  };

  // Hàm xóa ảnh
  const handleDeletePhoto = async (photoId) => {
    if (!confirm("Xóa ảnh này?")) return;
    try {
      await api.delete(`/menu/photos/${photoId}`);
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      toast.success("Đã xóa");
    } catch (err) {
      toast.error("Lỗi xóa");
    }
  };

  // Hàm set Primary
  const handleSetPrimary = async (photoId) => {
    try {
      await api.put(`/menu/items/${editingItem.id}/photos/${photoId}/primary`);
      toast.success("Đã đặt làm ảnh chính");
      setRefresh((p) => p + 1);
      setIsModalOpen(false);
    } catch (err) {
      toast.error("Lỗi cập nhật");
    }
  };

  return (
    <div className="p-6 md:p-8 bg-[#f5f6fa] min-h-screen font-sans text-[#2c3e50]">
      <Toaster position="top-center" />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2c3e50]">Menu Items</h1>
          <p className="text-[#7f8c8d] text-sm mt-1">
            Quản lý thực đơn nhà hàng ({processedItems.length} món)
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-6 py-3 bg-[#e74c3c] text-white font-bold rounded-xl shadow-lg shadow-red-200 hover:bg-[#c0392b] transition flex items-center gap-2"
        >
          <span>+</span> Add Menu Item
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 mb-8 items-center">
        {/* Search */}
        <div className="flex-1 relative min-w-[200px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search menu items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>

        {/* Category Filter */}
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500 cursor-pointer"
        >
          <option value="ALL">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500 cursor-pointer"
        >
          <option value="ALL">All Status</option>
          <option value="AVAILABLE">Available</option>
          <option value="SOLD_OUT">Sold Out</option>
          <option value="UNAVAILABLE">Unavailable</option>
        </select>

        {/* [MỚI] Sort Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500 cursor-pointer"
        >
          <option value="NEWEST">Mới nhất</option>
          <option value="PRICE_ASC">Giá tăng dần</option>
          <option value="PRICE_DESC">Giá giảm dần</option>
        </select>
      </div>

      {/* MENU GRID (Dùng paginatedItems) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {paginatedItems.map((item) => (
          <MenuCard
            key={item.id}
            item={item}
            onEdit={handleOpenModal}
            onDelete={handleDelete}
          />
        ))}
        {paginatedItems.length === 0 && (
          <div className="col-span-full text-center py-20 text-gray-400">
            <div className="text-6xl mb-4">🥗</div>
            <p>Không tìm thấy món ăn nào phù hợp.</p>
          </div>
        )}
      </div>

      {/* [MỚI] PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pb-8">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-gray-600"
          >
            ← Trước
          </button>

          <span className="font-bold text-gray-700 bg-white px-4 py-2 rounded-lg border">
            Trang {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-gray-600"
          >
            Sau →
          </button>
        </div>
      )}

      {/* MODAL FORM */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800">
                {editingItem ? "Edit Menu Item" : "New Menu Item"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-red-500 text-2xl"
              >
                &times;
              </button>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="p-6 space-y-4 max-h-[80vh] overflow-y-auto"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("name", {
                      required: "Tên là bắt buộc",
                      minLength: { value: 2, message: "Tối thiểu 2 ký tự" },
                      maxLength: { value: 80, message: "Tối đa 80 ký tự" },
                    })}
                    className={`w-full border p-2 rounded-lg ${
                      errors.name ? "border-red-500" : ""
                    }`}
                    placeholder="e.g. Beef Steak"
                  />
                  {errors.name && (
                    <span className="text-xs text-red-500 mt-1">
                      {errors.name.message}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("categoryId", {
                      required: "Vui lòng chọn danh mục",
                    })}
                    className={`w-full border p-2 rounded-lg bg-white ${
                      errors.categoryId ? "border-red-500" : ""
                    }`}
                  >
                    <option value="">-- Chọn --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <span className="text-xs text-red-500 mt-1">
                      {errors.categoryId.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Price (VND) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    {...register("price", {
                      required: "Giá là bắt buộc",
                      min: { value: 1000, message: "Tối thiểu 1.000đ" },
                    })}
                    className={`w-full border p-2 rounded-lg ${
                      errors.price ? "border-red-500" : ""
                    }`}
                    placeholder="50000"
                  />
                  {errors.price && (
                    <span className="text-xs text-red-500 mt-1">
                      {errors.price.message}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Prep Time (Min)
                  </label>
                  <input
                    type="number"
                    {...register("prepTimeMinutes", {
                      min: { value: 0, message: "Không được âm" },
                      max: { value: 240, message: "Tối đa 240 phút" },
                    })}
                    className="w-full border p-2 rounded-lg"
                    defaultValue={15}
                  />
                  {errors.prepTimeMinutes && (
                    <span className="text-xs text-red-500 mt-1">
                      {errors.prepTimeMinutes.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Status
                  </label>
                  <select
                    {...register("status")}
                    className="w-full border p-2 rounded-lg bg-white"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="SOLD_OUT">Sold Out</option>
                    <option value="UNAVAILABLE">Unavailable</option>
                  </select>
                </div>
                <div className="flex items-center mt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      {...register("isChefRecommended")}
                      className="w-4 h-4 rounded text-primary"
                    />
                    👑 Chef Recommend
                  </label>
                </div>
              </div>

              {/* Thay ô input URL cũ bằng đoạn này */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Image
                </label>

                <div className="flex items-center gap-4">
                  {/* Preview ảnh */}
                  <div className="w-20 h-20 bg-gray-100 rounded-lg border overflow-hidden flex-shrink-0">
                    {/* Watch giá trị image từ form */}
                    <img
                      src={
                        watch("image") ||
                        "https://placehold.co/100?text=No+Image"
                      }
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {uploading && (
                      <p className="text-xs text-blue-500 mt-1">
                        Đang tải lên...
                      </p>
                    )}

                    {/* Input ẩn để lưu URL gửi lên server */}
                    <input type="hidden" {...register("image")} />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Description
                </label>
                <textarea
                  {...register("description")}
                  rows="3"
                  className="w-full border p-2 rounded-lg"
                  placeholder="Mô tả món ăn..."
                ></textarea>
              </div>

              {/* --- PHẦN CHỌN TOPPING --- */}
              <div className="border-t pt-4 mt-4">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                  Topping / Modifiers
                </label>

                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto bg-gray-50 p-2 rounded border">
                  {allModifiers.map((group) => (
                    <label
                      key={group.id}
                      className="flex items-center gap-2 p-2 bg-white border rounded cursor-pointer hover:border-blue-500"
                    >
                      <input
                        type="checkbox"
                        checked={selectedModifierIds.includes(group.id)}
                        onChange={() => toggleModifier(group.id)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <div>
                        <p className="text-sm font-bold">{group.name}</p>
                        <p className="text-[10px] text-gray-500">
                          {group.selectionType} • {group.options.length} options
                        </p>
                      </div>
                    </label>
                  ))}
                  {allModifiers.length === 0 && (
                    <p className="text-xs text-gray-400 p-2">
                      Chưa có nhóm Topping nào. Hãy tạo trước.
                    </p>
                  )}
                </div>
              </div>

              {/* --- PHẦN QUẢN LÝ ẢNH (CHỈ HIỆN KHI EDIT) --- */}
              {editingItem && (
                <div className="border-t pt-4 mt-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Thư viện ảnh món ăn
                  </label>

                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {photos.map((photo) => (
                      <div
                        key={photo.id}
                        className="relative group h-20 w-20 rounded-lg overflow-hidden border"
                      >
                        <img
                          src={photo.url}
                          className="w-full h-full object-cover"
                        />

                        {/* Badge Primary */}
                        {photo.isPrimary && (
                          <span className="absolute top-0 right-0 bg-green-500 text-white text-[10px] px-1 font-bold">
                            MAIN
                          </span>
                        )}

                        {/* Overlay Actions */}
                        <div className="absolute inset-0 bg-black/50 hidden group-hover:flex flex-col items-center justify-center gap-1">
                          {!photo.isPrimary && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimary(photo.id)}
                              className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded"
                            >
                              Set Main
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeletePhoto(photo.id)}
                            className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Nút Upload Thêm */}
                    <label className="h-20 w-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:text-blue-500 transition">
                      <span className="text-2xl">+</span>
                      <span className="text-[10px]">Add Photo</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleUploadMultiple}
                      />
                    </label>
                  </div>
                </div>
              )}

              <button className="w-full bg-[#e74c3c] text-white font-bold py-3 rounded-xl hover:bg-[#c0392b] transition shadow-lg">
                Save Item
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
