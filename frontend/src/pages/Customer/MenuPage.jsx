import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import api from "../../services/api";
import PaymentModal from "../../components/PaymentModal";
import ModifierModal from "../../components/ModifierModal";

export default function MenuPage() {
  const [categories, setCategories] = useState([]);
  const [tableInfo, setTableInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // State Giỏ hàng (Mảng các món đã chọn kèm topping)
  const [cartItems, setCartItems] = useState([]);

  // State Modal
  const [showPayment, setShowPayment] = useState(false);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);

  const navigate = useNavigate();

  // 1. Load Data
  useEffect(() => {
    const storedTable = localStorage.getItem("tableInfo");
    if (!storedTable) {
      toast.error("Vui lòng quét mã QR trên bàn!");
      navigate("/"); 
      return;
    }
    setTableInfo(JSON.parse(storedTable));
    api.get("/menu").then((res) => setCategories(res.data));
  }, []);

  // 2. Logic Thêm vào giỏ
  const handleItemClick = (item) => {
    // Nếu món có Topping -> Mở Modal chọn
    if (item.modifierGroups && item.modifierGroups.length > 0) {
      setSelectedItem(item);
    } else {
      // Nếu không có Topping -> Thêm luôn
      addItemToCart(item, [], item.price);
    }
  };

  const addItemToCart = (item, modifiers, finalPrice) => {
    const newCartItem = {
      cartId: Date.now() + Math.random(),
      item: item,
      modifiers: modifiers,
      price: finalPrice,
      quantity: 1,
    };
    setCartItems((prev) => [...prev, newCartItem]);
    setSelectedItem(null);
    toast.success(`Đã thêm ${item.name}`);
  };

  // 3. Tính toán
  const cartTotal = cartItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const totalQty = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  // 4. Gửi đơn hàng (API)
  const handlePlaceOrder = async () => {
    if (!tableInfo || cartItems.length === 0) return;
    if (!window.confirm(`Xác nhận gọi ${totalQty} món?`)) return;

    setLoading(true);
    try {
      const orderItemsPayload = cartItems.map(cartItem => {
        const modifierNote = cartItem.modifiers?.map(m => m.name).join(', ') || '';
        return {
          menuItemId: cartItem.item.id,
          quantity: cartItem.quantity,
          note: modifierNote 
        };
      });

      await api.post("/orders", {
        tableId: tableInfo.id,
        items: orderItemsPayload,
      });

      toast.success("Đã gửi đơn! Vui lòng đợi...");
      setCartItems([]); // Xóa giỏ hàng sau khi gửi thành công
    } catch (error) {
      console.error(error);
      toast.error("Lỗi đặt món. Thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // 5. Yêu cầu thanh toán (API Preview)
  const handleRequestPayment = async () => {
    try {
      const res = await api.post("/orders/preview", { tableId: tableInfo.id });
      if (res.data.total > 0) {
        setSessionTotal(res.data.total);
        setShowPayment(true);
      } else {
        toast.error("Chưa có món nào được duyệt để thanh toán!");
      }
    } catch (err) {
      toast.error("Lỗi lấy hóa đơn");
    }
  };

  // 6. Xác nhận thanh toán (API Checkout)
  const handleConfirmPayment = async (method) => {
    try {
      setLoading(true);
      await api.post("/orders/checkout", {
        tableId: tableInfo.id,
        paymentMethod: method,
      });
      toast.success("Thanh toán thành công!");
      setShowPayment(false);
      localStorage.removeItem("tableInfo");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      toast.error("Lỗi thanh toán");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-32">
      <Toaster position="top-center" />

      {/* HEADER: Tên bàn + Nút Thanh Toán */}
      <div className="bg-white p-4 shadow sticky top-0 z-10 flex justify-between items-center">
        <div>
          <h1 className="font-bold text-lg text-gray-800">
            🍽 {tableInfo?.name || "Khách"}
          </h1>
          <p className="text-xs text-gray-500">Chúc quý khách ngon miệng!</p>
        </div>
        <button
          onClick={handleRequestPayment}
          className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-bold border border-red-200 hover:bg-red-100 transition shadow-sm"
        >
          💰 Thanh toán
        </button>
      </div>

      {/* DANH SÁCH MÓN ĂN */}
      <div className="p-4 space-y-6">
        {categories.map((cat) => (
          <div key={cat.id}>
            <h2 className="font-bold text-xl mb-3 text-blue-600 border-l-4 border-blue-600 pl-2">
              {cat.name}
            </h2>
            <div className="space-y-4">
              {cat.items.map((item) => (
                <div key={item.id} className="bg-white p-3 rounded-lg shadow flex gap-3">
                  {/* Ảnh */}
                  <div className="w-24 h-24 bg-gray-200 rounded-md flex-shrink-0 overflow-hidden">
                    {item.image ? (
                      <img src={item.image} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🥘</div>
                    )}
                  </div>

                  {/* Thông tin */}
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <h3 className="font-bold text-gray-800 line-clamp-1">{item.name}</h3>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1">{item.description}</p>
                    </div>
                    
                    <div className="flex justify-between items-end mt-2">
                      <span className="font-bold text-blue-600">
                        {item.price.toLocaleString()}đ
                      </span>
                      
                      {item.status === 'AVAILABLE' ? (
                        <button
                          onClick={() => handleItemClick(item)}
                          className="bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-bold active:scale-95 transition shadow"
                        >
                          + Thêm
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded">Hết hàng</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* THANH GIỎ HÀNG (Floating Bottom Bar) */}
      {totalQty > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-2xl z-50 animate-slide-up">
          <div className="max-w-md mx-auto flex justify-between items-center">
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="text-3xl">🛒</span>
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {totalQty}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Tạm tính</p>
                <p className="text-lg font-bold text-gray-800">{cartTotal.toLocaleString()} đ</p>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-green-700 disabled:bg-gray-400 transition flex items-center gap-2"
            >
              {loading ? 'Đang gửi...' : 'GỌI MÓN ➔'}
            </button>
          </div>
        </div>
      )}

      {/* MODAL CHỌN TOPPING */}
      {selectedItem && (
        <ModifierModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onConfirm={(mods, price) => addItemToCart(selectedItem, mods, price)}
        />
      )}

      {/* MODAL THANH TOÁN */}
      {showPayment && (
        <PaymentModal
          tableInfo={tableInfo}
          total={sessionTotal}
          onClose={() => setShowPayment(false)}
          onConfirm={handleConfirmPayment}
        />
      )}
    </div>
  );
}