import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';
import api from '../../services/api';

export default function ModifierManagement() {
  const [modifiers, setModifiers] = useState([]);
  const [refresh, setRefresh] = useState(0);
  
  const { register, control, handleSubmit, reset } = useForm({
    defaultValues: {
      name: '',
      selectionType: 'SINGLE',
      isRequired: false,
      minSelections: 0,
      maxSelections: 1,
      options: [{ name: '', priceAdjustment: 0 }]
    }
  });
  
  const { fields, append, remove } = useFieldArray({ control, name: "options" });

  useEffect(() => {
    api.get('/modifiers').then(res => setModifiers(res.data));
  }, [refresh]);

  const onSubmit = async (data) => {
    try {
      // Chuẩn hóa dữ liệu
      const payload = {
        ...data,
        minSelections: parseInt(data.minSelections),
        maxSelections: parseInt(data.maxSelections),
        options: data.options.map(o => ({
          name: o.name,
          price: parseFloat(o.priceAdjustment || 0) // Backend đang dùng key 'price' trong map
        }))
      };

      await api.post('/modifiers', payload);
      toast.success("Tạo nhóm thành công!");
      reset({ options: [{ name: '', priceAdjustment: 0 }] });
      setRefresh(p => p + 1);
    } catch (err) {
      toast.error("Lỗi tạo nhóm");
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <Toaster />
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Quản lý Topping / Size</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* FORM TẠO */}
        <div className="bg-white p-6 rounded-xl shadow-sm h-fit">
          <h2 className="text-lg font-bold mb-4 border-b pb-2">Tạo Nhóm Mới</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500">Tên nhóm</label>
                <input {...register("name", {required: true})} placeholder="VD: Chọn Size" className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500">Loại chọn</label>
                <select {...register("selectionType")} className="w-full border p-2 rounded bg-white">
                  <option value="SINGLE">Chọn 1 (Radio)</option>
                  <option value="MULTIPLE">Chọn nhiều (Checkbox)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 items-center">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" {...register("isRequired")} />
                Bắt buộc chọn
              </label>
              
              <div className="flex gap-2 items-center text-sm">
                <span>Min:</span>
                <input type="number" {...register("minSelections")} className="w-12 border p-1 rounded" defaultValue={0} />
                <span>Max:</span>
                <input type="number" {...register("maxSelections")} className="w-12 border p-1 rounded" defaultValue={1} />
              </div>
            </div>

            {/* OPTIONS LIST */}
            <div className="bg-gray-50 p-4 rounded-lg border">
              <label className="text-xs font-bold text-gray-500 mb-2 block">Các lựa chọn:</label>
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2 mb-2">
                  <input 
                    {...register(`options.${index}.name`, {required: true})} 
                    placeholder="Tên (VD: Size L)" 
                    className="flex-1 border p-2 rounded text-sm" 
                  />
                  <input 
                    type="number" 
                    {...register(`options.${index}.priceAdjustment`)} 
                    placeholder="+Giá" 
                    className="w-20 border p-2 rounded text-sm" 
                  />
                  <button type="button" onClick={() => remove(index)} className="text-red-500 px-2 font-bold">×</button>
                </div>
              ))}
              <button 
                type="button" 
                onClick={() => append({ name: '', priceAdjustment: 0 })}
                className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded font-bold hover:bg-blue-200"
              >
                + Thêm dòng
              </button>
            </div>

            <button className="w-full bg-primary text-white py-2 rounded-lg font-bold hover:bg-primary-dark">Lưu Nhóm</button>
          </form>
        </div>

        {/* DANH SÁCH */}
        <div className="space-y-4 max-h-screen overflow-y-auto">
          {modifiers.map(group => (
            <div key={group.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-gray-800">{group.name}</h3>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100">
                      {group.selectionType}
                    </span>
                    {group.isRequired && <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded border border-red-100">REQUIRED</span>}
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  ID: {group.id.slice(-4)}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-dashed">
                {group.options.map(opt => (
                  <span key={opt.id} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded border">
                    {opt.name} 
                    {opt.priceAdjustment > 0 && <span className="text-green-600 font-bold ml-1">+{opt.priceAdjustment.toLocaleString()}</span>}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}