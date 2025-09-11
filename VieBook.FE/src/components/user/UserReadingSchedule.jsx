import React, { useState } from "react";

function UserReadingSchedule() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [editFormData, setEditFormData] = useState({
    time: "",
    chapter: "",
    duration: "",
    reminder: false
  });

  // Dữ liệu chương cho từng cuốn sách
  const bookChapters = {
    "Sapiens - Lược sử loài người": [
      "Chương 1: Một động vật không có gì đặc biệt",
      "Chương 2: Cây tri thức",
      "Chương 3: Cách mạng nông nghiệp",
      "Chương 4: Xây dựng kim tự tháp",
      "Chương 5: Sự sụp đổ của tiền bạc",
      "Chương 6: Sự thống nhất của loài người",
      "Chương 7: Cách mạng khoa học",
      "Chương 8: Sự kết thúc của loài người"
    ],
    "Tư duy nhanh và chậm": [
      "Phần I: Hai hệ thống",
      "Phần II: Heuristics và thiên kiến",
      "Phần III: Tự tin quá mức",
      "Phần IV: Lựa chọn",
      "Phần V: Hai bản ngã"
    ],
    "Nghệ thuật sống tối giản": [
      "Chương 1: Tại sao tối giản?",
      "Chương 2: Bắt đầu từ bên trong",
      "Chương 3: Loại bỏ những thứ không cần thiết",
      "Chương 4: Tổ chức không gian sống",
      "Chương 5: Declutter không gian sống",
      "Chương 6: Tối giản trong công việc",
      "Chương 7: Tối giản trong mối quan hệ"
    ],
    "The Power of Habit": [
      "Chương 1: Vòng lặp thói quen",
      "Chương 2: Thói quen và não bộ",
      "Chương 3: Thói quen của các công ty thành công",
      "Chương 4: Thói quen của các tổ chức",
      "Chương 5: Thói quen của xã hội"
    ],
    "Deep Work": [
      "Chương 1: Làm việc sâu",
      "Chương 2: Tại sao làm việc sâu lại hiếm",
      "Chương 3: Quy tắc làm việc sâu",
      "Chương 4: Làm việc sâu",
      "Chương 5: Làm việc sâu trong thời đại số"
    ],
    "Atomic Habits": [
      "Chương 1: Thói quen nhỏ",
      "Chương 2: Cách thói quen định hình bản thân",
      "Chương 3: Cách xây dựng thói quen tốt",
      "Chương 4: Cách phá vỡ thói quen xấu",
      "Chương 5: Cách tạo thói quen dễ dàng"
    ],
    "Rich Dad Poor Dad": [
      "Chương 1: Người cha giàu, người cha nghèo",
      "Chương 2: Tại sao dạy tài chính",
      "Chương 3: Học cách đầu tư",
      "Chương 4: Làm việc để học, không phải để kiếm tiền",
      "Chương 5: Lịch sử thuế và quyền lực của tập đoàn"
    ]
  };

  const schedules = [
    {
      id: 1,
      date: "2024-01-20",
      time: "07:00",
      book: "Sapiens - Lược sử loài người",
      chapter: "Chương 3: Cách mạng nông nghiệp",
      duration: 30,
      completed: true,
      reminder: true,
    },
    {
      id: 2,
      date: "2024-01-20",
      time: "12:30",
      book: "Tư duy nhanh và chậm",
      chapter: "Phần II: Heuristics và thiên kiến",
      duration: 45,
      completed: false,
      reminder: true,
    },
    {
      id: 3,
      date: "2024-01-21",
      time: "19:00",
      book: "Nghệ thuật sống tối giản",
      chapter: "Chương 5: Declutter không gian sống",
      duration: 25,
      completed: false,
      reminder: false,
    },
    // 🔹 Data mẫu thêm để test UI
    {
      id: 4,
      date: "2024-01-21",
      time: "09:00",
      book: "The Power of Habit",
      chapter: "Chương 2: Thói quen và não bộ",
      duration: 40,
      completed: true,
      reminder: false,
    },
    {
      id: 5,
      date: "2024-01-21",
      time: "21:00",
      book: "Deep Work",
      chapter: "Chương 4: Làm việc sâu",
      duration: 60,
      completed: false,
      reminder: true,
    },
    {
      id: 6,
      date: "2024-01-22",
      time: "06:30",
      book: "Atomic Habits",
      chapter: "Chương 1: Thói quen nhỏ",
      duration: 20,
      completed: true,
      reminder: true,
    },
    {
      id: 7,
      date: "2024-01-22",
      time: "20:00",
      book: "Rich Dad Poor Dad",
      chapter: "Chương 3: Học cách đầu tư",
      duration: 50,
      completed: false,
      reminder: false,
    },
  ];

  const weeklyStats = {
    totalTime: 180,
    completedSessions: 12,
    streak: 7,
  };

  const getFilteredSchedules = () => {
    return schedules.filter((schedule) => schedule.date === selectedDate);
  };

  const handleEditClick = (schedule) => {
    setEditingSchedule(schedule);
    setEditFormData({
      time: schedule.time,
      chapter: schedule.chapter,
      duration: schedule.duration.toString(),
      reminder: schedule.reminder
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

  const handleEditSave = () => {
    // TODO: Implement save logic here
    console.log('Saving edited schedule:', editingSchedule.id, editFormData);
    setShowEditModal(false);
    setEditingSchedule(null);
  };

  const handleEditCancel = () => {
    setShowEditModal(false);
    setEditingSchedule(null);
    setEditFormData({
      time: "",
      chapter: "",
      duration: "",
      reminder: false
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl font-semibold">Lịch trình đọc sách</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg text-white font-medium whitespace-nowrap transition-colors w-full sm:w-auto"
        >
          <i className="ri-add-line mr-2"></i>
          Thêm lịch trình
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-750 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-400 mb-1">
            {weeklyStats.totalTime} phút
          </div>
          <div className="text-sm text-gray-400">Tuần này</div>
        </div>
        <div className="bg-gray-750 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {weeklyStats.completedSessions}
          </div>
          <div className="text-sm text-gray-400">Phiên hoàn thành</div>
        </div>
        <div className="bg-gray-750 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">
            {weeklyStats.streak} ngày
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
          {getFilteredSchedules().length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <i className="ri-calendar-line text-4xl mb-2"></i>
              <p>Chưa có lịch trình nào cho ngày này</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-3 text-orange-500 hover:text-orange-400"
              >
                Thêm lịch trình mới
              </button>
            </div>
          ) : (
            getFilteredSchedules().map((schedule) => (
              <div
                key={schedule.id}
                className={`bg-gray-800 rounded-lg p-4 border-l-4 ${
                  schedule.completed ? "border-green-500" : "border-orange-500"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="font-semibold text-white">
                        {schedule.time}
                      </span>
                      <span className="text-orange-400">{schedule.book}</span>
                      {schedule.reminder && (
                        <i
                          className="ri-notification-3-line text-yellow-400"
                          title="Có nhắc nhở"
                        ></i>
                      )}
                    </div>
                    <div className="text-sm text-gray-400 mb-2">
                      {schedule.chapter}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                      <span>
                        <i className="ri-time-line mr-1"></i>
                        {schedule.duration} phút
                      </span>
                      {schedule.completed && (
                        <span className="text-green-400">
                          <i className="ri-check-line mr-1"></i>
                          Đã hoàn thành
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                    {!schedule.completed && (
                      <button className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm text-white whitespace-nowrap">
                        Hoàn thành
                      </button>
                    )}
                    <button 
                      onClick={() => handleEditClick(schedule)}
                      className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-sm text-white"
                    >
                      <i className="ri-edit-line"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Goals */}
      <div className="bg-gray-750 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Mục tiêu đọc sách</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Mục tiêu hàng ngày</span>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                defaultValue="30"
                className="w-20 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-center"
              />
              <span className="text-gray-400">phút</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span>Mục tiêu hàng tuần</span>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                defaultValue="5"
                className="w-20 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-center"
              />
              <span className="text-gray-400">giờ</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span>Nhắc nhở</span>
            <div className="flex items-center space-x-2">
              <select className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white pr-8">
                <option>15 phút trước</option>
                <option>30 phút trước</option>
                <option>1 giờ trước</option>
                <option>Tắt nhắc nhở</option>
              </select>
            </div>
          </div>
        </div>
        <button className="mt-4 bg-orange-500 hover:bg-orange-600 px-6 py-2 rounded-lg text-white font-medium whitespace-nowrap">
          Lưu cài đặt
        </button>
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
                <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white pr-8">
                  <option>Sapiens - Lược sử loài người</option>
                  <option>Tư duy nhanh và chậm</option>
                  <option>Nghệ thuật sống tối giản</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ngày
                  </label>
                  <input
                    type="date"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Giờ
                  </label>
                  <input
                    type="time"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Thời gian nghe (phút)
                </label>
                <input
                  type="number"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                  placeholder="30"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="reminder" className="rounded" />
                <label htmlFor="reminder" className="text-sm text-gray-300">
                  Bật nhắc nhở
                </label>
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
                  type="submit"
                  onClick={() => setShowAddModal(false)}
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
                  value={editingSchedule.book}
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
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 outline-none"
                  />
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
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 outline-none"
                    placeholder="30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Chương
                </label>
                <select
                  name="chapter"
                  value={editFormData.chapter}
                  onChange={handleEditFormChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 outline-none pr-8"
                >
                  <option value="">Chọn chương</option>
                  {editingSchedule && bookChapters[editingSchedule.book]?.map((chapter, index) => (
                    <option key={index} value={chapter}>
                      {chapter}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="editReminder" 
                  name="reminder"
                  checked={editFormData.reminder}
                  onChange={handleEditFormChange}
                  className="rounded" 
                />
                <label htmlFor="editReminder" className="text-sm text-gray-300">
                  Bật nhắc nhở
                </label>
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
    </div>
  );
}

export default UserReadingSchedule;
