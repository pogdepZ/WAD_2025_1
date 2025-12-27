import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

export default function EditTableModal({ table, onClose, onUpdate }) {
  const { register, handleSubmit, reset } = useForm();

  // Đổ dữ liệu cũ vào form khi mở modal
  useEffect(() => {
    if (table) {
      reset({
        name: table.name,
        capacity: table.capacity,
        location: table.location,
        status: table.status || 'ACTIVE'
      });
    }
  }, [table, reset]);

  const onSubmit = (data) => {
    onUpdate(table.id, data);
  };

  if (!table) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
        
        {/* Header */}
        <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
          <h2 className="font-bold text-lg">Chỉnh sửa Bàn</h2>
          <button onClick={onClose} className="text-2xl hover:text-gray-200">&times;</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên bàn</label>
            <input 
              {...register('name', { required: true })}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số ghế</label>
              <input 
                type="number"
                {...register('capacity', { required: true })}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select 
                {...register('status')}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="ACTIVE">Hoạt động</option>
                <option value="INACTIVE">Ngưng hoạt động</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Khu vực</label>
            <input 
              {...register('location')}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              Hủy
            </button>
            <button 
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 shadow"
            >
              Lưu Thay Đổi
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}