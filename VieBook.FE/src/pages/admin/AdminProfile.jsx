import React, { useState } from 'react';

export default function AdminProfile() {
    const [showEditModal, setShowEditModal] = useState(false);

    // Giả lập dữ liệu người dùng
    const [userInfo, setUserInfo] = useState({
        fullName: 'Trần Văn Admin',
        email: 'admin@bookplatform.com',
        phone: '0123456789',
        address: 'Hà Nội, Việt Nam',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserInfo((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = () => {
        // TODO: Gọi API ở đây nếu cần
        setShowEditModal(false);
        console.log('Lưu thông tin:', userInfo);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen relative">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Thông tin cá nhân</h2>
            <p className="text-gray-500 mb-6">Quản lý thông tin tài khoản và cài đặt bảo mật</p>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Thông tin cơ bản */}
                <div className="xl:col-span-2 bg-white p-6 rounded-lg shadow border">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Thông tin cơ bản</h3>
                        <button
                            className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm"
                            onClick={() => setShowEditModal(true)}
                        >
                            ✏️ Chỉnh sửa
                        </button>
                    </div>

                    <div className="flex items-center space-x-4 mb-6">
                        <img
                            src="https://img5.thuthuatphanmem.vn/uploads/2021/11/22/anh-gau-nau_092901233.jpg"
                            alt="Avatar"
                            className="w-20 h-20 rounded-full object-cover"
                        />
                        <div>
                            <h4 className="text-lg font-semibold text-gray-900">{userInfo.fullName}</h4>
                            <p className="text-gray-500 text-sm">Quản trị viên hệ thống</p>
                            <span className="inline-block mt-1 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">Admin</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Họ và tên *</p>
                            <p className="text-base text-gray-800">{userInfo.fullName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Email *</p>
                            <p className="text-base text-gray-800">{userInfo.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Số điện thoại</p>
                            <p className="text-base text-gray-800">{userInfo.phone}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Địa chỉ</p>
                            <p className="text-base text-gray-800">{userInfo.address}</p>
                        </div>
                    </div>
                </div>

                {/* Thống kê tài khoản */}
                <div className="bg-white p-6 rounded-lg shadow border">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Thống kê tài khoản</h3>
                    <ul className="space-y-3 text-sm text-gray-700">
                        <li className="flex items-start space-x-2">
                            <i className="ri-calendar-line text-lg text-blue-500 mt-0.5"></i>
                            <span>Ngày tham gia: <strong>15/01/2023</strong></span>
                        </li>
                        <li className="flex items-start space-x-2">
                            <i className="ri-time-line text-lg text-blue-500 mt-0.5"></i>
                            <span>Lần đăng nhập cuối: <strong>22/01/2024 14:30</strong></span>
                        </li>
                        <li className="flex items-start space-x-2">
                            <i className="ri-hourglass-line text-lg text-blue-500 mt-0.5"></i>
                            <span>Tổng thời gian online: <strong>1,234 giờ</strong></span>
                        </li>
                        <li className="flex items-start space-x-2">
                            <i className="ri-refresh-line text-lg text-blue-500 mt-0.5"></i>
                            <span>Số lần đăng nhập: <strong>2,456 lần</strong></span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Hoạt động gần đây */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-white p-6 rounded-lg shadow border">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Hoạt động gần đây</h3>
                    <ul className="space-y-3 text-sm text-gray-700">
                        <li className="flex items-center space-x-2">
                            <span className="h-3 w-3 bg-green-500 rounded-full inline-block"></span>
                            <span>Đăng nhập hệ thống – <strong>14:30</strong></span>
                        </li>
                        <li className="flex items-center space-x-2">
                            <span className="h-3 w-3 bg-blue-500 rounded-full inline-block"></span>
                            <span>Thêm staff mới – <strong>13:45</strong></span>
                        </li>
                        <li className="flex items-center space-x-2">
                            <span className="h-3 w-3 bg-purple-500 rounded-full inline-block"></span>
                            <span>Cập nhật cài đặt – <strong>12:20</strong></span>
                        </li>
                        <li className="flex items-center space-x-2">
                            <span className="h-3 w-3 bg-yellow-400 rounded-full inline-block"></span>
                            <span>Xem báo cáo – <strong>11:15</strong></span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Modal chỉnh sửa */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg relative text-gray-800">
                        <h3 className="text-lg font-semibold mb-4">Chỉnh sửa thông tin</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Họ và tên</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={userInfo.fullName}
                                    onChange={handleChange}
                                    className="mt-1 w-full px-3 py-2 border rounded"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={userInfo.email}
                                    onChange={handleChange}
                                    className="mt-1 w-full px-3 py-2 border rounded"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Số điện thoại</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={userInfo.phone}
                                    onChange={handleChange}
                                    className="mt-1 w-full px-3 py-2 border rounded"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Địa chỉ</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={userInfo.address}
                                    onChange={handleChange}
                                    className="mt-1 w-full px-3 py-2 border rounded"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-2">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
