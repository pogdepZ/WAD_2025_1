import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast';
import api from '../../services/api';

// Kết nối Socket
const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');

export default function WaiterDashboard() {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('PENDING'); // PENDING, ACCEPTED, READY, SERVED

  useEffect(() => {
    socket.emit('join_room', 'waiter_room');

    // Load đơn cũ (Mock API hoặc gọi thật)
    // api.get('/orders?status=PENDING').then(res => setOrders(res.data));

    // Lắng nghe đơn mới
    socket.on('new_order', (newOrder) => {
      toast('🔔 Có đơn hàng mới!', { icon: '🍔' });
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {});
      setOrders(prev => [newOrder, ...prev]);
    });

    // Lắng nghe bếp báo xong món
    socket.on('kitchen_order_ready', (order) => {
      toast('👨‍🍳 Món đã xong!', { icon: '✅' });
      // Cập nhật trạng thái local
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'READY' } : o));
    });

    return () => {
      socket.off('new_order');
      socket.off('kitchen_order_ready');
    };
  }, []);

  // Xử lý chuyển trạng thái
  const handleUpdateStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      toast.success(status === 'ACCEPTED' ? 'Đã chuyển bếp' : status === 'SERVED' ? 'Đã phục vụ' : 'Đã từ chối');
      
      // Cập nhật UI ngay lập tức
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    } catch (error) {
      toast.error("Lỗi cập nhật");
    }
  };

  // Lọc đơn theo Tab
  const filteredOrders = orders.filter(o => {
    if (activeTab === 'PENDING') return o.status === 'PENDING';
    if (activeTab === 'ACCEPTED') return o.status === 'ACCEPTED' || o.status === 'PREPARING';
    if (activeTab === 'READY') return o.status === 'READY';
    return false;
  });

  return (
    <div className="bg-[#f5f6fa] min-h-screen font-sans pb-20 max-w-md mx-auto shadow-2xl relative">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="bg-gradient-to-br from-[#6c5ce7] to-[#a29bfe] text-white p-5 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <div>
          <h1 className="text-xl font-bold">Waiter Dashboard</h1>
          <p className="text-xs text-white/80">Shift: Lunch | Table: 5/20</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative cursor-pointer">
            <span className="text-2xl">🔔</span>
            <span className="absolute -top-1 -right-1 bg-[#e74c3c] w-3 h-3 rounded-full border-2 border-[#6c5ce7]"></span>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold border-2 border-white/30">
            TN
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex bg-white border-b border-gray-200 sticky top-[72px] z-40">
        {[
          { id: 'PENDING', label: 'Pending', count: orders.filter(o => o.status === 'PENDING').length },
          { id: 'ACCEPTED', label: 'In Kitchen', count: orders.filter(o => ['ACCEPTED', 'PREPARING'].includes(o.status)).length },
          { id: 'READY', label: 'Ready', count: orders.filter(o => o.status === 'READY').length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-4 text-sm font-medium relative transition-colors ${
              activeTab === tab.id ? 'text-[#6c5ce7]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] text-white ${activeTab === tab.id ? 'bg-[#e74c3c]' : 'bg-gray-400'}`}>
                {tab.count}
              </span>
            )}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#6c5ce7] rounded-t-full"></div>
            )}
          </button>
        ))}
      </div>

      {/* ORDERS LIST */}
      <div className="p-4 space-y-4">
        {filteredOrders.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <span className="text-4xl block mb-2">📭</span>
            <p>Không có đơn hàng nào</p>
          </div>
        )}

        {filteredOrders.map(order => (
          <div 
            key={order.id} 
            className={`bg-white rounded-xl shadow-sm overflow-hidden border-l-4 transition-all hover:shadow-md ${
              order.status === 'PENDING' ? 'border-[#e74c3c] animate-pulse-slow' : 
              order.status === 'READY' ? 'border-[#27ae60]' : 'border-[#3498db]'
            }`}
          >
            {/* Order Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-start">
              <div className="flex gap-3">
                <div className="bg-[#6c5ce7] text-white w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shadow-lg shadow-indigo-200">
                  {order.session?.table?.name || 'T?'}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Order #{order.id}</h3>
                  <p className="text-xs text-gray-500">{order.items.length} món • 2 phút trước</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                order.status === 'PENDING' ? 'bg-[#fff3cd] text-[#856404]' :
                order.status === 'READY' ? 'bg-[#d4edda] text-[#155724]' :
                'bg-[#cce5ff] text-[#004085]'
              }`}>
                {order.status}
              </span>
            </div>

            {/* Order Items */}
            <div className="p-4 space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start text-sm">
                  <div className="flex gap-2">
                    <span className="bg-gray-100 px-2 rounded font-bold text-gray-600 h-fit">x{item.quantity}</span>
                    <div>
                      <p className="font-medium text-gray-800">{item.menuItem?.name}</p>
                      {item.note && <p className="text-[#e67e22] text-xs italic mt-0.5">📝 {item.note}</p>}
                    </div>
                  </div>
                  <span className="font-semibold text-gray-500">{(item.menuItem?.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Actions Footer */}
            {activeTab === 'PENDING' && (
              <div className="p-3 bg-gray-50 flex gap-2">
                <button 
                  onClick={() => handleUpdateStatus(order.id, 'REJECTED')}
                  className="flex-1 py-2.5 border-2 border-[#e74c3c] text-[#e74c3c] rounded-lg font-bold hover:bg-red-50 text-sm transition"
                >
                  Reject
                </button>
                <button 
                  onClick={() => handleUpdateStatus(order.id, 'ACCEPTED')}
                  className="flex-[2] py-2.5 bg-[#27ae60] text-white rounded-lg font-bold hover:bg-[#219150] text-sm shadow-md shadow-green-200 transition"
                >
                  Accept & Send Kitchen
                </button>
              </div>
            )}

            {activeTab === 'ACCEPTED' && (
              <div className="p-3 bg-gray-50 text-center">
                <button className="w-full py-2.5 bg-[#3498db] text-white rounded-lg font-bold text-sm shadow-md opacity-80 cursor-default">
                  ⏳ Cooking in Kitchen...
                </button>
              </div>
            )}

            {activeTab === 'READY' && (
              <div className="p-3 bg-green-50 flex gap-2">
                <button 
                  onClick={() => handleUpdateStatus(order.id, 'SERVED')}
                  className="w-full py-2.5 bg-[#27ae60] text-white rounded-lg font-bold hover:bg-[#219150] text-sm shadow-md transition"
                >
                  ✅ Mark as Served
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}