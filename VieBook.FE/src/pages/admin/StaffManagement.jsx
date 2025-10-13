'use client';
import React, { useEffect, useMemo, useState } from 'react';
import StaffFormModal from '../../components/admin/StaffFormModal';
import StaffToggleStatusModal from '../../components/admin/StaffToggleStatusModal';
import { 
  getAllStaff, addStaff, updateStaff, lockStaff, unlockStaff,
  updateStaffAvatar, deleteStaffAvatar
} from '../../api/staffApi';

export default function StaffManagement() {
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [toggleStaff, setToggleStaff] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const defaultAvatar = "https://img5.thuthuatphanmem.vn/uploads/2021/11/22/anh-gau-nau_092901233.jpg";

  const showToast = (type, message) => {
    window.dispatchEvent(new CustomEvent("app:toast", { detail: { type, message } }));
  };

  const fetchStaffs = async () => {
    try {
      setLoading(true);
      const data = await getAllStaff();
      setStaffs(data);
    } catch (error) {
      console.error(error);
      showToast('error', 'Không thể tải danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffs();
  }, []);

  const filteredStaff = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return staffs.filter((s) => {
      const matchesSearch = !q || s.fullName.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.phoneNumber?.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && s.status === 'Active') ||
        (statusFilter === 'inactive' && s.status === 'NotActive');
      return matchesSearch && matchesStatus;
    });
  }, [staffs, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredStaff.length / itemsPerPage));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);
  useEffect(() => setCurrentPage(1), [searchTerm, statusFilter]);

  const paginatedStaff = filteredStaff.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setIsFormOpen(true);
  };
  const handleOpenEdit = (staff) => {
    if (!staff.userId) return;
    setEditingStaff(staff);
    setIsFormOpen(true);
  };

  // Save staff (add/update) dùng staffApi + upload avatar
  const handleSaveForm = async (data, id, newAvatarFile) => {
  try {
    let avatarUrl = data.avatarUrl || '';

    if (newAvatarFile) {
      // Xóa avatar cũ nếu khác mặc định
      if (data.avatarUrl && data.avatarUrl !== defaultAvatar && data.avatarUrl.includes("cloudinary.com")) {
        await deleteStaffAvatar(id);
      }

      // Upload avatar mới
      const formData = new FormData();
      formData.append("avatarFile", newAvatarFile); // backend nhận "file"
      avatarUrl = await updateStaffAvatar(id, formData); // nhớ truyền staffId
    }

    const payload = { ...data, avatarUrl };

    let res;
    if (id) {
      res = await updateStaff(id, payload);
    } else {
      res = await addStaff(payload);
    }

    showToast("success", res?.message || "Thao tác thành công");
    setIsFormOpen(false);
    setEditingStaff(null);
    await fetchStaffs();
  } catch (error) {
    console.error(error);
    showToast("error", error.message || "Lưu nhân viên thất bại");
  }
};



  const handleConfirmToggle = async (staff) => {
    if (!staff?.userId) return showToast("error", "Nhân viên không hợp lệ");
    try {
      let res;
      if (staff.status === "Active") {
        res = await lockStaff(staff.userId);
      } else {
        res = await unlockStaff(staff.userId);
      }
      setToggleStaff(null);
      showToast("success", res?.message || "Đổi trạng thái thành công");
      await fetchStaffs();
    } catch (error) {
      console.error(error);
      showToast("error", error.message || "Đổi trạng thái thất bại");
    }
  };

  const handleCancelAll = () => {
    setIsFormOpen(false);
    setEditingStaff(null);
    setToggleStaff(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-24">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Quản lý Staff</h2>
            <p className="text-gray-700">Quản lý tài khoản nhân viên và phân quyền</p>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  placeholder="Tìm kiếm tên, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-3 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
                />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm text-gray-900">
                  <option value="all">Tất cả trạng thái</option>
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Bị khóa</option>
                </select>
              </div>
              <button onClick={handleOpenAdd} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">+ Thêm Staff</button>
            </div>

            {loading ? (
              <div className="text-center p-6 text-gray-500">Đang tải danh sách nhân viên...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">STT</th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nhân viên</th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Số Điện Thoại</th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ngày sinh</th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Đăng nhập cuối</th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-gray-900">
                    {paginatedStaff.length > 0 ? paginatedStaff.map((staff, idx) => (
                      <tr key={staff.userId} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                        <td className="px-6 py-3 flex items-center space-x-3">
                          <img className="w-10 h-10 rounded-full" src={staff.avatarUrl || defaultAvatar} alt={staff.fullName} />
                          <div>
                            <div className="font-semibold text-gray-900">{staff.fullName}</div>
                            <div className="text-gray-500 text-sm">{staff.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-3">{staff.phoneNumber || '-'}</td>
                        <td className="px-6 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${staff.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {staff.status === 'Active' ? 'Hoạt động' : 'Bị khóa'}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-500">{staff.dateOfBirth || '-'}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">{staff.createdAt}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">{staff.lastLoginAt || '-'}</td>
                        <td className="px-6 py-3 flex space-x-2">
                          <button onClick={() => handleOpenEdit(staff)} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Sửa">
                            <i className="ri-edit-line" />
                          </button>
                          <button onClick={() => setToggleStaff(staff)} className="p-2 text-green-600 hover:bg-green-50 rounded">
                            <i className={staff.status === 'Active' ? 'ri-lock-line' : 'ri-lock-unlock-line'} />
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="8" className="px-6 py-6 text-center text-gray-500">Không tìm thấy nhân viên.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            <div className="flex justify-end items-center space-x-2 p-4">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="px-3 py-1 rounded border bg-white text-gray-600 disabled:opacity-50">Trước</button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} onClick={() => setCurrentPage(i + 1)} className={`px-3 py-1 rounded border ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}>{i + 1}</button>
              ))}
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-1 rounded border bg-white text-gray-600 disabled:opacity-50">Sau</button>
            </div>
          </div>
        </div>
      </main>

      {isFormOpen && <StaffFormModal staff={editingStaff} onSave={(data, _, newAvatarFile) => handleSaveForm(data, editingStaff?.userId, newAvatarFile)} onCancel={handleCancelAll} />}
      {toggleStaff && <StaffToggleStatusModal staff={toggleStaff} onCancel={() => setToggleStaff(null)} onConfirm={handleConfirmToggle} />}
    </div>
  );
}
