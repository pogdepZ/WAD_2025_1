import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // 1. Chưa đăng nhập -> Đá về Login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. Có đăng nhập nhưng sai quyền -> Đá về trang chủ hoặc báo lỗi
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    alert("Bạn không có quyền truy cập trang này!");
    return <Navigate to="/" replace />;
  }

  // 3. OK -> Cho vào
  return <Outlet />;
};

export default ProtectedRoute;