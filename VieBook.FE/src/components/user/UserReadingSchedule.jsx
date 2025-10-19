import React, { useState, useEffect } from "react";
import { 
  getReadingSchedulesByDate, 
  createReadingSchedule, 
  updateReadingSchedule, 
  deleteReadingSchedule, 
  markScheduleCompleted, 
  getReadingScheduleStats 
} from "../../api/readingScheduleApi";
import { getUserPurchasedBooks } from "../../api/bookApi";
import { getCurrentUser } from "../../api/authApi";
import ReminderSettings from "./ReminderSettings";

function UserReadingSchedule() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingSchedule, setDeletingSchedule] = useState(null);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success"); // success, error
  const [bookSearch, setBookSearch] = useState("");
  const [showAllBooks, setShowAllBooks] = useState(false);

  // Show toast notification
  const showToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  // Helper function to get AM/PM (database stores UTC, convert to Vietnam time for display only)
  const getAMPM = (date) => {
    const dateObj = new Date(date);
    // Convert from UTC to Vietnam timezone (UTC+7) for display only
    const vietnamTime = new Date(dateObj.getTime() + (7 * 60 * 60 * 1000));
    return vietnamTime.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    }).split(' ')[1];
  };

  // Helper function to format time for display (database stores UTC, convert to Vietnam time for display only)
  const formatTimeForDisplay = (date) => {
    const dateObj = new Date(date);
    // Convert from UTC to Vietnam timezone (UTC+7) for display only
    const vietnamTime = new Date(dateObj.getTime() + (7 * 60 * 60 * 1000));
    return vietnamTime.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Filter books based on search
  const getFilteredBooks = () => {
    let filteredBooks = books;
    
    if (bookSearch.trim()) {
      filteredBooks = books.filter(book => 
        book.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
        book.author?.toLowerCase().includes(bookSearch.toLowerCase())
      );
    }
    
    // Limit display to 5 books initially, show all if showAllBooks is true
    if (!showAllBooks && filteredBooks.length > 5) {
      return filteredBooks.slice(0, 5);
    }
    
    return filteredBooks;
  };

  const hasMoreBooks = () => {
    const filteredBooks = bookSearch.trim() 
      ? books.filter(book => 
          book.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
          book.author?.toLowerCase().includes(bookSearch.toLowerCase())
        )
      : books;
    return filteredBooks.length > 5;
  };
  const [schedules, setSchedules] = useState([]);
  const [books, setBooks] = useState([]);
  const [stats, setStats] = useState({
    totalTime: 0,
    completedSessions: 0,
    streak: 0,
    totalSchedules: 0
  });
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    time: "",
    duration: "",
    reminder: true
  });
  const [addFormData, setAddFormData] = useState({
    bookId: "",
    date: new Date().toISOString().split('T')[0], // Default: hôm nay
    time: "09:00", // Default: 9:00 AM
    duration: "30", // Default: 30 phút
    reminder: true
  });


  // Load data on component mount
  useEffect(() => {
    loadCurrentUser();
  }, []);

  // Load other data when userId is available
  useEffect(() => {
    if (currentUserId) {
      loadBooks();
      loadSchedules();
      loadStats();
    }
  }, [currentUserId]);

  // Load schedules when date changes
  useEffect(() => {
    if (currentUserId) {
      loadSchedules();
    }
  }, [selectedDate, currentUserId]);

  const loadCurrentUser = async () => {
    try {
      const user = await getCurrentUser();
      if (user && user.userId) {
        setCurrentUserId(user.userId);
      }
    } catch (error) {
      console.error("Error loading current user:", error);
    }
  };

  const loadBooks = async () => {
    try {
      const booksData = await getUserPurchasedBooks();
      setBooks(booksData);
    } catch (error) {
      console.error("Error loading books:", error);
    }
  };

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const schedulesData = await getReadingSchedulesByDate(currentUserId, selectedDate);
      setSchedules(schedulesData);
    } catch (error) {
      console.error("Error loading schedules:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await getReadingScheduleStats(currentUserId);
      setStats(statsData);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const getFilteredSchedules = () => {
    return schedules;
  };

  const handleEditClick = (schedule) => {
    setEditingSchedule(schedule);
    const beginReadAt = new Date(schedule.beginReadAt);
    // Convert UTC to Vietnam time for display only
    const vietnamTime = new Date(beginReadAt.getTime() + (7 * 60 * 60 * 1000));
    setEditFormData({
      time: vietnamTime.toTimeString().slice(0, 5),
      duration: schedule.readingTime.toString(),
      reminder: true
    });
    setShowEditModal(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEditSave = async () => {
    try {
      // Clear previous validation errors
      setValidationErrors({});
      
      const errors = {};
      
      // Validation
      if (!editFormData.time) {
        errors.time = "Vui lòng chọn giờ";
      }
      
      if (!editFormData.duration || parseInt(editFormData.duration) <= 0) {
        errors.duration = "Thời gian đọc phải lớn hơn 0";
      }
      
      // Check if time is in the past for today (using Vietnam timezone)
      const selectedDateObj = new Date(selectedDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDateObj.getTime() === today.getTime()) {
        const [year, month, day] = selectedDate.split('-');
        const [hours, minutes] = editFormData.time.split(':');
        const selectedDateTime = new Date(year, month - 1, day, parseInt(hours), parseInt(minutes));
        const now = new Date();
        
        if (selectedDateTime < now) {
          errors.time = "Không thể cập nhật lịch trình cho thời gian quá khứ";
        }
      }
      
      // If there are validation errors, show them and return
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }
      
      // Create date in Vietnam timezone (database stores UTC, so convert to UTC)
      const [year, month, day] = selectedDate.split('-');
      const [hours, minutes] = editFormData.time.split(':');
      
      console.log('Debug Edit - Input data:', {
        selectedDate,
        time: editFormData.time,
        year, month, day, hours, minutes
      });
      
      // Create Vietnam time as UTC string, then convert to Date
      const vietnamTimeString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00+07:00`;
      console.log('Debug Edit - vietnamTimeString:', vietnamTimeString);
      
      const beginReadAt = new Date(vietnamTimeString);
      console.log('Debug Edit - beginReadAt:', beginReadAt);
      console.log('Debug Edit - beginReadAt.toString():', beginReadAt.toString());
      
      // Convert to UTC for database storage
      const utcTime = new Date(beginReadAt.getTime());
      console.log('Debug Edit - utcTime:', utcTime);
      console.log('Debug Edit - utcTime.toString():', utcTime.toString());
      
      const updateData = {
        beginReadAt: utcTime.toISOString(),
        readingTime: parseInt(editFormData.duration),
        isActive: editFormData.reminder  // Sửa logic: reminder = true → isActive = true
      };
      
      console.log('Debug Edit - updateData:', updateData);
      
      await updateReadingSchedule(editingSchedule.scheduleId, updateData);
      await loadSchedules();
      setShowEditModal(false);
      setEditingSchedule(null);
      showToast("Đã cập nhật lịch trình thành công!", "success");
    } catch (error) {
      console.error("Error updating schedule:", error);
      showToast("Không thể cập nhật lịch trình. Vui lòng thử lại!", "error");
    }
  };

  const handleEditCancel = () => {
    setShowEditModal(false);
    setEditingSchedule(null);
    setEditFormData({
      time: "",
      duration: "",
      reminder: true
    });
  };

  const handleAddFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddSave = async () => {
    try {
      // Clear previous validation errors
      setValidationErrors({});
      
      const errors = {};
      
      // Validation
      if (!addFormData.bookId) {
        errors.bookId = "Vui lòng chọn sách";
      }
      
      if (!addFormData.date) {
        errors.date = "Vui lòng chọn ngày";
      }
      
      if (!addFormData.time) {
        errors.time = "Vui lòng chọn giờ";
      }
      
      if (!addFormData.duration || parseInt(addFormData.duration) <= 0) {
        errors.duration = "Thời gian đọc phải lớn hơn 0";
      }
      
      // Check if date is in the past
      const selectedDate = new Date(addFormData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        errors.date = "Không thể tạo lịch trình cho ngày quá khứ";
      }
      
      // Check if time is in the past for today (using Vietnam timezone)
      if (selectedDate.getTime() === today.getTime()) {
        const [year, month, day] = addFormData.date.split('-');
        const [hours, minutes] = addFormData.time.split(':');
        const selectedDateTime = new Date(year, month - 1, day, parseInt(hours), parseInt(minutes));
        const now = new Date();
        
        if (selectedDateTime < now) {
          errors.time = "Không thể tạo lịch trình cho thời gian quá khứ";
        }
      }
      
      // If there are validation errors, show them and return
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }
      
      // Create date in Vietnam timezone (database stores UTC, so convert to UTC)
      const [year, month, day] = addFormData.date.split('-');
      const [hours, minutes] = addFormData.time.split(':');
      
      console.log('Debug - Input data:', {
        date: addFormData.date,
        time: addFormData.time,
        year, month, day, hours, minutes
      });
      
      // Create Vietnam time as UTC string, then convert to Date
      const vietnamTimeString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00+07:00`;
      console.log('Debug - vietnamTimeString:', vietnamTimeString);
      
      const beginReadAt = new Date(vietnamTimeString);
      console.log('Debug - beginReadAt:', beginReadAt);
      console.log('Debug - beginReadAt.toString():', beginReadAt.toString());
      
      // Convert to UTC for database storage
      const utcTime = new Date(beginReadAt.getTime());
      console.log('Debug - utcTime:', utcTime);
      console.log('Debug - utcTime.toString():', utcTime.toString());
      
      const scheduleData = {
        bookId: parseInt(addFormData.bookId),
        beginReadAt: utcTime.toISOString(),
        readingTime: parseInt(addFormData.duration),
        isActive: addFormData.reminder  // Sửa logic: reminder = true → isActive = true
      };
      
      console.log('Creating schedule with data:', scheduleData);
      await createReadingSchedule(scheduleData);
      await loadSchedules();
      setShowAddModal(false);
      setAddFormData({
        bookId: "",
        date: new Date().toISOString().split('T')[0], // Reset to today
        time: "09:00", // Reset to 9:00 AM
        duration: "30", // Reset to 30 minutes
        reminder: true
      });
      setBookSearch(""); // Reset search
      setShowAllBooks(false); // Reset show all books
      showToast("Đã tạo lịch trình thành công!", "success");
    } catch (error) {
      console.error("Error creating schedule:", error);
      showToast("Không thể tạo lịch trình. Vui lòng thử lại!", "error");
    }
  };

  const handleMarkCompleted = async (scheduleId) => {
    try {
      await markScheduleCompleted(scheduleId);
      await loadSchedules();
      await loadStats();
      showToast("Đã đánh dấu lịch trình hoàn thành!", "success");
    } catch (error) {
      console.error("Error marking schedule as completed:", error);
      showToast("Không thể đánh dấu hoàn thành. Vui lòng thử lại!", "error");
    }
  };

  const handleDeleteClick = (schedule) => {
    setDeletingSchedule(schedule);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteReadingSchedule(deletingSchedule.scheduleId);
      await loadSchedules();
      await loadStats();
      setShowDeleteModal(false);
      setDeletingSchedule(null);
      showToast("Đã xóa lịch trình thành công!", "success");
    } catch (error) {
      console.error("Error deleting schedule:", error);
      if (error.message.includes("not found")) {
        showToast("Lịch trình không tồn tại hoặc đã bị xóa", "error");
      } else {
        showToast("Không thể xóa lịch trình. Vui lòng thử lại!", "error");
      }
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeletingSchedule(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl font-semibold">Lịch trình đọc sách</h2>
        <div className="flex gap-3">
          <ReminderSettings />
          <button
            onClick={() => {
              setShowAddModal(true);
              setBookSearch(""); // Reset search when opening modal
              setShowAllBooks(false); // Reset show all books
            }}
            className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg text-white font-medium whitespace-nowrap transition-colors w-full sm:w-auto"
          >
            <i className="ri-add-line mr-2"></i>
            Thêm lịch trình
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-750 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-400 mb-1">
            {stats.totalTime} phút
          </div>
          <div className="text-sm text-gray-400">Tuần này</div>
        </div>
        <div className="bg-gray-750 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {stats.completedSessions}
          </div>
          <div className="text-sm text-gray-400">Phiên hoàn thành</div>
        </div>
        <div className="bg-gray-750 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">
            {stats.streak} ngày
          </div>
          <div className="text-sm text-gray-400">Streak hiện tại</div>
        </div>
      </div>

      {/* Schedule list */}
      <div className="bg-gray-750 rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Chọn ngày
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 outline-none"
            />
          </div>
          <div className="text-sm text-gray-400">
            {getFilteredSchedules().length} lịch trình cho ngày này
          </div>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8 text-gray-400">
              <i className="ri-loader-4-line text-4xl mb-2 animate-spin"></i>
              <p>Đang tải lịch trình...</p>
            </div>
          ) : getFilteredSchedules().length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <i className="ri-calendar-line text-4xl mb-2"></i>
              <p>Chưa có lịch trình nào cho ngày này</p>
              <button
                onClick={() => {
                  setShowAddModal(true);
                  setBookSearch(""); // Reset search when opening modal
                  setShowAllBooks(false); // Reset show all books
                }}
                className="mt-3 text-orange-500 hover:text-orange-400"
              >
                Thêm lịch trình mới
              </button>
            </div>
          ) : (
            getFilteredSchedules().map((schedule) => {
              const timeString = formatTimeForDisplay(schedule.beginReadAt);
              const isCompleted = !schedule.isActive;
              
              return (
                <div
                  key={schedule.scheduleId}
                  className={`bg-gray-800 rounded-lg p-4 border-l-4 ${
                    isCompleted ? "border-green-500" : "border-orange-500"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-white">
                            {timeString}
                          </span>
                        </div>
                        <span className="text-orange-400">{schedule.bookTitle}</span>
                        {schedule.reminder && (
                          <i
                            className="ri-notification-3-line text-yellow-400"
                            title="Có nhắc nhở"
                          ></i>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                        <span>
                          <i className="ri-time-line mr-1"></i>
                          {schedule.readingTime} phút
                        </span>
                        {isCompleted && (
                          <span className="text-green-400">
                            <i className="ri-check-line mr-1"></i>
                            Đã hoàn thành
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                      {!isCompleted && (
                        <button 
                          onClick={() => handleMarkCompleted(schedule.scheduleId)}
                          className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm text-white whitespace-nowrap"
                        >
                          Hoàn thành
                        </button>
                      )}
                      <button 
                        onClick={() => handleEditClick(schedule)}
                        className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-sm text-white"
                      >
                        <i className="ri-edit-line"></i>
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(schedule)}
                        className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm text-white"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>


      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Thêm lịch trình mới</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Chọn sách
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm sách..."
                    value={bookSearch}
                    onChange={(e) => {
                      setBookSearch(e.target.value);
                      setShowAllBooks(false); // Reset show all when searching
                    }}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white pr-10"
                  />
                  <i className="ri-search-line absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  {bookSearch && (
                    <button
                      onClick={() => {
                        setBookSearch("");
                        setShowAllBooks(false);
                      }}
                      className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      <i className="ri-close-line"></i>
                    </button>
                  )}
                </div>
                <div className="mt-2 max-h-48 overflow-y-auto border border-gray-600 rounded-lg bg-gray-700">
                  {getFilteredBooks().length === 0 ? (
                    <div className="p-3 text-gray-400 text-center">
                      {bookSearch ? "Không tìm thấy sách nào" : "Chưa có sách nào"}
                    </div>
                  ) : (
                    <>
                      {getFilteredBooks().map((book) => (
                        <div
                          key={book.bookId}
                          onClick={() => {
                            setAddFormData(prev => ({ ...prev, bookId: book.bookId.toString() }));
                            setBookSearch(book.title);
                          }}
                          className={`p-2 cursor-pointer hover:bg-gray-600 border-b border-gray-600 last:border-b-0 ${
                            addFormData.bookId === book.bookId.toString() ? 'bg-orange-500 text-white' : 'text-white'
                          }`}
                        >
                          <div className="font-medium text-sm truncate">{book.title}</div>
                          {book.author && (
                            <div className="text-xs text-gray-400 truncate">{book.author}</div>
                          )}
                        </div>
                      ))}
                      {hasMoreBooks() && !showAllBooks && (
                        <div 
                          onClick={() => setShowAllBooks(true)}
                          className="p-2 cursor-pointer hover:bg-gray-600 text-center text-orange-400 text-sm border-t border-gray-600"
                        >
                          <i className="ri-arrow-down-s-line mr-1"></i>
                          Xem thêm ({books.length - 5} sách khác)
                        </div>
                      )}
                      {showAllBooks && hasMoreBooks() && (
                        <div 
                          onClick={() => setShowAllBooks(false)}
                          className="p-2 cursor-pointer hover:bg-gray-600 text-center text-gray-400 text-sm border-t border-gray-600"
                        >
                          <i className="ri-arrow-up-s-line mr-1"></i>
                          Thu gọn
                        </div>
                      )}
                    </>
                  )}
                </div>
                {validationErrors.bookId && (
                  <p className="text-red-400 text-sm mt-1">{validationErrors.bookId}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ngày
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={addFormData.date}
                    onChange={handleAddFormChange}
                    className={`w-full bg-gray-700 border rounded-lg px-4 py-2 text-white ${
                      validationErrors.date ? 'border-red-500' : 'border-gray-600'
                    }`}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {validationErrors.date && (
                    <p className="text-red-400 text-sm mt-1">{validationErrors.date}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Giờ
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={addFormData.time}
                    onChange={handleAddFormChange}
                    className={`w-full bg-gray-700 border rounded-lg px-4 py-2 text-white ${
                      validationErrors.time ? 'border-red-500' : 'border-gray-600'
                    }`}
                  />
                  {validationErrors.time && (
                    <p className="text-red-400 text-sm mt-1">{validationErrors.time}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Thời gian đọc (phút)
                </label>
                <input
                  type="number"
                  name="duration"
                  value={addFormData.duration}
                  onChange={handleAddFormChange}
                  className={`w-full bg-gray-700 border rounded-lg px-4 py-2 text-white ${
                    validationErrors.duration ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="30"
                  min="1"
                  max="1440"
                />
                {validationErrors.duration && (
                  <p className="text-red-400 text-sm mt-1">{validationErrors.duration}</p>
                )}
              </div>


              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 py-2 rounded-lg text-white font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleAddSave}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 py-2 rounded-lg text-white font-medium transition-colors"
                >
                  Thêm lịch trình
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingSchedule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Chỉnh sửa lịch trình</h3>
              <button
                onClick={handleEditCancel}
                className="text-gray-400 hover:text-white"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sách
                </label>
                <input
                  type="text"
                  value={editingSchedule.bookTitle}
                  disabled
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-400 cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Giờ
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={editFormData.time}
                    onChange={handleEditFormChange}
                    className={`w-full bg-gray-700 border rounded-lg px-4 py-2 text-white focus:border-orange-500 outline-none ${
                      validationErrors.time ? 'border-red-500' : 'border-gray-600'
                    }`}
                  />
                  {validationErrors.time && (
                    <p className="text-red-400 text-sm mt-1">{validationErrors.time}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Thời gian (phút)
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={editFormData.duration}
                    onChange={handleEditFormChange}
                    className={`w-full bg-gray-700 border rounded-lg px-4 py-2 text-white focus:border-orange-500 outline-none ${
                      validationErrors.duration ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="30"
                    min="1"
                    max="1440"
                  />
                  {validationErrors.duration && (
                    <p className="text-red-400 text-sm mt-1">{validationErrors.duration}</p>
                  )}
                </div>
              </div>



              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleEditCancel}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 py-2 rounded-lg text-white font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleEditSave}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 py-2 rounded-lg text-white font-medium transition-colors"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingSchedule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Xác nhận xóa</h3>
              <button
                onClick={handleDeleteCancel}
                className="text-gray-400 hover:text-white"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-300 mb-2">
                Bạn có chắc chắn muốn xóa lịch trình này?
              </p>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-white">
                      {formatTimeForDisplay(deletingSchedule.beginReadAt)}
                    </span>
                  </div>
                  <span className="text-orange-400">{deletingSchedule.bookTitle}</span>
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  {deletingSchedule.readingTime} phút
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleDeleteCancel}
                className="flex-1 bg-gray-600 hover:bg-gray-700 py-2 rounded-lg text-white font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex-1 bg-red-600 hover:bg-red-700 py-2 rounded-lg text-white font-medium transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`rounded-lg p-4 shadow-lg ${
            toastType === "success" 
              ? "bg-green-600 text-white" 
              : "bg-red-600 text-white"
          }`}>
            <div className="flex items-center gap-2">
              <i className={`ri-${toastType === "success" ? "check-line" : "error-warning-line"}`}></i>
              <span>{toastMessage}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserReadingSchedule;
