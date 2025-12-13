import React, { useState, useEffect } from "react";
import { RiSettings3Line, RiSaveLine, RiCloseLine } from "react-icons/ri";
import { getMyReminderSettings, createOrUpdateReminderSettings } from "../../api/reminderSettingsApi";

export default function ReminderSettings() {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(null);
  const [formData, setFormData] = useState({
    dailyGoalMinutes: 30,
    weeklyGoalHours: 5,
    reminderMinutesBefore: 15,
    isActive: true
  });
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getMyReminderSettings();
      setSettings(data);
      setFormData({
        dailyGoalMinutes: data.dailyGoalMinutes || 30,
        weeklyGoalHours: data.weeklyGoalHours || 5,
        reminderMinutesBefore: data.reminderMinutesBefore || 15,
        isActive: data.isActive !== undefined ? data.isActive : true // Mặc định bật reminder
      });
    } catch (error) {
      console.error("Error loading settings:", error);
      // Nếu không có settings, sử dụng default values với isActive = true
      setFormData({
        dailyGoalMinutes: 30,
        weeklyGoalHours: 5,
        reminderMinutesBefore: 15,
        isActive: true // Mặc định bật reminder để email có thể được gửi
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : parseInt(value) || 0
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await createOrUpdateReminderSettings(formData);
      await loadSettings(); // Reload settings
      setShowModal(false);
      showToast("Cài đặt nhắc nhở đã được lưu thành công!", "success");
    } catch (error) {
      console.error("Error saving settings:", error);
      showToast("Có lỗi xảy ra khi lưu cài đặt!", "error");
    } finally {
      setSaving(false);
    }
  };

  const showToast = (message, type) => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage("");
      setToastType("");
    }, 3000);
  };

  const reminderOptions = [
    { value: 5, label: "5 phút trước" },
    { value: 10, label: "10 phút trước" },
    { value: 15, label: "15 phút trước" },
    { value: 30, label: "30 phút trước" },
    { value: 60, label: "1 giờ trước" }
  ];

  return (
    <>
      {/* Settings Button */}
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
      >
        <RiSettings3Line size={20} />
        <span>Cài đặt nhắc nhở</span>
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Mục tiêu đọc sách</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <RiCloseLine size={24} />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Daily Goal */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mục tiêu hàng ngày
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="dailyGoalMinutes"
                    value={formData.dailyGoalMinutes}
                    onChange={handleInputChange}
                    min="1"
                    max="1440"
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  />
                  <span className="text-gray-400">phút</span>
                </div>
              </div>

              {/* Weekly Goal */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mục tiêu hàng tuần
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="weeklyGoalHours"
                    value={formData.weeklyGoalHours}
                    onChange={handleInputChange}
                    min="1"
                    max="168"
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  />
                  <span className="text-gray-400">giờ</span>
                </div>
              </div>

              {/* Reminder */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nhắc nhở
                </label>
                <select
                  name="reminderMinutesBefore"
                  value={formData.reminderMinutesBefore}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                >
                  {reminderOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500"
                />
                <label className="text-sm text-gray-300">
                  Bật nhắc nhở
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-500 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <RiSaveLine size={16} />
                    Lưu cài đặt
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg ${
          toastType === "success" ? "bg-green-500" : "bg-red-500"
        } text-white`}>
          {toastMessage}
        </div>
      )}
    </>
  );
}
