import { useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State quản lý đóng mở

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc muốn đăng xuất?")) {
      sessionStorage.clear();
      navigate("/login");
    }
  };

  const menuItems = [
    { path: "/admin/dashboard", label: "Thống kê" },
    { path: "/admin/tables", label: "Quản lý Bàn" },
    { path: "/admin/menu", label: "Quản lý Menu" },
    { path: "/admin/staff", label: "Nhân viên" },
    { path: "/admin/categories", label: "Danh Mục" },
    { path: "/admin/modifiers", label: "Danh mục món" }, 
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* 1. OVERLAY (Lớp mờ đen khi mở menu trên mobile) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)} // Bấm ra ngoài để đóng
        ></div>
      )}

      {/* 2. SIDEBAR (THANH NAV) */}
      <div
        className={`
        fixed md:static inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white flex flex-col transition-transform duration-300 ease-in-out
        ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }
      `}
      >
        {/* Header Sidebar */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-400">Smart Res</h1>
            <p className="text-xs text-gray-400 mt-1">Admin Portal</p>
          </div>
          {/* Nút đóng sidebar (chỉ hiện trên mobile) */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Menu Links */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)} // Chọn xong tự đóng menu
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-900/20 rounded transition group"
          >
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* 3. MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Bar Mobile (Chứa nút Hamburger) */}
        <div className="bg-white border-b p-4 flex items-center justify-between md:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-gray-600 hover:text-blue-600 p-1 rounded focus:bg-gray-100"
            >
              {/* Icon 3 vạch (Hamburger) */}
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <span className="font-bold text-gray-800 text-lg">
              Smart Restaurant
            </span>
          </div>
          {/* Avatar nhỏ (Optional) */}
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs border border-blue-200">
            AD
          </div>
        </div>

        {/* Nội dung chính */}
        <div className="flex-1 overflow-auto p-0 md:p-0 relative">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
