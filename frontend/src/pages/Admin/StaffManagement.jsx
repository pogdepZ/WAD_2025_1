import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';
import api from '../../services/api';

export default function StaffManagement() {
  const [staffs, setStaffs] = useState([]);
  const { register, handleSubmit, reset } = useForm();

  // Load danh sách
  const loadStaffs = () => {
    api.get('/staff').then(res => setStaffs(res.data));
  };

  useEffect(() => {
    loadStaffs();
  }, []);

  // Tạo nhân viên
  const onCreateStaff = async (data) => {
    try {
      await api.post('/staff', data);
      toast.success(`Đã tạo tài khoản cho ${data.name}`);
      reset();
      loadStaffs();
    } catch (err) {
      toast.error(err.response?.data?.error || "Lỗi tạo nhân viên");
    }
  };

  // Xóa nhân viên
  const onDeleteStaff = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa nhân viên này?")) return;
    try {
      await api.delete(`/staff/${id}`);
      toast.success("Đã xóa thành công");
      loadStaffs();
    } catch (err) {
      toast.error("Lỗi xóa nhân viên");
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <Toaster />
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Quản lý Nhân Viên</h1>

      {/* FORM TẠO MỚI */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
        <h2 className="font-bold text-lg mb-4">Thêm nhân viên mới</h2>
        <form onSubmit={handleSubmit(onCreateStaff)} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input {...register("name")} placeholder="Họ tên" required className="border p-2 rounded" />
          <input {...register("email")} type="email" placeholder="Email" required className="border p-2 rounded" />
          <input {...register("password")} type="password" placeholder="Mật khẩu" required className="border p-2 rounded" />
          
          <select {...register("role")} className="border p-2 rounded">
            <option value="WAITER">Phục vụ (Waiter)</option>
            <option value="KITCHEN">Đầu bếp (Kitchen)</option>
          </select>

          <button className="bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700">
            + Thêm
          </button>
        </form>
      </div>

      {/* DANH SÁCH NHÂN VIÊN */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="p-4">Họ tên</th>
              <th className="p-4">Email</th>
              <th className="p-4">Vai trò</th>
              <th className="p-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {staffs.map(staff => (
              <tr key={staff.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium">{staff.name}</td>
                <td className="p-4 text-gray-500">{staff.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${staff.role === 'WAITER' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                    {staff.role}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => onDeleteStaff(staff.id)}
                    className="text-red-500 hover:text-red-700 font-bold text-sm"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
            {staffs.length === 0 && (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-400 italic">Chưa có nhân viên nào</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}