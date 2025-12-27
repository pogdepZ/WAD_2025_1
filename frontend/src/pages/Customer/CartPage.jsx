import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

export default function CartPage({ cartItems, setCartItems, onPlaceOrder, tableInfo }) {
  const navigate = useNavigate();

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const updateQty = (index, delta) => {
    const newCart = [...cartItems];
    newCart[index].quantity += delta;
    if (newCart[index].quantity <= 0) newCart.splice(index, 1);
    setCartItems(newCart);
  };

  const removeItem = (index) => {
    if(confirm("Xóa món này?")) {
      const newCart = [...cartItems];
      newCart.splice(index, 1);
      setCartItems(newCart);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6fa] flex justify-center font-sans">
      <div className="w-full max-w-md bg-[#f5f6fa] min-h-screen flex flex-col relative shadow-2xl">
        <Toaster />

        {/* Header */}
        <div className="bg-primary p-4 text-white flex justify-between items-center sticky top-0 z-10 shadow-md">
          <button onClick={() => navigate(-1)} className="text-2xl font-bold">←</button>
          <span className="font-bold text-lg">Giỏ hàng ({tableInfo?.name})</span>
          <div className="w-6"></div>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 overflow-y-auto pb-32">
          {cartItems.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <span className="text-6xl mb-4 block">🛒</span>
              <p>Giỏ hàng trống</p>
              <button onClick={() => navigate('/menu')} className="mt-4 text-primary font-bold">Quay lại Menu</button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl shadow-sm flex gap-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                     {item.item.image ? <img src={item.item.image} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center">🥘</div>}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-dark">{item.item.name}</h4>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                        {item.modifiers?.map(m => m.name).join(', ') || 'Không topping'}
                      </p>
                      {item.note && <p className="text-xs text-orange-500 italic mt-0.5">Note: {item.note}</p>}
                    </div>
                    <div className="flex justify-between items-end mt-2">
                      <span className="font-bold text-primary text-lg">{(item.price * item.quantity).toLocaleString()}đ</span>
                      
                      <div className="flex items-center gap-3">
                         <div className="flex items-center border border-gray-200 rounded-lg">
                            <button onClick={() => updateQty(idx, -1)} className="px-2 py-1 text-gray-600 font-bold">-</button>
                            <span className="px-1 text-sm font-bold">{item.quantity}</span>
                            <button onClick={() => updateQty(idx, 1)} className="px-2 py-1 text-primary font-bold">+</button>
                         </div>
                         <button onClick={() => removeItem(idx)} className="text-gray-400 hover:text-red-500">🗑️</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Summary */}
              <div className="bg-white p-5 rounded-xl shadow-sm mt-6">
                <h3 className="font-bold text-dark mb-4 border-b pb-2">Tổng kết</h3>
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-gray-500">Tạm tính</span>
                  <span className="font-medium">{total.toLocaleString()} đ</span>
                </div>
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-gray-500">Thuế (0%)</span>
                  <span className="font-medium">0 đ</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-dashed mt-2">
                  <span className="font-bold text-lg text-dark">Tổng cộng</span>
                  <span className="font-bold text-xl text-primary">{total.toLocaleString()} đ</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Action */}
        {cartItems.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-white p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
            <button 
              onClick={onPlaceOrder}
              className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-primary-dark transition"
            >
              Gửi Đơn Bếp ({total.toLocaleString()}đ)
            </button>
            <button onClick={() => navigate('/menu')} className="w-full mt-3 py-3 border-2 border-primary text-primary rounded-xl font-bold">
              + Gọi thêm món
            </button>
          </div>
        )}
      </div>
    </div>
  );
}