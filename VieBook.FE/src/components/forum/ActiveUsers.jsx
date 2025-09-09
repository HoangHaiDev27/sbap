import React, { useState } from "react";
import { RiUserLine, RiUserAddLine, RiUserFollowLine, RiBookLine } from "react-icons/ri";

export default function ActiveUsers({ users }) {
  const [followedUsers, setFollowedUsers] = useState(
    new Set(users.filter(user => user.isFollowing).map(user => user.name))
  );

  const toggleFollow = (userName) => {
    setFollowedUsers(prev => {
      const newFollowed = new Set(prev);
      if (newFollowed.has(userName)) {
        newFollowed.delete(userName);
      } else {
        newFollowed.add(userName);
      }
      return newFollowed;
    });
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center gap-2 mb-4">
        <RiUserLine className="text-blue-500" size={20} />
        <h3 className="font-semibold text-white">Chủ sách nổi bật</h3>
      </div>
      
      <div className="space-y-4">
        {users.map((user, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center">
              <RiUserLine className="text-slate-400" size={20} />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm truncate">{user.name}</p>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                <span className="flex items-center gap-1">
                  <RiBookLine size={12} />
                  {user.posts} sách
                </span>
                <span>{user.followers.toLocaleString()} người theo dõi</span>
              </div>
            </div>
            
            <button
              onClick={() => toggleFollow(user.name)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                followedUsers.has(user.name)
                  ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  : "bg-orange-500 text-white hover:bg-orange-600"
              }`}
            >
              {followedUsers.has(user.name) ? (
                <span className="flex items-center gap-1">
                  <RiUserFollowLine size={12} />
                  Theo dõi
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <RiUserAddLine size={12} />
                  Theo dõi
                </span>
              )}
            </button>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-4 text-orange-400 hover:text-orange-300 text-sm font-medium py-2 border-t border-slate-700 transition-colors">
        Xem tất cả người dùng
      </button>
    </div>
  );
}