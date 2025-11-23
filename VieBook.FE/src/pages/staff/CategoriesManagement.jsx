'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import CategoryModal from '../../components/staff/categories/CategoryModal';
import ConfirmDeleteModal from '../../components/staff/categories/ConfirmDeleteModal';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../../api/categoryApi';

export default function CategoriesManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // thêm filter trạng thái
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({ name: '', type: 'Genre', isActive: true });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Load categories từ API
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllCategories();
      setCategories(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  // Lọc theo search và status
  const filteredCategories = categories.filter((category) => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && category.isActive) || 
      (statusFilter === 'inactive' && !category.isActive);
    return matchesSearch && matchesStatus;
  });

  // Tính tổng số trang
  const totalPages = Math.ceil(filteredCategories.length / rowsPerPage);

  // Lấy dữ liệu cho trang hiện tại
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleAddNew = () => {
    setEditingCategory(null);
    setFormData({ name: '', isActive: true });
    setShowCategoryModal(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ 
      name: category.name, 
      isActive: category.isActive 
    });
    setShowCategoryModal(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.name.trim()) {
        setError('Tên thể loại không được để trống');
        toast.error('Tên thể loại không được để trống');
        return;
      }

      if (editingCategory) {
        // Update existing category - cần thêm categoryId vào formData và giữ type hiện tại
        const updateData = {
          ...formData,
          categoryId: editingCategory.categoryId,
          type: editingCategory.type || 'Genre' // Giữ type từ category hiện tại
        };
        await updateCategory(editingCategory.categoryId, updateData);
        toast.success(`Cập nhật thể loại "${formData.name}" thành công!`);
      } else {
        // Create new category - tự động set type = 'Genre'
        const createData = {
          ...formData,
          type: 'Genre' // Giá trị mặc định
        };
        await createCategory(createData);
        toast.success(`Tạo thể loại "${formData.name}" thành công!`);
      }
      await loadCategories(); // Reload data
      setShowCategoryModal(false);
      setError(null); // Clear error on success
    } catch (err) {
      setError(err.message);
      toast.error(`Lỗi khi ${editingCategory ? 'cập nhật' : 'tạo'} thể loại: ${err.message}`);
      console.error('Error saving category:', err);
    }
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const categoryToDelete = categories.find(cat => cat.categoryId === deleteId);
      const result = await deleteCategory(deleteId);
      await loadCategories(); // Reload data
      setShowDeleteModal(false);
      
      // Hiển thị toast phù hợp
      if (result.deactivated) {
        // Category đã được chuyển sang không hoạt động
        toast.success(result.message || `Thể loại "${categoryToDelete?.name || 'này'}" đang được sử dụng và đã chuyển sang trạng thái không hoạt động`);
      } else {
        // Category đã được xóa thành công
        toast.success(`Xóa thể loại "${categoryToDelete?.name || 'này'}" thành công!`);
      }
    } catch (err) {
      setError(err.message);
      toast.error(`Lỗi khi xóa thể loại: ${err.message}`);
      console.error('Error deleting category:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-24">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Quản lý Thể loại Sách</h2>
            <p className="text-gray-600">Quản lý các thể loại sách trên hệ thống</p>
            {error && (
              <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
              {/* Search */}
              <div className="relative w-full md:w-1/3">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="ri-search-line text-gray-400 text-sm"></i>
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm thể loại..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // reset về trang đầu
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
             focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm 
             text-gray-900 placeholder-gray-500"
                />
              </div>

              {/* Filter trạng thái */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
              </select>

              {/* Nút thêm */}
              <button
                onClick={handleAddNew}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
              >
                <i className="ri-add-line mr-2"></i>Thêm mới
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên thể loại</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số lượng sách</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="text-center py-6 text-gray-500">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          <span className="ml-2">Đang tải...</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedCategories.map((category) => (
                      <tr key={category.categoryId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{category.name}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              category.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {category.isActive ? 'Hoạt động' : 'Không hoạt động'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {category.bookCount || 0} sách
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(category)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                              title="Chỉnh sửa"
                            >
                              <i className="ri-edit-line"></i>
                            </button>
                            <button
                              onClick={() => handleDelete(category.categoryId)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                              title="Xóa"
                            >
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                  {!loading && paginatedCategories.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-6 text-gray-500">
                        Không có dữ liệu
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 flex justify-between items-center text-sm text-gray-600">
              <span>
                Trang {currentPage} / {totalPages || 1}
              </span>
              <div className="space-x-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded-lg disabled:opacity-50"
                >
                  Trước
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-3 py-1 border rounded-lg disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
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
