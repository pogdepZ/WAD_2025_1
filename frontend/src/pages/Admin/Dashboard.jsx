import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({ 
    totalRevenue: 0, 
    totalOrders: 0, 
    topItems: [] 
  });

  // Mock data cho biểu đồ (Vì backend chưa có API lịch sử theo ngày)
  const chartData = [
    { day: 'Mon', value: 60 },
    { day: 'Tue', value: 75 },
    { day: 'Wed', value: 45 },
    { day: 'Thu', value: 90 },
    { day: 'Fri', value: 85 },
    { day: 'Sat', value: 100 },
    { day: 'Sun', value: 70 },
  ];

  // Mock data cho đơn hàng gần đây
  const recentOrders = [
    { id: '#ORD-0048', table: 'Table 5', items: '3 items', total: 67500, status: 'PREPARING', time: '2 min ago' },
    { id: '#ORD-0047', table: 'Table 12', items: '5 items', total: 124000, status: 'PREPARING', time: '8 min ago' },
    { id: '#ORD-0046', table: 'Table 3', items: '2 items', total: 45000, status: 'READY', time: '15 min ago' },
    { id: '#ORD-0045', table: 'Table 8', items: '4 items', total: 89000, status: 'COMPLETED', time: '25 min ago' },
  ];

  useEffect(() => {
    api.get('/dashboard').then(res => setStats(res.data));
  }, []);

  // Helper chọn màu badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'PREPARING': return 'bg-blue-100 text-blue-700';
      case 'READY': return 'bg-orange-100 text-orange-700';
      case 'COMPLETED': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 md:p-8 bg-[#f5f6fa] min-h-screen font-sans text-[#2c3e50]">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2c3e50]">Dashboard</h1>
          <p className="text-[#7f8c8d] text-sm mt-1">Chào mừng trở lại! Dưới đây là tình hình hôm nay.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/kitchen/kds" className="px-4 py-2.5 bg-white border border-gray-200 text-[#2c3e50] font-semibold rounded-xl hover:bg-gray-50 transition shadow-sm flex items-center gap-2">
            📺 Mở KDS
          </Link>
          <Link to="/menu" className="px-4 py-2.5 bg-[#e74c3c] text-white font-semibold rounded-xl hover:bg-[#c0392b] transition shadow-lg shadow-red-200 flex items-center gap-2">
            + Đơn Mới
          </Link>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Card 1: Doanh thu */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
          <div>
            <div className="text-2xl font-bold text-[#2c3e50] mb-1">
              {stats.totalRevenue.toLocaleString()} đ
            </div>
            <div className="text-[#7f8c8d] text-sm font-medium">Doanh thu hôm nay</div>
            <div className="text-green-500 text-xs font-bold mt-2">↑ 12% so với hôm qua</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#e8f8f5] text-[#27ae60] flex items-center justify-center text-xl">
            💰
          </div>
        </div>

        {/* Card 2: Đơn hàng */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
          <div>
            <div className="text-2xl font-bold text-[#2c3e50] mb-1">
              {stats.totalOrders}
            </div>
            <div className="text-[#7f8c8d] text-sm font-medium">Tổng đơn hàng</div>
            <div className="text-green-500 text-xs font-bold mt-2">↑ 8% so với hôm qua</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#ebf5fb] text-[#3498db] flex items-center justify-center text-xl">
            📦
          </div>
        </div>

        {/* Card 3: Bàn đang ngồi (Mock) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
          <div>
            <div className="text-2xl font-bold text-[#2c3e50] mb-1">12/20</div>
            <div className="text-[#7f8c8d] text-sm font-medium">Bàn đang hoạt động</div>
            <div className="text-gray-400 text-xs font-bold mt-2">60% công suất</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#fef9e7] text-[#f39c12] flex items-center justify-center text-xl">
            🪑
          </div>
        </div>

        {/* Card 4: Thời gian chờ (Mock) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
          <div>
            <div className="text-2xl font-bold text-[#2c3e50] mb-1">18 min</div>
            <div className="text-[#7f8c8d] text-sm font-medium">TB thời gian món</div>
            <div className="text-red-500 text-xs font-bold mt-2">↑ 2 min so với mục tiêu</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#fdedec] text-[#e74c3c] flex items-center justify-center text-xl">
            ⏳
          </div>
        </div>
      </div>

      {/* CHARTS & TOP ITEMS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* REVENUE CHART */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-[#2c3e50]">Doanh thu tuần này</h3>
            <select className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-1 outline-none text-[#7f8c8d]">
              <option>Tuần này</option>
              <option>Tuần trước</option>
            </select>
          </div>
          
          {/* Chart Bars Visual */}
          <div className="flex items-end justify-between h-48 px-2 gap-4">
            {chartData.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center w-full group cursor-pointer">
                <div 
                  className={`w-full rounded-t-lg transition-all duration-300 relative group-hover:opacity-80 ${idx === 5 ? 'bg-[#e74c3c]' : 'bg-[#ecf0f1]'}`}
                  style={{ height: `${item.value}%` }}
                >
                  {/* Tooltip */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition">
                    {item.value}%
                  </div>
                </div>
                <span className={`text-xs mt-3 font-medium ${idx === 5 ? 'text-[#e74c3c]' : 'text-[#95a5a6]'}`}>
                  {item.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* TOP SELLING ITEMS */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-[#2c3e50]">Món bán chạy</h3>
            <Link to="/admin/menu" className="text-sm text-blue-500 hover:underline">Xem tất cả</Link>
          </div>

          <div className="space-y-5">
            {stats.topItems.length > 0 ? stats.topItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                  {idx + 1}
                </span>
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xl">
                  🍽️
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm text-[#2c3e50]">{item.name}</div>
                  <div className="text-xs text-[#7f8c8d]">{item.quantity} orders</div>
                </div>
              </div>
            )) : (
              <p className="text-sm text-gray-400 italic">Chưa có dữ liệu...</p>
            )}
          </div>
        </div>
      </div>

      {/* RECENT ORDERS TABLE */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-[#2c3e50]">Đơn hàng gần đây</h3>
          <Link to="/kitchen" className="text-sm text-blue-500 hover:underline font-medium">Xem tất cả →</Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[#95a5a6] text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="pb-3 font-semibold">Mã đơn</th>
                <th className="pb-3 font-semibold">Bàn</th>
                <th className="pb-3 font-semibold">Số lượng</th>
                <th className="pb-3 font-semibold">Tổng tiền</th>
                <th className="pb-3 font-semibold">Trạng thái</th>
                <th className="pb-3 font-semibold">Thời gian</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {/* Dữ liệu giả lập để giống UI mẫu */}
              {recentOrders.map((order, idx) => (
                <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition-colors last:border-0">
                  <td className="py-4 font-bold text-[#2c3e50]">{order.id}</td>
                  <td className="py-4 text-[#7f8c8d]">{order.table}</td>
                  <td className="py-4 text-[#7f8c8d]">{order.items}</td>
                  <td className="py-4 font-semibold text-[#2c3e50]">{order.total.toLocaleString()} đ</td>
                  <td className="py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 text-[#95a5a6] text-xs">{order.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}