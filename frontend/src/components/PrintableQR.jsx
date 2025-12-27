// client/src/components/PrintableQR.jsx
import React from 'react';
import QRCode from 'react-qr-code';

const PrintableQR = ({ table }) => {
  // Nếu không có bàn, trả về div rỗng để tránh lỗi null ref
  if (!table) return <div className="p-4">Không có dữ liệu bàn</div>;

  // URL khi quét QR (Nhớ thay localhost bằng IP máy nếu test điện thoại)
  const qrValue = `${window.location.origin}/scan/${table.qrToken}`;

  return (
    <div className="w-[300px] mx-auto text-center bg-white p-8 border-2 border-gray-800">
      <h1 className="text-2xl font-bold mb-2 uppercase">Smart Restaurant</h1>
      <h2 className="text-xl font-bold mb-4">{table.name}</h2>
      
      <div className="flex justify-center mb-4">
        {/* Level 'H' giúp QR dễ đọc hơn khi in */}
        <QRCode value={qrValue} size={200} level="H" />
      </div>

      <p className="text-sm font-bold uppercase border-t pt-4 mt-4">Quét để gọi món</p>
      <div className="text-xs text-gray-500 mt-2">
        <p>Wifi: SmartWiFi</p>
        <p>Pass: 88888888</p>
      </div>
      
      {/* CSS bắt buộc để trang in đẹp */}
      <style>{`
        @media print {
          @page { margin: 0; size: auto; }
          body { -webkit-print-color-adjust: exact; }
          /* Ẩn tất cả những thứ khác khi in */
          body > *:not(.print-container) { display: none; }
        }
      `}</style>
    </div>
  );
};

export default PrintableQR;