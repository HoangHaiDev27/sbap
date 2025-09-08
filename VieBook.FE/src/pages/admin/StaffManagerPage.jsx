'use client';
import { useState, useEffect } from 'react';



export default function StaffManagement() {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'staff',
        status: 'active'
    });

    useEffect(() => {
        if (!showModal) return;
        const onKey = (e) => { if (e.key === 'Escape') setShowModal(false); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
        }, [showModal]);

    // Fake data (sau này thay API)
    const staffMembers = [
        { id: 1, name: 'Trần Văn Admin', email: 'admin@bookplatform.com', role: 'admin', status: 'active', createdAt: '2023-01-15', lastLogin: '2024-01-22 14:30', avatar: 'https://i.pravatar.cc/150?img=1' },
        { id: 2, name: 'Nguyễn Thị Manager', email: 'manager@bookplatform.com', role: 'manager', status: 'active', createdAt: '2023-02-20', lastLogin: '2024-01-22 11:45', avatar: 'https://i.pravatar.cc/150?img=2' },
        { id: 3, name: 'Lê Văn Staff', email: 'staff1@bookplatform.com', role: 'staff', status: 'active', createdAt: '2023-03-10', lastLogin: '2024-01-22 09:20', avatar: 'https://i.pravatar.cc/150?img=3' },
        { id: 4, name: 'Phạm Thị Staff', email: 'staff2@bookplatform.com', role: 'staff', status: 'inactive', createdAt: '2023-04-05', lastLogin: '2024-01-18 16:10', avatar: 'https://i.pravatar.cc/150?img=4' },
    ];

    // Lọc staff
    const filteredStaff = staffMembers.filter(staff => {
        const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            staff.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || staff.role === roleFilter;
        const matchesStatus = statusFilter === 'all' || staff.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });

    // Reset form
    const resetForm = () => {
        setFormData({ name: '', email: '', password: '', role: 'staff', status: 'active' });
        setEditingStaff(null);
    };

    const handleAddNew = () => {
        resetForm();
        setShowModal(true);
    };

    const handleEdit = (staff) => {
        setEditingStaff(staff);
        setFormData({ name: staff.name, email: staff.email, password: '', role: staff.role, status: staff.status });
        setShowModal(true);
    };

    const handleSave = () => {
        if (!formData.name || !formData.email) return alert('Vui lòng điền đầy đủ thông tin');
        if (!editingStaff && !formData.password) return alert('Vui lòng nhập mật khẩu cho tài khoản mới');
        console.log('Saving:', formData);
        setShowModal(false);
        resetForm();
        alert(editingStaff ? 'Cập nhật thành công!' : 'Thêm staff mới thành công!');
    };

    const handleDelete = (id) => {
        if (confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
            console.log('Deleting:', id);
            alert('Xóa thành công!');
        }
    };

    const toggleStatus = (staff) => {
        const newStatus = staff.status === 'active' ? 'inactive' : 'active';
        if (confirm(`Xác nhận đổi trạng thái tài khoản "${staff.name}" sang ${newStatus}?`)) {
            console.log('Toggle status:', staff.id, newStatus);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">

            <main className="">
                <div className="p-6">
                    {/* Header */}
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Quản lý Staff</h2>
                        <p className="text-gray-700">Quản lý tài khoản nhân viên và phân quyền</p>
                    </div>

                    {/* Filter & Action */}
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
                            <button onClick={handleAddNew} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                + Thêm Staff
                            </button>
                        </div>

                        {/* Table */}
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
                                    {filteredStaff.map((staff, idx) => (
                                        <tr key={staff.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">{idx + 1}</td>
                                            <td className="px-6 py-3 flex items-center space-x-3">
                                                <img className="w-10 h-10 rounded-full" src={staff.avatar} alt="" />
                                                <div>
                                                    <div className="font-semibold text-gray-900">{staff.name}</div>
                                                    <div className="text-gray-500 text-sm">{staff.email}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-semibold ${staff.role === 'admin'
                                                        ? 'bg-red-100 text-red-700'
                                                        : staff.role === 'manager'
                                                            ? 'bg-purple-100 text-purple-700'
                                                            : staff.role === 'moderator'
                                                                ? 'bg-blue-100 text-blue-700'
                                                                : 'bg-green-100 text-green-700'
                                                        }`}
                                                >
                                                    {staff.role === 'admin'
                                                        ? 'Quản trị viên'
                                                        : staff.role === 'manager'
                                                            ? 'Quản lý'
                                                            : staff.role === 'moderator'
                                                                ? 'Điều hành'
                                                                : 'Nhân viên'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-semibold ${staff.status === 'active'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-red-100 text-red-700'
                                                        }`}
                                                >
                                                    {staff.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
                                                </span>
                                            </td>

                                            <td className="px-6 py-3 text-sm text-gray-500">{staff.createdAt}</td>
                                            <td className="px-6 py-3 text-sm text-gray-500">{staff.lastLogin}</td>
                                            <td className="px-6 py-3 flex space-x-2">
                                                <button
                                                    onClick={() => handleEdit(staff)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                                    title="Sửa"
                                                >
                                                    <i className="ri-edit-line"></i>
                                                </button>
                                                <button
                                                    onClick={() => toggleStatus(staff)}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded"
                                                    title="Khóa / Mở"
                                                >
                                                    <i
                                                        className={
                                                            staff.status === 'active'
                                                                ? 'ri-lock-line'
                                                                : 'ri-lock-unlock-line'
                                                        }
                                                    ></i>
                                                </button>
                                                {staff.role !== 'admin' && (
                                                    <button
                                                        onClick={() => handleDelete(staff.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                                                        title="Xóa"
                                                    >
                                                        <i className="ri-delete-bin-line"></i>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modal */}
            {showModal && (
                <div
                    // overlay: mờ sáng + blur, click ngoài sẽ đóng modal
                    className="fixed inset-0 bg-gray-200/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        // modal box: click bên trong không đóng (stopPropagation)
                        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl transform transition-all duration-200 animate-scaleIn text-gray-800"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-label={editingStaff ? "Chỉnh sửa Staff" : "Thêm Staff mới"}
                    >
                        {/* Header */}
                        <h3 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
                            {editingStaff ? 'Chỉnh sửa Staff' : 'Thêm Staff mới'}
                        </h3>

                        {/* Form */}
                        <div className="space-y-4">
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Tên đầy đủ"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="Email"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                            {!editingStaff && (
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Mật khẩu"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            )}
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            >
                                <option value="staff">Nhân viên</option>
                                <option value="moderator">Điều hành</option>
                                <option value="manager">Quản lý</option>
                                <option value="admin">Quản trị viên</option>
                            </select>

                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            >
                                <option value="active">Hoạt động</option>
                                <option value="inactive">Bị khóa</option>
                            </select>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end space-x-2 mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition"
                            >
                                {editingStaff ? 'Cập nhật' : 'Thêm mới'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
