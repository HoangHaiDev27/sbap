import React from "react";
import { RiUserLine } from "react-icons/ri";

function ListeningCard({ item, onClick }) {
  return (
    <div
      className="flex items-center justify-between bg-gray-800 p-4 rounded-2xl hover:bg-gray-700 cursor-pointer"
      onClick={() => onClick(item)}
    >
      <div className="flex items-center space-x-4">
        <img
          src={item.image}
          alt={item.title}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div>
          <h2 className="text-lg font-medium">{item.title}</h2>
          <p className="text-sm text-gray-400 flex items-center">
            <RiUserLine className="mr-1" /> {item.author} (Tác giả)
          </p>
          <p className="text-xs text-orange-400">Đã nghe {item.progress}%</p>
        </div>
      </div>
    </div>
  );
}

export default ListeningCard;
