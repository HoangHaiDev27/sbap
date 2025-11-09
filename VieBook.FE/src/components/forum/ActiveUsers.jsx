import React from "react";
import { RiUserLine, RiHeartLine } from "react-icons/ri";

export default function ActiveUsers({ users, onUserClick }) {
  const handleUserClick = (userId) => {
    if (onUserClick) {
      onUserClick(userId);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center gap-2 mb-4">
        <RiUserLine className="text-blue-500" size={20} />
        <h3 className="font-semibold text-white">Chủ sách nổi bật</h3>
      </div>
      
      <div className="space-y-4">
        {users.map((user, index) => (
          <div 
            key={user.userId || index} 
            onClick={() => handleUserClick(user.userId)}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-750 cursor-pointer transition-colors group"
          >
            <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <RiUserLine className="text-slate-400" size={20} />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm truncate group-hover:text-orange-400 transition-colors">
                {user.name}
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                <span className="flex items-center gap-1">
                  <RiHeartLine size={12} />
                  {user.totalReactions || 0} lượt thích
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-4 text-orange-400 hover:text-orange-300 text-sm font-medium py-2 border-t border-slate-700 transition-colors">
        Xem tất cả người dùng
      </button>
    </div>
  );
}