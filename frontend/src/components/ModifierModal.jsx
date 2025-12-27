import { useState, useEffect } from 'react';

export default function ModifierModal({ item, onClose, onConfirm }) {
  const [selections, setSelections] = useState({}); 
  const [note, setNote] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(item.price);

  // Tính tổng tiền
  useEffect(() => {
    let extra = 0;
    item.modifierGroups?.forEach(group => {
      const selectedIds = selections[group.id] || [];
      selectedIds.forEach(optId => {
        const option = group.options.find(o => o.id === optId);
        if (option) extra += option.priceAdjustment;
      });
    });
    setTotalPrice((item.price + extra) * quantity);
  }, [selections, quantity, item]);

  // Xử lý chọn topping
  const handleSelect = (group, optionId) => {
    setSelections(prev => {
      const current = prev[group.id] || [];
      if (group.selectionType === 'SINGLE') {
        return { ...prev, [group.id]: [optionId] };
      } else {
        if (current.includes(optionId)) {
          return { ...prev, [group.id]: current.filter(id => id !== optionId) };
        } else {
          if (group.maxSelections && current.length >= group.maxSelections) return prev;
          return { ...prev, [group.id]: [...current, optionId] };
        }
      }
    });
  };

  // Submit
  const handleConfirm = () => {
    // Validate Required... (giữ logic cũ)
    
    const selectedModifiers = [];
    item.modifierGroups?.forEach(group => {
      const ids = selections[group.id] || [];
      ids.forEach(id => {
        const opt = group.options.find(o => o.id === id);
        if (opt) selectedModifiers.push({ ...opt, groupName: group.name });
      });
    });

    onConfirm(selectedModifiers, totalPrice / quantity, quantity, note);
  };

  return (
    <div className="fixed inset-0 z-50 bg-white sm:bg-black/50 flex justify-center overflow-hidden">
      {/* Container mô phỏng Mobile */}
      <div className="w-full max-w-md bg-[#f5f6fa] h-full flex flex-col relative sm:rounded-3xl sm:my-4 sm:overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 text-white bg-gradient-to-b from-black/50 to-transparent">
          <button onClick={onClose} className="text-2xl font-bold p-2 hover:bg-white/20 rounded-full transition">←</button>
          <span className="font-semibold text-lg">Chi tiết món</span>
          <div className="w-8"></div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-32">
          {/* Hero Image */}
          <div className="h-64 bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center relative">
            {item.image ? (
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-8xl">🍽️</span>
            )}
          </div>

          {/* Item Info */}
          <div className="px-5 py-6 bg-white rounded-t-3xl -mt-6 relative z-0">
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-2xl font-bold text-dark">{item.name}</h1>
              <span className="text-2xl font-bold text-primary">{item.price.toLocaleString()}đ</span>
            </div>
            
            <div className="flex gap-4 mb-4 text-sm text-gray">
              <span className="flex items-center gap-1">⏰ {item.prepTimeMinutes || 15} min</span>
              <span className="flex items-center gap-1">⭐ 4.8 (24)</span>
            </div>

            <p className="text-gray-500 text-sm leading-relaxed mb-6 border-b border-light pb-6">
              {item.description || "Món ăn ngon tuyệt vời được chế biến từ những nguyên liệu tươi ngon nhất."}
            </p>

            {/* Modifiers Section */}
            <div className="space-y-6">
              {item.modifierGroups?.map(group => (
                <div key={group.id}>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-dark">{group.name}</h3>
                    <span className="text-xs bg-light text-gray px-2 py-1 rounded-full">
                      {group.isRequired ? 'Bắt buộc' : 'Tùy chọn'}
                    </span>
                  </div>
                  
                  <div className="bg-white rounded-xl border border-light overflow-hidden">
                    {group.options.map((opt, idx) => {
                      const isSelected = (selections[group.id] || []).includes(opt.id);
                      return (
                        <label 
                          key={opt.id}
                          className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                            isSelected ? 'bg-red-50' : 'hover:bg-gray-50'
                          } ${idx !== group.options.length - 1 ? 'border-b border-light' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? 'border-primary' : 'border-gray-300'
                            }`}>
                              {isSelected && <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>}
                            </div>
                            <span className={`font-medium ${isSelected ? 'text-primary' : 'text-gray-700'}`}>
                              {opt.name}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500 font-medium">
                            {opt.priceAdjustment > 0 ? `+${opt.priceAdjustment.toLocaleString()}đ` : ''}
                          </span>
                          <input 
                            type={group.selectionType === 'SINGLE' ? 'radio' : 'checkbox'}
                            name={group.id}
                            checked={isSelected}
                            onChange={() => handleSelect(group, opt.id)}
                            className="hidden"
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Note */}
              <div>
                <h3 className="font-bold text-dark mb-3">Ghi chú đặc biệt</h3>
                <textarea 
                  className="w-full p-4 border-2 border-light rounded-xl focus:border-primary outline-none text-sm min-h-[100px]"
                  placeholder="Ví dụ: Không hành, ít cay..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] border-t border-light flex gap-4 items-center">
          <div className="flex items-center gap-4 bg-gray-100 px-4 py-2 rounded-xl">
            <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="text-xl font-bold text-gray-600 w-6">-</button>
            <span className="font-bold text-dark w-4 text-center">{quantity}</span>
            <button onClick={() => setQuantity(q => q + 1)} className="text-xl font-bold text-primary w-6">+</button>
          </div>
          <button 
            onClick={handleConfirm}
            className="flex-1 bg-primary text-white font-bold py-3.5 rounded-xl shadow-lg shadow-red-200 active:scale-95 transition flex justify-between px-6"
          >
            <span>Thêm vào giỏ</span>
            <span>{totalPrice.toLocaleString()} đ</span>
          </button>
        </div>
      </div>
    </div>
  );
}