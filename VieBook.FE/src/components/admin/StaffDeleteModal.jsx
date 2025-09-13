'use client';
export default function StaffDeleteModal({ staff, onConfirm, onCancel }) {
  if (!staff) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl text-gray-800">
        <h3 className="text-lg font-semibold text-red-600 mb-4">Xóa nhân viên</h3>
        <p>Bạn có chắc chắn muốn xóa <b>{staff.name}</b>?</p>
        <div className="flex justify-end space-x-2 mt-6">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">Hủy</button>
          <button onClick={() => onConfirm(staff.id)} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Xóa</button>
        </div>
      </div>
    </div>
  );
}
