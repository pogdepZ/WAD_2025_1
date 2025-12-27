import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import toast, { Toaster } from "react-hot-toast";
import api from "../../services/api";

const socket = io("http://localhost:5000");

export default function KitchenDashboard() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    socket.emit("join_room", "kitchen_room");

    // Nghe đơn hàng mới được Waiter duyệt
    socket.on("kitchen_new_order", (order) => {
      toast("👨‍🍳 Có món mới cần làm!", { icon: "🔥" });
      const audio = new Audio("/notification.mp3");
      audio.play().catch((e) => console.log("Trình duyệt chặn autoplay"));
      setOrders((prev) => [...prev, order]);
    });

    // Load danh sách đơn đang chờ làm (Todo: Cần API getAcceptedOrders)

    return () => socket.off("kitchen_new_order");
  }, []);

  const handleDone = async (orderId) => {
    try {
      // Đổi trạng thái sang READY
      await api.put(`/orders/${orderId}/status`, { status: "READY" });
      toast.success("Món đã xong! Gọi phục vụ.");
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (error) {
      toast.error("Lỗi cập nhật");
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <Toaster position="top-right" />
      <h1 className="text-3xl font-bold mb-6 text-yellow-400">
        🔥 KDS - Màn Hình Bếp
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {orders.length === 0 && (
          <p className="text-gray-500 italic col-span-full text-center mt-10">
            Bếp đang rảnh...
          </p>
        )}

        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-gray-800 p-4 rounded-lg shadow border border-gray-700"
          >
            <div className="flex justify-between items-center border-b border-gray-600 pb-2 mb-2">
              <h2 className="text-xl font-bold text-white">
                {order.session?.table?.name}
              </h2>
              <span className="text-xs bg-blue-600 px-2 py-1 rounded">Mới</span>
            </div>

            <div className="space-y-3 mb-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-lg">
                  <span className="font-bold text-yellow-300">
                    {item.quantity}
                  </span>
                  <span className="flex-1 ml-2">{item.menuItem?.name}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleDone(order.id)}
              className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 text-lg"
            >
              XONG / GỌI PHỤC VỤ
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
