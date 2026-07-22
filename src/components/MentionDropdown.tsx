import React from 'react';
import { User } from '../types/chat';

interface MentionDropdownProps {
  users: User[];
  selectedIndex: number;
  onSelect: (user: User) => void;
}

export const MentionDropdown: React.FC<MentionDropdownProps> = ({
  users,
  selectedIndex,
  onSelect,
}) => {
  if (users.length === 0) return null;

  return (
    <div className="absolute bottom-full left-4 mb-2 w-64 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
      <div className="p-2 border-b border-slate-700 text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center justify-between">
        <span>Mentions</span>
        <span className="text-[9px] text-slate-500">↑↓ to navigate, Enter to select</span>
      </div>
      <div className="max-h-48 overflow-y-auto py-1">
        {users.map((user, index) => {
          const isSelected = index === selectedIndex;
          return (
            <button
              key={user.id}
              type="button"
              onClick={() => onSelect(user)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                isSelected
                  ? 'bg-indigo-600/30 text-white border-l-2 border-indigo-500'
                  : 'hover:bg-slate-700/50 text-slate-200'
              }`}
            >
              <div className={`w-7 h-7 rounded-full ${user.avatarBg} text-[10px] font-bold flex items-center justify-center text-white flex-shrink-0 shadow-sm`}>
                {user.avatarText || user.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold truncate">{user.name}</span>
                  <span className="text-[10px] text-indigo-400 font-medium">@{user.username}</span>
                </div>
                {user.customStatus && (
                  <p className="text-[10px] text-slate-400 truncate">{user.customStatus}</p>
                )}
              </div>
              <div
                className={`w-2 h-2 rounded-full ${
                  user.status === 'online' ? 'bg-emerald-500' : 'bg-slate-500'
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};
