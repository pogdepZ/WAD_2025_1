import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';
import api from '../../services/api';

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [editingCat, setEditingCat] = useState(null);
  const [refresh, setRefresh] = useState(0);
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  // Load danh sách
  useEffect(() => {
    api.get('/menu/categories')
      .then(res => setCategories(res.data))
      .catch(() => toast.error("Lỗi tải danh mục"));
  }, [refresh]);

  // Submit (Create hoặc Update)
  const onSubmit = async (data) => {
    try {
      if (editingCat) {
        await api.put(`/menu/categories/${editingCat.id}`, data);
        toast.success("Cập nhật thành công!");
      } else {
        await api.post('/menu/categories', data);
        toast.success("Thêm mới thành công!");
      }
      reset();
      setEditingCat(null);
      setRefresh(p => p + 1);
    } catch (err) {
      toast.error(err.response?.data?.error || "Lỗi lưu dữ liệu");
    }
  };

  // Chọn sửa
  const handleEdit = (cat) => {
    setEditingCat(cat);
    setValue('name', cat.name);
    setValue('description', cat.description);
    setValue('displayOrder', cat.displayOrder);
    setValue('status', cat.status);
  };

  // Hủy sửa
  const handleCancel = () => {
    setEditingCat(null);
    reset();
  };

  // Xóa
  const handleDelete = async (id) => {
    if(!window.confirm("Bạn có chắc chắn muốn xóa?")) return;
    try {
      await api.delete(`/menu/categories/${id}`);
      toast.success("Đã xóa danh mục");
      setRefresh(p => p + 1);
    } catch (err) {
      toast.error(err.response?.data?.error || "Lỗi xóa (Có thể do còn món ăn)");
    }
  };

  return (
    <div className="p-6 md:p-8 bg-[#f5f6fa] min-h-screen font-sans text-[#2c3e50]">
      <Toaster />
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Quản lý Danh Mục</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CỘT TRÁI: FORM */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-lg font-bold mb-4 border-b pb-2">
            {editingCat ? '✏️ Chỉnh sửa Danh mục' : '➕ Thêm Danh mục mới'}
          </h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-600">Tên danh mục</label>
              <input 
                {...register("name", {
                  required: "Tên là bắt buộc",
                  minLength: { value: 2, message: "Tối thiểu 2 ký tự" },
                  maxLength: { value: 50, message: "Tối đa 50 ký tự" }
                })} 
                placeholder="VD: Món Nhật" 
                className={`w-full border p-2 rounded focus:border-primary outline-none ${errors.name ? 'border-red-500' : ''}`} 
              />
              {/* Hiển thị lỗi */}
              {errors.name && <span className="text-xs text-red-500 mt-1">{errors.name.message}</span>}
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-600">Mô tả (Optional)</label>
              <input {...register("description")} placeholder="Mô tả ngắn..." className="w-full border p-2 rounded focus:border-primary outline-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* THỨ TỰ */}
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-600">Thứ tự</label>
                <input 
                  type="number" 
                  {...register("displayOrder", {
                    min: { value: 0, message: "Không được âm" }
                  })} 
                  defaultValue={0} 
                  className="w-full border p-2 rounded focus:border-primary outline-none" 
                />
                {errors.displayOrder && <span className="text-xs text-red-500 mt-1">{errors.displayOrder.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-600">Trạng thái</label>
                <select {...register("status")} className="w-full border p-2 rounded bg-white focus:border-primary outline-none">
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="INACTIVE">Ẩn</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 bg-primary text-white py-2 rounded-lg font-bold hover:bg-primary-dark transition">
                {editingCat ? 'Lưu thay đổi' : 'Tạo mới'}
              </button>
              {editingCat && (
                <button type="button" onClick={handleCancel} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                  Hủy
                </button>
              )}
            </div>
          </form>
        </div>

        {/* CỘT PHẢI: DANH SÁCH */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
              <tr>
                <th className="p-4">STT</th>
                <th className="p-4">Tên</th>
                <th className="p-4">Mô tả</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 text-gray-500 font-mono">{cat.displayOrder}</td>
                  <td className="p-4 font-bold text-gray-800">
                    <span className="font-bold">{cat.name}</span>
                    <span className="text-xs text-gray-400 ml-2">({cat._count?.items || 0} món)</span>
                  </td>
                  <td className="p-4 text-sm text-gray-500 truncate max-w-xs">{cat.description || '-'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${cat.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {cat.status}
                    </span>
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button onClick={() => handleEdit(cat)} className="text-blue-500 hover:bg-blue-50 p-2 rounded">✏️</button>
                    <button onClick={() => handleDelete(cat.id)} className="text-red-500 hover:bg-red-50 p-2 rounded">🗑️</button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr><td colSpan="5" className="p-8 text-center text-gray-400 italic">Chưa có danh mục nào</td></tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}