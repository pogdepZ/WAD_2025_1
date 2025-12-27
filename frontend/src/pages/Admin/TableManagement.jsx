import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import api from "../../services/api";
import PrintableQR from "../../components/PrintableQR";
import EditTableModal from "../../components/EditTableModal";

export default function TableManagement() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  // Load danh sách bàn
  useEffect(() => {
    api
      .get("/tables")
      .then((res) => setTables(res.data))
      .catch(() => toast.error("Lỗi tải danh sách bàn"));
  }, [refresh]);

  // Thống kê nhanh
  const stats = useMemo(() => {
    const total = tables.length;
    const active = tables.filter((t) => t.status === "ACTIVE").length; // Giả sử ACTIVE là Available
    const inactive = tables.filter((t) => t.status === "INACTIVE").length;
    // Lưu ý: Logic "Occupied" cần tích hợp với Order, tạm thời ta coi ACTIVE là Available
    return { total, active, inactive };
  }, [tables]);

  // Các hàm xử lý (CRUD) - Giữ nguyên logic cũ
  const onCreateTable = async (data) => {
    try {
      await api.post("/tables", data);
      toast.success("Tạo bàn thành công!");
      reset();
      setRefresh((p) => p + 1);
    } catch (err) {
      toast.error("Lỗi tạo bàn");
    }
  };

  const onUpdateTable = async (id, data) => {
    try {
      await api.put(`/tables/${id}`, data);
      toast.success("Cập nhật thành công!");
      setIsEditModalOpen(false);
      setRefresh((p) => p + 1);
      setSelectedTable((prev) => ({ ...prev, ...data }));
    } catch (err) {
      toast.error("Lỗi cập nhật");
    }
  };

  const onRegenerateQR = async (table) => {
    if (!window.confirm(`Đổi mã QR cho ${table.name}?`)) return;
    try {
      const res = await api.post(`/tables/${table.id}/regenerate`);
      toast.success("Đã cấp mã mới!");
      setRefresh((p) => p + 1);
      if (selectedTable?.id === table.id) setSelectedTable(res.data);
    } catch (err) {
      toast.error("Lỗi làm mới QR");
    }
  };

  const handleDownloadAll = async () => {
    try {
      toast.loading("Đang nén file...");
      const response = await api.get("/tables/download-zip", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "All_QR_Codes.zip");
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.dismiss();
      toast.success("Tải xuống thành công!");
    } catch (error) {
      toast.dismiss();
      toast.error("Lỗi tải file");
    }
  };

  const handlePrint = () => {
    if (!selectedTable) return;
    window.open(`/print-qr/${selectedTable.id}`, "_blank");
  };

  // Helper chọn màu trạng thái
  const getStatusColor = (status) => {
    if (status === "INACTIVE")
      return "bg-gray-100 border-gray-300 text-gray-500";
    // Logic mở rộng: Nếu có khách thì màu cam (cần check order), tạm thời màu xanh
    return "bg-white border-blue-200 hover:border-blue-400 text-[#2c3e50]";
  };

  const getStatusBadge = (status) => {
    if (status === "INACTIVE")
      return (
        <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold">
          🚫 Inactive
        </span>
      );
    return (
      <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs font-bold">
        ✅ Available
      </span>
    );
  };

  const getTestLink = (token) => {
    // Tự động lấy domain hiện tại (localhost hoặc vercel)
    return `${window.location.origin}/scan/${token}`;
  };

  return (
    <div className="p-6 md:p-8 bg-[#f5f6fa] min-h-screen font-sans text-[#2c3e50]">
      <Toaster />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2c3e50]">
            Table Management
          </h1>
          <p className="text-[#7f8c8d] text-sm mt-1">
            Manage tables and generate QR codes
          </p>
        </div>

        {/* Form thêm nhanh (Inline) */}
        <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200 flex gap-2 w-full md:w-auto">
          <form
            onSubmit={handleSubmit(onCreateTable)}
            className="flex gap-2 w-full"
          >
            <input
              {...register("name", { required: true })}
              placeholder="Tên bàn"
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 w-24"
            />
            <input
              {...register("capacity")}
              type="number"
              placeholder="Ghế"
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 w-16"
            />
            <input
              {...register("location")}
              placeholder="Khu vực"
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 w-24"
            />
            <button className="bg-[#e74c3c] text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#c0392b] whitespace-nowrap">
              + Add
            </button>
          </form>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#e8f8f5] text-[#27ae60] flex items-center justify-center text-xl">
            🪑
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-[#7f8c8d] text-xs uppercase font-bold">
              Total Tables
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#ebf5fb] text-[#3498db] flex items-center justify-center text-xl">
            ✅
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.active}</div>
            <div className="text-[#7f8c8d] text-xs uppercase font-bold">
              Available
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#fef9e7] text-[#f39c12] flex items-center justify-center text-xl">
            🚫
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.inactive}</div>
            <div className="text-[#7f8c8d] text-xs uppercase font-bold">
              Inactive
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- LEFT: TABLES GRID --- */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-[#2c3e50]">All Tables</h3>
            <button
              onClick={handleDownloadAll}
              className="text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 font-medium"
            >
              📥 Download All QR
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {tables.map((table) => (
              <div
                key={table.id}
                onClick={() => setSelectedTable(table)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all relative group
                  ${getStatusColor(table.status)}
                  ${
                    selectedTable?.id === table.id
                      ? "border-blue-500 ring-2 ring-blue-100 bg-blue-50"
                      : ""
                  }
                `}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-lg">{table.name}</span>
                  {getStatusBadge(table.status)}
                </div>

                <div className="text-sm text-gray-500 space-y-1">
                  <p>👤 {table.capacity} seats</p>
                  <p>📍 {table.location || "Main Hall"}</p>
                </div>

                {/* Hover Actions */}
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditModalOpen(true);
                      setSelectedTable(table);
                    }}
                    className="bg-white p-1.5 rounded shadow border hover:text-blue-600"
                    title="Edit"
                  >
                    ✏️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- RIGHT: QR PREVIEW (Giống thiết kế HTML) --- */}
        <div className="lg:col-span-1">
          {selectedTable ? (
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 sticky top-6">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                <h3 className="font-bold text-lg">QR Code Preview</h3>
                <button
                  onClick={() => onRegenerateQR(selectedTable)}
                  className="text-sm text-blue-500 hover:underline"
                >
                  🔄 Regenerate
                </button>
              </div>

              {/* --- THÊM PHẦN NÀY VÀO --- */}
              {/* Link Test (Chỉ dành cho Dev) */}
              <div className="w-full bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    LINK TEST (DEV ONLY):
                  </span>
                </div>

                <input
                  readOnly
                  value={getTestLink(selectedTable.qrToken)}
                  className="w-full text-xs border p-2 rounded bg-white text-gray-600 select-all font-mono mb-3 focus:outline-none"
                />

                <a
                  href={getTestLink(selectedTable.qrToken)}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-center bg-green-500 text-white py-2 rounded text-sm font-bold hover:bg-green-600 shadow-md shadow-green-100 transition"
                >
                  🚀 Mở Tab Mới Test Ngay
                </a>
              </div>

              <div className="flex gap-6">
                {/* QR Image */}
                <div className="bg-[#2c3e50] p-2 rounded-lg shadow-inner flex-shrink-0">
                  <div className="bg-white p-2 rounded">
                    <PrintableQR table={selectedTable} />
                  </div>
                  <p className="text-white text-center text-xs mt-2 font-bold">
                    {selectedTable.name}
                  </p>
                </div>

                {/* Details */}
                <div className="flex-1 space-y-3">
                  <h4 className="font-bold text-gray-800 border-b pb-1">
                    Table Info
                  </h4>
                  <div className="text-sm flex justify-between">
                    <span className="text-gray-500">Name:</span>
                    <span className="font-medium">{selectedTable.name}</span>
                  </div>
                  <div className="text-sm flex justify-between">
                    <span className="text-gray-500">Seats:</span>
                    <span className="font-medium">
                      {selectedTable.capacity}
                    </span>
                  </div>
                  <div className="text-sm flex justify-between">
                    <span className="text-gray-500">Loc:</span>
                    <span className="font-medium">
                      {selectedTable.location}
                    </span>
                  </div>
                  <div className="text-sm flex justify-between">
                    <span className="text-gray-500">Ver:</span>
                    <span className="font-medium">
                      {selectedTable.qrVersion}
                    </span>
                  </div>

                  <div className="pt-4 flex flex-col gap-2">
                    <button
                      onClick={handlePrint}
                      className="w-full bg-[#2c3e50] text-white py-2 rounded-lg font-bold hover:bg-black transition text-sm"
                    >
                      🖨 Print / Download
                    </button>
                    <button
                      onClick={() => {
                        setIsEditModalOpen(true);
                      }}
                      className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-200 transition text-sm"
                    >
                      ✏️ Edit Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center text-gray-400 h-full flex flex-col justify-center">
              <span className="text-4xl mb-4">👈</span>
              <p>Select a table to view QR details</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Sửa (Giữ nguyên) */}
      {isEditModalOpen && (
        <EditTableModal
          table={selectedTable}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={onUpdateTable}
        />
      )}
    </div>
  );
}
