'use client';
import React, { useEffect, useMemo, useState } from 'react';
import StaffFormModal from '../../components/admin/StaffFormModal';
import StaffToggleStatusModal from '../../components/admin/StaffToggleStatusModal';
import { 
  getAllStaff, addStaff, updateStaff, lockStaff, unlockStaff
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

  // Lấy danh sách staff
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
      const matchesSearch = !q || s.fullName?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q) || s.phoneNumber?.toLowerCase().includes(q) || s.address?.toLowerCase().includes(q);
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
// Thêm/cập nhật staff, gửi avatar qua FormData
const handleSaveForm = async (data, id, newAvatarFile) => {
  try {
    const formData = new FormData();
    formData.append("FullName", data.fullName);
    formData.append("Email", data.email);
    formData.append("PhoneNumber", data.phoneNumber);
    formData.append(
      "DateOfBirth",
      data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : ""
    );
    formData.append("AvatarUrl", data.avatarUrl || defaultAvatar);
    formData.append("Address", data.address);

    if (data.newPassword) formData.append("NewPassword", data.newPassword);
    if (newAvatarFile) formData.append("avatarFile", newAvatarFile);

    let res;

    if (!id) {
      // Thêm staff
      formData.append("Password", data.password || "");
      res = await addStaff(formData);
      showToast("success",  "Thêm nhân viên thành công");

      // Thêm staff mới vào state ngay lập tức
      await fetchStaffs();
    } else {
      // Cập nhật staff
      res = await updateStaff(id, formData);
      showToast("success",  "Cập nhật nhân viên thành công");

      // Cập nhật staff trong state
      setStaffs(prev =>
        prev.map(s => (s.userId === id ? { ...s, ...res.data } : s))
      );
    }

    // Đóng modal
    setIsFormOpen(false);
    setEditingStaff(null);
  } catch (error) {
    if (!id) {
      showToast("error", error.message || "Thêm nhân viên thất bại");
    } else {
      showToast("error", error.message || "Cập nhật nhân viên thất bại");
    }
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
      <main className="pt-20 sm:pt-24">
        <div className="px-4 sm:px-6 py-4 sm:py-6">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Quản lý Nhân viên</h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Quản lý tài khoản nhân viên và phân quyền</p>
          </div>

          {/* Filters and Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4 sm:mb-6">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center sm:justify-between">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1">
                  <input
                    type="text"
                    placeholder="Tìm kiếm tên, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base text-gray-900 min-h-[44px]"
                  />
                  <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)} 
                    className="px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base text-gray-900 bg-white min-h-[44px]"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Bị khóa</option>
                  </select>
                </div>
                <button 
                  onClick={handleOpenAdd} 
                  className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 font-medium text-sm sm:text-base transition-colors min-h-[44px] shadow-sm hover:shadow-md"
                >
                  + Thêm Nhân Viên
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center p-8 sm:p-12 text-gray-500">Đang tải danh sách nhân viên...</div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">STT</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nhân viên</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Số Điện Thoại</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Trạng thái</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Ngày sinh</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Địa chỉ</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Ngày tạo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Đăng nhập cuối</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {paginatedStaff.length > 0 ? paginatedStaff.map((staff, idx) => (
                        <tr key={staff.userId} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4 text-sm text-gray-900 whitespace-nowrap">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <img 
                                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200" 
                                src={staff.avatarUrl || defaultAvatar} 
                                alt={staff.fullName} 
                              />
                              <div>
                                <div className="font-semibold text-gray-900">{staff.fullName}</div>
                                <div className="text-sm text-gray-500">{staff.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{staff.phoneNumber || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${staff.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {staff.status === 'Active' ? 'Hoạt động' : 'Bị khóa'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{staff.dateOfBirth || '-'}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{staff.address || '-'}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{staff.createdAt?.split('T')[0] || '-'}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{staff.lastLoginAt ? staff.lastLoginAt.split('T')[0] : '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleOpenEdit(staff)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Sửa nhân viên"
                              >
                                <i className="ri-edit-line text-lg" />
                              </button>
                              <button
                                onClick={() => setToggleStaff(staff)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title={staff.status === "Active" ? "Khoá tài khoản" : "Mở khoá tài khoản"}
                              >
                                <i className={`text-lg ${staff.status === 'Active' ? 'ri-lock-line' : 'ri-lock-unlock-line'}`} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="9" className="px-6 py-8 text-center text-gray-500">Không tìm thấy nhân viên.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile/Tablet Card View */}
                <div className="lg:hidden">
                  {paginatedStaff.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {paginatedStaff.map((staff, idx) => (
                        <div key={staff.userId} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <img 
                                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-gray-200 flex-shrink-0" 
                                src={staff.avatarUrl || defaultAvatar} 
                                alt={staff.fullName} 
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-900 text-base sm:text-lg truncate">{staff.fullName}</div>
                                <div className="text-sm text-gray-500 truncate">{staff.email}</div>
                                <div className="mt-1">
                                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${staff.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {staff.status === 'Active' ? 'Hoạt động' : 'Bị khóa'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
                              <button
                                onClick={() => handleOpenEdit(staff)}
                                className="p-2.5 text-blue-600 hover:bg-blue-50 active:bg-blue-100 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                                title="Sửa nhân viên"
                              >
                                <i className="ri-edit-line text-xl" />
                              </button>
                              <button
                                onClick={() => setToggleStaff(staff)}
                                className="p-2.5 text-green-600 hover:bg-green-50 active:bg-green-100 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                                title={staff.status === "Active" ? "Khoá tài khoản" : "Mở khoá tài khoản"}
                              >
                                <i className={`text-xl ${staff.status === 'Active' ? 'ri-lock-line' : 'ri-lock-unlock-line'}`} />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-sm">
                            <div>
                              <span className="text-gray-500">Số điện thoại:</span>
                              <span className="ml-2 text-gray-900 font-medium">{staff.phoneNumber || '-'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Ngày sinh:</span>
                              <span className="ml-2 text-gray-900">{staff.dateOfBirth || '-'}</span>
                            </div>
                            {staff.address && (
                              <div className="sm:col-span-2">
                                <span className="text-gray-500">Địa chỉ:</span>
                                <span className="ml-2 text-gray-900">{staff.address}</span>
                              </div>
                            )}
                            <div>
                              <span className="text-gray-500">Ngày tạo:</span>
                              <span className="ml-2 text-gray-900">{staff.createdAt?.split('T')[0] || '-'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Đăng nhập cuối:</span>
                              <span className="ml-2 text-gray-900">{staff.lastLoginAt ? staff.lastLoginAt.split('T')[0] : '-'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">Không tìm thấy nhân viên.</div>
                  )}
                </div>
              </>
            )}

            {/* Pagination */}
            {!loading && (
              <div className="px-4 sm:px-6 py-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
                  <div className="text-sm text-gray-600">
                    Hiển thị {paginatedStaff.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredStaff.length)} trong tổng số {filteredStaff.length} nhân viên
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <button 
                      disabled={currentPage === 1} 
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} 
                      className="px-3 sm:px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium min-h-[44px] transition-colors"
                    >
                      Trước
                    </button>
                    <div className="flex items-center space-x-1 overflow-x-auto">
                      {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <button 
                            key={i} 
                            onClick={() => setCurrentPage(pageNum)} 
                            className={`px-3 sm:px-4 py-2 rounded-lg border text-sm sm:text-base font-medium min-h-[44px] min-w-[44px] transition-colors ${
                              currentPage === pageNum 
                                ? 'bg-blue-600 text-white border-blue-600' 
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 active:bg-gray-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button 
                      disabled={currentPage === totalPages} 
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} 
                      className="px-3 sm:px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium min-h-[44px] transition-colors"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {isFormOpen && <StaffFormModal
  staff={editingStaff}
  onSave={(data, _, newAvatarFile) =>
    handleSaveForm(data, editingStaff?.userId, newAvatarFile)
  }
  onCancel={handleCancelAll}
/>}
      {toggleStaff && <StaffToggleStatusModal staff={toggleStaff} onCancel={() => setToggleStaff(null)} onConfirm={handleConfirmToggle} />}
    </div>
  );
}