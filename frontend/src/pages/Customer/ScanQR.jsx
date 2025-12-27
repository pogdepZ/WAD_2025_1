import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tableService } from '../../services/api';

export default function ScanQR() {
  const { token } = useParams(); // Lấy token từ URL
  const navigate = useNavigate();
  const [status, setStatus] = useState('idle'); // idle, checking, success, error
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Debug: In token ra xem có lấy được không
    console.log("Token from URL:", token);

    if (!token) {
      setStatus('error');
      setErrorMessage('Không tìm thấy mã QR trên đường dẫn');
      return;
    }

    setStatus('checking');

    // Gọi API kiểm tra
    tableService.verifyQR(token)
      .then(res => {
        console.log("Verify Success:", res.data);
        // Lưu thông tin bàn vào LocalStorage
        localStorage.setItem('tableInfo', JSON.stringify(res.data.table));
        
        setStatus('success');
        
        // Chuyển hướng sau 1.5s
        setTimeout(() => {
          navigate('/menu');
        }, 1500);
      })
      .catch(err => {
        console.error("Verify Error:", err);
        setStatus('error');
        setErrorMessage(err.response?.data?.error || 'Mã QR không hợp lệ hoặc đã hết hạn');
      });
  }, [token, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-6 text-center">
      
      {/* TRẠNG THÁI: CHECKING */}
      {status === 'checking' && (
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-xl">Đang kiểm tra mã QR...</p>
        </div>
      )}

      {/* TRẠNG THÁI: SUCCESS */}
      {status === 'success' && (
        <div className="flex flex-col items-center animate-bounce">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-green-400">Mã hợp lệ!</h1>
          <p className="mt-2 text-gray-300">Đang chuyển đến thực đơn...</p>
        </div>
      )}

      {/* TRẠNG THÁI: ERROR */}
      {status === 'error' && (
        <div className="bg-red-100 text-red-700 p-6 rounded-lg max-w-sm shadow-lg">
          <div className="text-5xl mb-2">🚫</div>
          <h2 className="text-xl font-bold mb-2">Lỗi Quét Mã</h2>
          <p className="font-medium">{errorMessage}</p>
          <div className="mt-4 text-sm text-gray-500 break-all">
            Token: {token || 'Trống'}
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 bg-red-600 text-white px-6 py-2 rounded-full font-bold hover:bg-red-700 transition"
          >
            Thử lại
          </button>
        </div>
      )}
    </div>
  );
}