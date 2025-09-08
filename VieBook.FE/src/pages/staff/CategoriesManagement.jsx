'use client';
import { useState } from 'react';
import CategoryModal from '../../components/staff/categories/CategoryModal';
import ConfirmDeleteModal from '../../components/staff/categories/ConfirmDeleteModal';

export default function CategoriesManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({ name: '', status: 'active' });

  const categories = [
    { id: 1, name: 'Sách nói', bookCount: 156, status: 'active', createdAt: '2024-01-01' },
    { id: 2, name: 'Truyện nói', bookCount: 89, status: 'active', createdAt: '2024-01-02' },
    { id: 3, name: 'Podcast', bookCount: 45, status: 'active', createdAt: '2024-01-03' },
    { id: 4, name: 'Sách tóm tắt', bookCount: 78, status: 'active', createdAt: '2024-01-04' },
    { id: 5, name: 'Thiếu nhi', bookCount: 0, status: 'inactive', createdAt: '2024-01-05' },
  ];

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddNew = () => {
    setEditingCategory(null);
    setFormData({ name: '', status: 'active' });
    setShowCategoryModal(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, status: category.status });
    setShowCategoryModal(true);
  };

  const handleSave = () => {
    console.log('Saving category:', formData);
    setShowCategoryModal(false);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    console.log('Deleting category:', deleteId);
    setShowDeleteModal(false);
  };

  const toggleStatus = (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    console.log('Toggling status for category:', id, 'to', newStatus);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <main className="pt-16">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Quản lý Thể loại Sách</h2>
            <p className="text-gray-600">Quản lý các thể loại sách trên hệ thống</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="ri-search-line text-gray-400 text-sm"></i>
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm thể loại..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
             focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm 
             text-gray-900 placeholder-gray-500"
                />

              </div>
              <button
                onClick={handleAddNew}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
              >
                <i className="ri-add-line mr-2"></i>Thêm mới
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên thể loại</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số lượng sách</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{category.name}</td>
                      <td className="px-6 py-4 text-gray-900">{category.bookCount}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${category.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                          }`}>
                          {category.status === 'active' ? 'Đang dùng' : 'Không dùng'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{category.createdAt}</td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(category)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                          >
                            <i className="ri-edit-line"></i>
                          </button>
                          <button
                            onClick={() => toggleStatus(category.id, category.status)}
                            className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg"
                          >
                            <i className="ri-eye-line"></i>
                          </button>
                          {category.bookCount === 0 && (
                            <button
                              onClick={() => handleDelete(category.id)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                            >
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Popup thêm/sửa */}
      {showCategoryModal && (
        <CategoryModal
          editingCategory={editingCategory}
          formData={formData}
          setFormData={setFormData}
          onClose={() => setShowCategoryModal(false)}
          onSave={handleSave}
        />
      )}

      {/* Popup xác nhận xóa */}
      {showDeleteModal && (
        <ConfirmDeleteModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
