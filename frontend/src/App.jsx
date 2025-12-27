import { Routes, Route, Link } from "react-router-dom";
import MenuManagement from "./pages/Admin/MenuManagement.jsx";
import TableManagement from "./pages/Admin/TableManagement";
import ScanQR from "./pages/Customer/ScanQR";
import PrintQRPage from "./pages/Admin/PrintQRPage";
import WaiterDashboard from "./pages/Waiter/WaiterDashboard";
import MenuPage from "./pages/Customer/MenuPage.jsx";
// import KitchenDashboard from "./pages/Kitchen/KitchenDashboard"; // (Cái này cũ rồi, dùng KDS mới)
import LoginPage from "./pages/Auth/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Admin/Dashboard.jsx";
import StaffManagement from "./pages/Admin/StaffManagement.jsx";
import AdminLayout from "./pages/Admin/components/AdminLayout.jsx";
import HomePage from "./pages/HomePage";
import KitchenKDS from "./pages/Kitchen/KitchenKDS";
import CategoryManagement from './pages/Admin/CategoryManagement';
import ModifierManagement from "./pages/Admin/ModifierManagement.jsx";

function App() {
  return (
    <Routes>
      {/* --- PUBLIC ROUTES --- */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/scan/:token" element={<ScanQR />} />
      <Route path="/menu" element={<MenuPage />} />

      {/* --- ADMIN ROUTES (Bảo vệ 2 lớp: Role Admin + Layout Admin) --- */}
      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/menu" element={<MenuManagement />} />
          <Route path="/admin/tables" element={<TableManagement />} />
          <Route path="/admin/staff" element={<StaffManagement />} />
          <Route path="/admin/categories" element={<CategoryManagement />} />
          <Route path="/admin/modifiers" element={<ModifierManagement />} />
        </Route>
        {/* Trang in nằm ngoài Layout nhưng vẫn cần quyền Admin */}
        <Route path="/print-qr/:id" element={<PrintQRPage />} />
      </Route>

      {/* --- WAITER ROUTES --- */}
      <Route element={<ProtectedRoute allowedRoles={["ADMIN", "WAITER"]} />}>
        <Route path="/waiter" element={<WaiterDashboard />} />
      </Route>

      {/* --- KITCHEN ROUTES (Sửa lỗi ở đây) --- */}
      {/* Chúng ta bọc Route KDS bên trong ProtectedRoute thay vì nhét vào element */}
      <Route element={<ProtectedRoute allowedRoles={["ADMIN", "KITCHEN"]} />}>
        <Route path="/kitchen/kds" element={<KitchenKDS />} />
      </Route>

    </Routes>
  );
}

export default App;