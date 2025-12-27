import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      
      {/* --- 1. HEADER (NAVBAR) --- */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-4xl">🍕</span>
            <span className="text-2xl font-extrabold text-gray-900 tracking-tighter">
              Smart<span className="text-orange-500">Res</span>
            </span>
          </div>

          {/* Nút Đăng nhập */}
          <Link 
            to="/login"
            className="bg-gray-900 text-white px-6 py-2.5 rounded-full font-bold hover:bg-orange-500 transition-colors duration-300 shadow-lg shadow-orange-500/20"
          >
            Đăng nhập Nội bộ →
          </Link>
        </div>
      </nav>

      {/* --- 2. HERO SECTION (BANNER) --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Text Content */}
          <div className="space-y-8 animate-fade-in-up">
            <h1 className="text-5xl lg:text-7xl font-black leading-tight text-gray-900">
              Cách gọi món <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
                Thông Minh Nhất
              </span>
            </h1>
            <p className="text-xl text-gray-500 leading-relaxed max-w-lg">
              Quét QR, chọn món và thanh toán chỉ trong 3 giây. Giải pháp công nghệ tối ưu cho nhà hàng hiện đại 4.0.
            </p>
            <div className="flex gap-4">
              <button onClick={() => alert("Liên hệ demo: 0909...")} className="bg-orange-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-orange-600 transition shadow-xl shadow-orange-500/30">
                Đăng ký dùng thử
              </button>
              <a href="#features" className="px-8 py-4 rounded-full font-bold text-gray-600 border border-gray-200 hover:border-gray-400 hover:text-gray-900 transition">
                Tìm hiểu thêm
              </a>
            </div>
          </div>

          {/* Image Hero */}
          <div className="relative">
            {/* Hình tròn trang trí nền */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-100 rounded-full blur-3xl -z-10 opacity-50"></div>
            
            <img 
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop" 
              alt="Delicious Food"
              className="rounded-3xl shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 border-8 border-white"
            />
            
            {/* Floating Card */}
            <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4 animate-bounce-slow">
              <div className="bg-green-100 p-3 rounded-full text-2xl">🚀</div>
              <div>
                <p className="font-bold text-gray-900">Tốc độ phục vụ</p>
                <p className="text-green-600 font-bold text-sm">Tăng 300%</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- 3. FEATURES (TÍNH NĂNG) --- */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-orange-500 font-bold uppercase tracking-widest text-sm mb-2">Tính năng vượt trội</h2>
            <h3 className="text-4xl font-black text-gray-900">Quy trình "Không Chạm"</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition duration-300 border border-gray-100">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-3xl mb-6">📱</div>
              <h4 className="text-xl font-bold mb-3">Quét QR Gọi Món</h4>
              <p className="text-gray-500">Khách hàng tự chủ động xem menu và gọi món ngay tại bàn, không cần chờ nhân viên.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition duration-300 border border-gray-100">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-3xl mb-6">⚡</div>
              <h4 className="text-xl font-bold mb-3">Bếp Nhận Tức Thì</h4>
              <p className="text-gray-500">Đơn hàng được chuyển thẳng xuống bếp qua hệ thống KDS thời gian thực.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition duration-300 border border-gray-100">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-3xl mb-6">💳</div>
              <h4 className="text-xl font-bold mb-3">Thanh Toán 1 Chạm</h4>
              <p className="text-gray-500">Tích hợp VietQR, Momo, ZaloPay. Tính tiền chính xác, không lo sai sót.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- 4. FOOTER --- */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="mb-4 text-2xl">🍕</p>
          <p>© 2025 Smart Restaurant System. Đồ án tốt nghiệp.</p>
          <p className="mt-2 text-sm text-gray-600">Designed with ❤️ by You</p>
        </div>
      </footer>
    </div>
  );
}