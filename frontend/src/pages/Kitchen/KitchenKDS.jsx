import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import toast, { Toaster } from "react-hot-toast";
import api from "../../services/api";

// Kết nối socket
const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000");

export default function KitchenKDS() {
  const [orders, setOrders] = useState([]);
  const [time, setTime] = useState(new Date());

  // Đồng hồ
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Socket & Load Data
  useEffect(() => {
    socket.emit("join_room", "kitchen_room");

    // Load đơn cũ (Mock API call - bạn cần implement API này sau)
    // api.get("/kitchen/orders").then(res => setOrders(res.data));

    // Nghe đơn mới
    socket.on("kitchen_new_order", (newOrder) => {
      toast("🔔 New Order!", {
        style: { background: "#333", color: "#fff" },
      });
      setOrders((prev) => [...prev, newOrder]);
    });

    return () => socket.off("kitchen_new_order");
  }, []);

  // Xử lý chuyển trạng thái
  const updateStatus = async (orderId, newStatus) => {
    try {
      // await api.put(`/orders/${orderId}/status`, { status: newStatus });
      // Giả lập update local cho mượt
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      toast.success(`Order #${orderId} moved to ${newStatus}`);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  // Phân loại đơn hàng vào cột
  const pendingOrders = orders.filter((o) => o.status === "ACCEPTED"); // Received
  const preparingOrders = orders.filter((o) => o.status === "PREPARING");
  const readyOrders = orders.filter((o) => o.status === "READY");

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-white font-sans flex flex-col overflow-hidden">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="bg-[#16213e] px-6 py-4 flex justify-between items-center border-b-2 border-[#e74c3c] shadow-lg z-10">
        <div className="flex items-center gap-3 text-xl font-bold">
          <span className="text-3xl">👨‍🍳</span>
          <span>KITCHEN DISPLAY</span>
        </div>

        {/* Stats Summary */}
        <div className="flex gap-8">
          <StatBox label="Pending" value={pendingOrders.length} color="text-yellow-500" />
          <StatBox label="Cooking" value={preparingOrders.length} color="text-blue-400" />
          <StatBox label="Ready" value={readyOrders.length} color="text-green-500" />
        </div>

        <div className="text-2xl font-mono font-bold tracking-widest">
          {time.toLocaleTimeString("en-GB", { hour12: false })}
        </div>

        <div className="flex gap-3">
          <button className="bg-[#34495e] px-4 py-2 rounded font-bold hover:bg-[#2c3e50] transition">
            ⚙️ Config
          </button>
          <button 
            onClick={() => window.location.href = '/admin/dashboard'}
            className="bg-[#e74c3c] px-4 py-2 rounded font-bold hover:bg-[#c0392b] transition"
          >
            Exit
          </button>
        </div>
      </div>

      {/* COLUMNS CONTAINER */}
      <div className="flex flex-1 overflow-x-auto p-4 gap-4">
        
        {/* COLUMN 1: RECEIVED (ACCEPTED) */}
        <Column 
          title="Received" 
          count={pendingOrders.length} 
          color="bg-[#f39c12]"
        >
          {pendingOrders.map((order) => (
            <OrderCard key={order.id} order={order} type="received" onAction={updateStatus} />
          ))}
          {/* Mockup Card */}
          <OrderCard 
            order={{ id: 51, table: { name: 'Table 8' }, items: [{ name: 'Grilled Salmon', quantity: 1, note: 'Large' }, { name: 'Soup', quantity: 2 }] }} 
            type="received" 
            onAction={() => {}} 
          />
        </Column>

        {/* COLUMN 2: PREPARING */}
        <Column 
          title="Preparing" 
          count={preparingOrders.length} 
          color="bg-[#3498db]"
        >
          {preparingOrders.map((order) => (
            <OrderCard key={order.id} order={order} type="preparing" onAction={updateStatus} />
          ))}
          {/* Mockup Card Urgent */}
          <OrderCard 
            order={{ id: 45, table: { name: 'Table 12' }, isUrgent: true, items: [{ name: 'Beef Steak', quantity: 2 }, { name: 'Veg', quantity: 2 }] }} 
            type="preparing" 
            onAction={() => {}} 
          />
        </Column>

        {/* COLUMN 3: READY */}
        <Column 
          title="Ready" 
          count={readyOrders.length} 
          color="bg-[#27ae60]"
        >
          {readyOrders.map((order) => (
            <OrderCard key={order.id} order={order} type="ready" onAction={updateStatus} />
          ))}
          {/* Mockup Card */}
          <OrderCard 
            order={{ id: 47, table: { name: 'Table 1' }, items: [{ name: 'Salad', quantity: 1 }] }} 
            type="ready" 
            onAction={() => {}} 
          />
        </Column>

      </div>
    </div>
  );
}

// --- SUB COMPONENTS ---

const StatBox = ({ label, value, color }) => (
  <div className="text-center">
    <div className={`text-2xl font-bold ${color}`}>{value}</div>
    <div className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</div>
  </div>
);

const Column = ({ title, count, color, children }) => (
  <div className="flex-1 min-w-[320px] flex flex-col bg-[#16213e] rounded-xl overflow-hidden shadow-xl border border-[#2c3e50]">
    {/* Header Cột */}
    <div className={`${color} p-3 flex justify-between items-center text-[#1a1a2e]`}>
      <h3 className="font-extrabold uppercase tracking-wider">{title}</h3>
      <span className="bg-black/20 px-2 py-0.5 rounded-full text-sm font-bold">{count}</span>
    </div>
    {/* Body Cột */}
    <div className="flex-1 p-3 overflow-y-auto space-y-3 custom-scrollbar">
      {children}
    </div>
  </div>
);

const OrderCard = ({ order, type, onAction }) => {
  const isUrgent = order.isUrgent; // Logic check time sau này thêm vào

  return (
    <div className={`bg-[#1a1a2e] rounded-lg border-l-4 overflow-hidden shadow-md transition hover:translate-y-[-2px] ${isUrgent ? 'border-[#e74c3c] animate-pulse-border' : 'border-[#3498db]'}`}>
      
      {/* Card Header */}
      <div className="bg-white/5 p-3 flex justify-between items-center">
        <span className="text-xl font-bold">#{order.id}</span>
        <span className="bg-[#e74c3c] px-2 py-1 rounded text-xs font-bold">{order.table?.name}</span>
      </div>

      {isUrgent && (
        <div className="bg-[#e74c3c] text-white text-xs font-bold px-3 py-1">
          ⚠️ OVERDUE - Urgent!
        </div>
      )}

      {/* Items List */}
      <div className="p-3 space-y-3">
        {order.items?.map((item, idx) => (
          <div key={idx} className="flex gap-3 border-b border-white/10 pb-2 last:border-0 last:pb-0">
            <span className="bg-[#e74c3c] w-8 h-8 flex items-center justify-center rounded font-bold text-lg shrink-0">
              {item.quantity}
            </span>
            <div>
              <div className="font-semibold text-lg leading-tight">{item.name}</div>
              {item.note && <div className="text-[#f39c12] text-sm italic mt-1">📝 {item.note}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Buttons */}
      <div className="p-3 bg-white/5 flex gap-2">
        {type === 'received' && (
          <button 
            onClick={() => onAction(order.id, 'PREPARING')}
            className="flex-1 bg-[#27ae60] py-2 rounded font-bold hover:bg-[#219150]"
          >
            Start Cook
          </button>
        )}
        {type === 'preparing' && (
          <button 
            onClick={() => onAction(order.id, 'READY')}
            className="flex-1 bg-[#27ae60] py-2 rounded font-bold hover:bg-[#219150]"
          >
            Mark Ready
          </button>
        )}
        {type === 'ready' && (
          <button 
            className="flex-1 bg-[#3498db] py-2 rounded font-bold hover:bg-[#2980b9]"
          >
            Bump (Hide)
          </button>
        )}
      </div>
    </div>
  );
};