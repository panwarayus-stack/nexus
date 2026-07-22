import React, { useState } from 'react';
import { User } from '../types/chat';
import { UserPlus, Check, ChevronDown, LogOut } from 'lucide-react';

interface AccountSwitcherProps {
  currentUser: User;
  users: User[];
  onSelectUser: (user: User) => void;
  onOpenAuthModal: () => void;
  onLogout?: () => void;
}

export const AccountSwitcher: React.FC<AccountSwitcherProps> = ({
  currentUser,
  users,
  onSelectUser,
  onOpenAuthModal,
  onLogout,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-700/50 text-left w-full"
      >
        <div className="relative">
          <div
            className={`w-10 h-10 rounded-full ${currentUser.avatarBg} flex items-center justify-center font-bold text-white text-sm shadow-md`}
          >
            {currentUser.avatarText || currentUser.name.slice(0, 2).toUpperCase()}
          </div>
          <div
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#111827] ${
              currentUser.status === 'online' ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-100 truncate flex items-center gap-1">
            <span>{currentUser.name}</span>
            <span className="text-xs text-indigo-400 font-normal">@{currentUser.username}</span>
          </h3>
          <p className="text-[11px] text-slate-400 truncate">
            {currentUser.customStatus || 'Active account'}
          </p>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-2 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Switch Account
          </div>
          <div className="max-h-60 overflow-y-auto py-1 space-y-1 scrollbar-thin">
            {users
              .filter((u) => !u.isBot && !u.isSystem && u.id !== 'u_system_luna' && u.id !== 'u_system_music')
              .map((u) => {
                const isCurrent = u.id === currentUser.id;
              return (
                <button
                  key={u.id}
                  onClick={() => {
                    onSelectUser(u);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 p-2 rounded-xl transition-colors text-left ${
                    isCurrent
                      ? 'bg-indigo-600/30 text-white border border-indigo-500/40'
                      : 'hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full ${u.avatarBg} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}
                  >
                    {u.avatarText || u.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold truncate flex items-center gap-1">
                      <span>{u.name}</span>
                      <span className="text-[10px] text-indigo-400">@{u.username}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {u.customStatus || (u.isBot ? 'Bot' : 'Member')}
                    </span>
                  </div>
                  {isCurrent && <Check className="w-4 h-4 text-indigo-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="pt-2 mt-1 border-t border-slate-800 space-y-1">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenAuthModal();
              }}
              className="w-full flex items-center justify-center gap-2 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-indigo-400" />
              <span>Create / Add New Account</span>
            </button>

            {onLogout && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center justify-center gap-2 p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-xs font-bold text-red-300 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-red-400" />
                <span>Log Out</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
