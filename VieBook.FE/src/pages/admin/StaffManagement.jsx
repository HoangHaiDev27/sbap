
'use client';
import React, { useEffect, useMemo, useState } from 'react';
import StaffFormModal from '../../components/admin/StaffFormModal';
import StaffDeleteModal from '../../components/admin/StaffDeleteModal';
import StaffToggleStatusModal from '../../components/admin/StaffToggleStatusModal';


export default function StaffManagement() {
  const initialStaffs = [
  { id: 1, name: 'Trần Văn Admin', email: 'admin@bookplatform.com', role: 'admin', status: 'active', createdAt: '2023-01-15', lastLogin: '2024-01-22 14:30', avatar: 'https://i.pravatar.cc/150?img=1' },
  { id: 2, name: 'Nguyễn Thị Manager', email: 'manager@bookplatform.com', role: 'manager', status: 'active', createdAt: '2023-02-20', lastLogin: '2024-01-22 11:45', avatar: 'https://i.pravatar.cc/150?img=2' },
  { id: 3, name: 'Lê Văn Staff', email: 'staff1@bookplatform.com', role: 'staff', status: 'active', createdAt: '2023-03-10', lastLogin: '2024-01-22 09:20', avatar: 'https://i.pravatar.cc/150?img=3' },
  { id: 4, name: 'Phạm Thị Staff', email: 'staff2@bookplatform.com', role: 'staff', status: 'inactive', createdAt: '2023-04-05', lastLogin: '2024-01-18 16:10', avatar: 'https://i.pravatar.cc/150?img=4' },
  { id: 5, name: 'Hoàng Văn Moderator', email: 'moderator1@bookplatform.com', role: 'moderator', status: 'active', createdAt: '2023-05-12', lastLogin: '2024-01-20 10:05', avatar: 'https://i.pravatar.cc/150?img=5' },
  { id: 6, name: 'Đặng Thị Staff', email: 'staff3@bookplatform.com', role: 'staff', status: 'inactive', createdAt: '2023-06-08', lastLogin: '2024-01-15 15:50', avatar: 'https://i.pravatar.cc/150?img=6' },
  { id: 7, name: 'Ngô Văn Manager', email: 'manager2@bookplatform.com', role: 'manager', status: 'active', createdAt: '2023-07-22', lastLogin: '2024-01-21 08:40', avatar: 'https://i.pravatar.cc/150?img=7' },
  { id: 8, name: 'Bùi Thị Staff', email: 'staff4@bookplatform.com', role: 'staff', status: 'active', createdAt: '2023-08-30', lastLogin: '2024-01-19 19:25', avatar: 'https://i.pravatar.cc/150?img=8' },
  { id: 9, name: 'Vũ Văn Moderator', email: 'moderator2@bookplatform.com', role: 'moderator', status: 'inactive', createdAt: '2023-09-18', lastLogin: '2024-01-17 13:00', avatar: 'https://i.pravatar.cc/150?img=9' },
  { id: 10, name: 'Trịnh Thị Staff', email: 'staff5@bookplatform.com', role: 'staff', status: 'active', createdAt: '2023-10-25', lastLogin: '2024-01-16 17:45', avatar: 'https://i.pravatar.cc/150?img=10' },
  { id: 11, name: 'Cao Văn Staff', email: 'staff6@bookplatform.com', role: 'staff', status: 'active', createdAt: '2023-11-11', lastLogin: '2024-01-23 12:15', avatar: 'https://i.pravatar.cc/150?img=11' },
];

  const [staffs, setStaffs] = useState(initialStaffs);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [deleteStaff, setDeleteStaff] = useState(null);
  const [toggleStaff, setToggleStaff] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const filteredStaff = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return staffs.filter((s) => {
      const matchesSearch = !q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
      const matchesRole = roleFilter === 'all' || s.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [staffs, searchTerm, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredStaff.length / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

  const paginatedStaff = filteredStaff.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (staff) => {
    setEditingStaff(staff);
    setIsFormOpen(true);
  };

  const handleSaveForm = (data, id) => {
    if (id) {
      setStaffs((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
      setToast('Cập nhật nhân viên thành công');
    } else {
      const newStaff = {
        id: Date.now(),
        name: data.name,
        email: data.email,
        role: data.role || 'staff',
        status: data.status || 'active',
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: '',
        avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`,
      };
      setStaffs((prev) => [newStaff, ...prev]);
      setToast('Thêm nhân viên thành công');
    }
    setIsFormOpen(false);
    setEditingStaff(null);
  };

  const handleConfirmDelete = (id) => {
    setStaffs((prev) => prev.filter((s) => s.id !== id));
    setDeleteStaff(null);
    setToast('Xóa nhân viên thành công');
  };

  const handleConfirmToggle = (id, newStatus) => {
    setStaffs((prev) => prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s)));
    setToggleStaff(null);
    setToast('Đổi trạng thái thành công');
  };

  const handleCancelAll = () => {
    setIsFormOpen(false);
    setEditingStaff(null);
    setDeleteStaff(null);
    setToggleStaff(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-24">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Quản lý Staff</h2>
            <p className="text-gray-700">Quản lý tài khoản nhân viên và phân quyền</p>
          </div>

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
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm text-gray-900">
                  <option value="all">Tất cả vai trò</option>
                  <option value="admin">Quản trị viên</option>
                  <option value="manager">Quản lý</option>
                  <option value="moderator">Điều hành</option>
                  <option value="staff">Nhân viên</option>
                </select>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm text-gray-900">
                  <option value="all">Tất cả trạng thái</option>
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Bị khóa</option>
                </select>
              </div>
              <button onClick={handleOpenAdd} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">+ Thêm Staff</button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">STT</th>
                    <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nhân viên</th>
                    <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vai trò</th>
                    <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                    <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>
                    <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Đăng nhập cuối</th>
                    <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-900">
                  {paginatedStaff.map((staff, idx) => (
                    <tr key={staff.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                      <td className="px-6 py-3 flex items-center space-x-3">
                        <img className="w-10 h-10 rounded-full" src={staff.avatar} alt={staff.name} />
                        <div>
                          <div className="font-semibold text-gray-900">{staff.name}</div>
                          <div className="text-gray-500 text-sm">{staff.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          staff.role === 'admin' ? 'bg-red-100 text-red-700'
                            : staff.role === 'manager' ? 'bg-purple-100 text-purple-700'
                              : staff.role === 'moderator' ? 'bg-blue-100 text-blue-700'
                                : 'bg-green-100 text-green-700'
                        }`}>
                          {staff.role === 'admin' ? 'Quản trị viên'
                            : staff.role === 'manager' ? 'Quản lý'
                              : staff.role === 'moderator' ? 'Điều hành'
                                : 'Nhân viên'}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${staff.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {staff.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-500">{staff.createdAt}</td>
                      <td className="px-6 py-3 text-sm text-gray-500">{staff.lastLogin}</td>
                      <td className="px-6 py-3 flex space-x-2">
                        <button onClick={() => handleOpenEdit(staff)} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Sửa">
                          <i className="ri-edit-line" />
                        </button>
                        <button onClick={() => setToggleStaff(staff)} className="p-2 text-green-600 hover:bg-green-50 rounded" title="Khóa / Mở">
                          <i className={staff.status === 'active' ? 'ri-lock-line' : 'ri-lock-unlock-line'} />
                        </button>
                        {staff.role !== 'admin' && (
                          <button onClick={() => setDeleteStaff(staff)} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Xóa">
                            <i className="ri-delete-bin-line" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {paginatedStaff.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-6 py-6 text-center text-gray-500">Không tìm thấy nhân viên.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end items-center space-x-2 p-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded border bg-white text-gray-600 disabled:opacity-50"
              >
                Trước
              </button>

              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded border ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 rounded border bg-white text-gray-600 disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      </main>

      {isFormOpen && (
        <StaffFormModal
          staff={editingStaff}
          onSave={handleSaveForm}
          onCancel={handleCancelAll}
        />
      )}

      {deleteStaff && (
        <StaffDeleteModal
          staff={deleteStaff}
          onCancel={() => setDeleteStaff(null)}
          onConfirm={handleConfirmDelete}
        />
      )}

      {toggleStaff && (
        <StaffToggleStatusModal
          staff={toggleStaff}
          onCancel={() => setToggleStaff(null)}
          onConfirm={handleConfirmToggle}
        />
      )}

      {toast && (
        <div className="fixed right-6 bottom-6 bg-gray-900 text-white px-4 py-2 rounded shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
