import { useState } from "react";
import { RiSendPlane2Line } from "react-icons/ri";

// demo staff
const staffs = [
  {
    id: 1,
    name: "Lê Minh Quân",
    role: "Support Manager",
    avatar: "https://i.pravatar.cc/50?img=1",
    lastMsg: "Tôi sẽ kiểm tra vấn đề thanh toán này cho bạn",
    time: "10:30",
  },
  {
    id: 2,
    name: "Nguyễn Thị Lan",
    role: "Technical Support",
    avatar: "https://i.pravatar.cc/50?img=2",
    lastMsg: "File đã được upload thành công",
    time: "Hôm qua",
  },
  {
    id: 3,
    name: "Phạm Văn Hưng",
    role: "Content Reviewer",
    avatar: "https://i.pravatar.cc/50?img=3",
    lastMsg: "Sách của bạn đã được duyệt",
    time: "2 ngày",
  },
];

// demo messages riêng theo staffId
const demoMessages = {
  1: [
    { sender: "staff", text: "Xin chào! Tôi là Lê Minh Quân từ đội hỗ trợ BookVoice.", time: "09:00" },
    { sender: "me", text: "Chào anh! Tôi gặp vấn đề với việc thanh toán từ khách hàng.", time: "09:05" },
    { sender: "staff", text: "Bạn có thể gửi cho tôi ID giao dịch không? Tôi sẽ kiểm tra ngay.", time: "09:07" },
  ],
  2: [
    { sender: "staff", text: "File upload của bạn đã thành công.", time: "08:00" },
    { sender: "me", text: "Cảm ơn chị ạ!", time: "08:01" },
  ],
  3: [
    { sender: "staff", text: "Sách của bạn đã được duyệt và đăng lên nền tảng.", time: "10:15" },
    { sender: "me", text: "Tuyệt vời, cảm ơn anh nhiều!", time: "10:17" },
  ],
};

export default function SupportChat() {
  const [activeStaff, setActiveStaff] = useState(staffs[0]);
  const [messages, setMessages] = useState(demoMessages[staffs[0].id]);
  const [input, setInput] = useState("");

  const quickReplies = ["Cảm ơn bạn!", "Tôi hiểu rồi", "Cần thêm thông tin", "Đã xong chưa?", "Ok, không vấn đề gì"];

  const sendMessage = (msgText) => {
    const text = msgText || input.trim();
    if (!text) return;
    const newMsg = { sender: "me", text, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setMessages([...messages, newMsg]);
    setInput("");
  };

  const switchStaff = (staff) => {
    setActiveStaff(staff);
    setMessages(demoMessages[staff.id] || []);
  };

  return (
    <div className="flex h-screen bg-slate-900 text-white">
      {/* Sidebar staff */}
      <div className="w-72 border-r border-slate-700 flex flex-col">
        <div className="p-4 font-bold text-lg border-b border-slate-700">Chat với Staff</div>
        <input
          type="text"
          placeholder="Tìm kiếm staff..."
          className="m-3 px-3 py-2 rounded bg-slate-800 focus:outline-none text-sm"
        />
        <div className="flex-1 overflow-y-auto">
          {staffs.map((s) => (
            <div
              key={s.id}
              onClick={() => switchStaff(s)}
              className={`flex items-center p-3 cursor-pointer hover:bg-slate-800 border-b border-slate-800 ${
                activeStaff.id === s.id ? "bg-slate-800" : ""
              }`}
            >
              <img src={s.avatar} alt={s.name} className="w-10 h-10 rounded-full mr-3" />
              <div>
                <div className="font-semibold">{s.name}</div>
                <div className="text-xs text-gray-400">{s.lastMsg}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-slate-700 space-y-2">
          <button className="w-full px-3 py-2 bg-orange-500 rounded hover:bg-orange-600 text-sm">
            + Tạo ticket hỗ trợ
          </button>
          <button className="w-full px-3 py-2 bg-slate-700 rounded text-sm">📜 Lịch sử hỗ trợ</button>
        </div>
      </div>

      {/* Chat window */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex items-center gap-3">
          <img src={activeStaff.avatar} alt={activeStaff.name} className="w-10 h-10 rounded-full" />
          <div>
            <h2 className="font-semibold">{activeStaff.name}</h2>
            <p className="text-xs text-green-400">{activeStaff.role} • Đang online</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.sender === "me" ? "justify-end" : "justify-start"}`}>
              <div
                className={`px-4 py-2 rounded-lg max-w-xs ${
                  m.sender === "me" ? "bg-orange-500 text-white" : "bg-slate-800 text-gray-200"
                }`}
              >
                {m.text}
                <div className="text-[10px] text-gray-300 mt-1">{m.time}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick replies */}
        <div className="p-2 flex gap-2 overflow-x-auto border-t border-slate-700">
          {quickReplies.map((qr, i) => (
            <button
              key={i}
              onClick={() => sendMessage(qr)}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm whitespace-nowrap"
            >
              {qr}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-slate-700 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Nhập tin nhắn..."
            className="flex-1 px-3 py-2 bg-slate-800 rounded focus:outline-none"
          />
          <button onClick={() => sendMessage()} className="p-2 bg-orange-500 rounded hover:bg-orange-600">
            <RiSendPlane2Line size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
