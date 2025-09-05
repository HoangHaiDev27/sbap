import React, { useState } from "react";

export default function UserListeningSchedule() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [showAddModal, setShowAddModal] = useState(false);

  const schedules = [
    {
      id: 1,
      date: "2024-01-20",
      time: "08:00",
      book: "Đắc Nhân Tâm (Audiobook)",
      chapter: "Chương 2: Gây thiện cảm ngay lập tức",
      duration: 20,
      completed: true,
      reminder: true,
    },
    {
      id: 2,
      date: "2024-01-20",
      time: "13:00",
      book: "Khéo ăn nói sẽ có được thiên hạ",
      chapter: "Phần I: Nghệ thuật giao tiếp",
      duration: 40,
      completed: false,
      reminder: true,
    },
    {
      id: 3,
      date: "2024-01-21",
      time: "21:00",
      book: "Hạt giống tâm hồn",
      chapter: "Câu chuyện số 12: Niềm tin",
      duration: 25,
      completed: false,
      reminder: false,
    },
  ];

  const weeklyStats = {
    totalTime: 240,
    completedSessions: 10,
    streak: 5,
  };

  const getFilteredSchedules = () => {
    return schedules.filter((schedule) => schedule.date === selectedDate);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Lịch trình nghe sách</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg text-white font-medium whitespace-nowrap transition-colors"
        >
          <i className="ri-add-line mr-2"></i>
          Thêm lịch nghe
        </button>
      </div>

      {/* Weekly stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div className="text-sm text-gray-400">Phiên đã hoàn thành</div>
        </div>
        <div className="bg-gray-750 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">
            {weeklyStats.streak} ngày
          </div>
          <div className="text-sm text-gray-400">Streak hiện tại</div>
        </div>
      </div>

      {/* Filter by date */}
      <div className="bg-gray-750 rounded-lg p-6">
        <div className="flex items-center space-x-4 mb-6">
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
            {getFilteredSchedules().length} lịch nghe cho ngày này
          </div>
        </div>

        {/* Schedules list */}
        <div className="space-y-3">
          {getFilteredSchedules().length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <i className="ri-headphone-line text-4xl mb-2"></i>
              <p>Chưa có lịch nghe nào cho ngày này</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-3 text-orange-500 hover:text-orange-400"
              >
                Thêm lịch nghe mới
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
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
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
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
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
                  <div className="flex items-center space-x-2">
                    {!schedule.completed && (
                      <button className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm text-white whitespace-nowrap">
                        Hoàn thành
                      </button>
                    )}
                    <button className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-sm text-white">
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
        <h3 className="text-lg font-semibold mb-4">Mục tiêu nghe sách</h3>
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

      {/* Modal thêm lịch */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Thêm lịch nghe mới</h3>
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
                  Chọn audiobook
                </label>
                <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white pr-8">
                  <option>Đắc Nhân Tâm</option>
                  <option>Khéo ăn nói sẽ có được thiên hạ</option>
                  <option>Hạt giống tâm hồn</option>
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
                  Thêm lịch nghe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
