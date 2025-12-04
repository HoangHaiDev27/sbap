'use client';
export default function StaffToggleStatusModal({ staff, onConfirm, onCancel }) {
  if (!staff) return null;
  const newStatus = staff.status === 'Active' ? 'NotActive' : 'Active';

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl text-gray-800">
        <h3 className="text-lg font-semibold text-blue-600 mb-4">Đổi trạng thái</h3>
        <p>
          Xác nhận đổi trạng thái của <b>{staff.fullName}</b> sang <b>{newStatus === 'Active' ? 'Hoạt động' : 'Bị khóa'}</b>?
        </p>
        <div className="flex justify-end space-x-2 mt-6">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">Hủy</button>
          {/* Truyền staff object trực tiếp */}
          <button onClick={() => onConfirm(staff)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}
