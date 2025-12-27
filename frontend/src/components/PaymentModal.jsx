import { useState } from 'react';
// import toast from 'react-hot-toast';

export default function PaymentModal({ tableInfo, total, onClose, onConfirm }) {
  const [method, setMethod] = useState('CASH'); // CASH hoặc TRANSFER

  // THÔNG TIN TÀI KHOẢN CỦA BẠN (Thay số này bằng số thật để test sướng hơn)
  const BANK_ID = 'MB'; // MB, VCB, ACB, VPB, TPB, ...
  const ACCOUNT_NO = '0000000000'; // Số tài khoản của bạn
  const TEMPLATE = 'compact2'; // Mẫu QR gọn đẹp

  // Tạo nội dung chuyển khoản: "BAN 1 THANH TOAN"
  const content = `BAN ${tableInfo?.name?.replace(/\s/g, '')} THANH TOAN`;
  
  // Link tạo QR tự động
  const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${'0968706846'}-${TEMPLATE}.png?amount=${total}&addInfo=${content}`;

  const handleFinish = () => {
    if (method === 'TRANSFER') {
      if(!window.confirm("Bạn đã chuyển khoản thành công chưa?")) return;
    }
    onConfirm(method); // Gọi hàm thanh toán của cha
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-white w-full max-w-sm rounded-xl overflow-hidden animate-fade-in">
        
        {/* Header */}
        <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
          <h2 className="font-bold text-lg">Thanh Toán</h2>
          <button onClick={onClose} className="text-2xl hover:text-gray-200">&times;</button>
        </div>

        <div className="p-6">
          <p className="text-center text-gray-500 mb-2">Tổng tiền cần thanh toán</p>
          <p className="text-center text-3xl font-bold text-blue-600 mb-6">
            {total.toLocaleString()} đ
          </p>

          {/* Chọn phương thức */}
          <div className="flex gap-2 mb-6">
            <button 
              onClick={() => setMethod('CASH')}
              className={`flex-1 py-2 rounded font-bold border ${method === 'CASH' ? 'bg-blue-100 border-blue-500 text-blue-700' : 'bg-white border-gray-200 text-gray-600'}`}
            >
              Tiền mặt
            </button>
            <button 
              onClick={() => setMethod('TRANSFER')}
              className={`flex-1 py-2 rounded font-bold border ${method === 'TRANSFER' ? 'bg-blue-100 border-blue-500 text-blue-700' : 'bg-white border-gray-200 text-gray-600'}`}
            >
              Chuyển khoản
            </button>
          </div>

          {/* Nội dung theo phương thức */}
          {method === 'CASH' ? (
            <div className="bg-yellow-50 p-4 rounded text-center text-yellow-800 text-sm mb-4">
              Vui lòng mang tiền mặt ra quầy thu ngân để thanh toán.
            </div>
          ) : (
            <div className="flex flex-col items-center mb-4">
              <p className="text-xs text-gray-500 mb-2">Quét mã để thanh toán ngay</p>
              {/* Ảnh QR VietQR */}
              <img src={qrUrl} alt="VietQR" className="w-full rounded border" />
              <p className="text-[10px] text-gray-400 mt-1">Powered by VietQR</p>
            </div>
          )}

          {/* Nút xác nhận */}
          <button 
            onClick={handleFinish}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
          >
            {method === 'CASH' ? 'Gọi nhân viên tính tiền' : 'Tôi đã chuyển khoản'}
          </button>
        </div>
      </div>
    </div>
  );
}