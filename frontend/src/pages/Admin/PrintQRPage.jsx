import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import QRCode from 'react-qr-code';
import api from '../../services/api';

export default function PrintQRPage() {
  const { id } = useParams();
  const [table, setTable] = useState(null);

  useEffect(() => {
    // 1. Chỉ lấy dữ liệu, KHÔNG gọi window.print() tự động nữa
    api.get('/tables').then(res => {
      const found = res.data.find(t => t.id === id || t.id === parseInt(id));
      setTable(found);
      if (found) {
        document.title = `QR-${found.name}`; // Đặt tên tab/file in
      }
    });
  }, [id]);

  if (!table) return <div className="text-center p-10 font-sans">Đang tải dữ liệu bàn...</div>;

  const qrValue = `${window.location.origin}/scan/${table.qrToken}`;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      
      {/* THANH CÔNG CỤ (Sẽ bị ẩn khi in) */}
      <div className="no-print fixed top-0 left-0 right-0 bg-white shadow-md p-4 flex justify-between items-center z-50">
        <h1 className="font-bold text-gray-700">Xem trước bản in: {table.name}</h1>
        <div className="flex gap-3">
          <button 
            onClick={() => window.close()} // Đóng tab
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium"
          >
            Đóng
          </button>
          <button 
            onClick={() => window.print()} // Bấm nút này mới in
            className="px-6 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg flex items-center gap-2"
          >
            IN NGAY
          </button>
        </div>
      </div>

      {/* KHUNG GIẤY MÔ PHỎNG (Sẽ được in) */}
      {/* mt-20 để tránh bị thanh công cụ che mất khi xem preview */}
      <div className="mt-16 bg-white p-10 shadow-2xl border w-[400px] text-center print-content">
        <h1 className="text-3xl font-bold mb-2 uppercase tracking-wider border-b-4 border-black pb-4">Smart Restaurant</h1>
        
        <div className="my-8">
           <h2 className="text-4xl font-extrabold mb-2">{table.name}</h2>
           <p className="text-gray-500 font-mono text-sm">{table.location || 'Khu vực chung'}</p>
        </div>
        
        <div className="flex justify-center mb-8 p-4 border-4 border-black inline-block rounded-lg">
          <QRCode value={qrValue} size={250} level="H" />
        </div>

        <div className="border-t-4 border-black pt-4 mt-4">
          <p className="text-xl font-bold uppercase mb-2">Quét để gọi món</p>
          <div className="text-sm font-mono bg-gray-100 p-3 rounded inline-block w-full">
            <p className="font-bold">Wifi: SmartWiFi</p>
            <p>Pass: 88888888</p>
          </div>
        </div>
        
        <p className="text-[10px] text-gray-400 mt-6 uppercase">Powered by Smart Restaurant App</p>
      </div>

      {/* CSS IN ẤN */}
      <style>{`
        @media print {
          /* 1. Ẩn thanh công cụ và nền xám */
          .no-print { display: none !important; }
          body { background-color: white; }
          
          /* 2. Căn chỉnh trang in */
          @page { margin: 0; size: auto; }
          
          /* 3. Căn giữa tờ giấy khi in */
          .print-content {
            margin: 0 auto;
            box-shadow: none; /* Bỏ đổ bóng khi in */
            border: none;
            width: 100%;
            max-width: 100%;
            margin-top: 50px; /* Cách lề trên một chút */
          }
          
          /* 4. Center toàn bộ body */
          body {
            display: flex;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}