import axios from "axios";

// 1. Cấu hình URL (Tự động nhận diện Localhost hoặc Vercel)
const baseURL = import.meta.env.VITE_API_URL || "/api";

// 2. Tạo Instance Axios
const api = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 3. Tự động gắn Token vào mọi request (QUAN TRỌNG CHO ADMIN)
api.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage (vì ở bước trước ta đã chốt dùng localStorage)
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- SERVICE: BÀN & QR ---
export const tableService = {
  getTables: () => api.get("/tables"),
  createTable: (data) => api.post("/tables", data),
  updateTable: (id, data) => api.put(`/tables/${id}`, data),
  regenerateQR: (id) => api.post(`/tables/${id}/regenerate`),
  regenerateAll: () => api.post("/tables/regenerate-all"),
  verifyQR: (token) => api.post("/tables/verify", { token }),
  // Hàm tải file zip (cần responseType blob)
  downloadAll: () => api.get("/tables/download-zip", { responseType: "blob" }),
};

// --- SERVICE: XÁC THỰC ---
export const authService = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
};

// --- SERVICE: MENU (CẬP NHẬT MỚI) ---
export const menuService = {
  // Guest View (Lấy full menu gộp)
  getMenu: () => api.get("/menu"),

  // Category Management (CRUD)
  getCategories: () => api.get("/menu/categories"),
  createCategory: (data) => api.post("/menu/categories", data),
  updateCategory: (id, data) => api.put(`/menu/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/menu/categories/${id}`),

  // Item Management
  createItem: (data) => api.post("/menu/items", data),
  deleteItem: (id) => api.delete(`/menu/items/${id}`), // Gọi vào API Soft Delete
  updateItem: (id, data) => api.put(`/menu/items/${id}`, data),
  // (Sau này thêm updateItem, deleteItem ở đây)
};

// --- SERVICE: ĐƠN HÀNG (Dùng cho Khách & Waiter) ---
// (Bạn có thể thêm vào nếu chưa có)
export const orderService = {
  createOrder: (data) => api.post("/orders", data),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  checkout: (data) => api.post("/orders/checkout", data),
  preview: (data) => api.post("/orders/preview", data),
};

export default api;
