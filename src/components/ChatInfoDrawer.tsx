import React from 'react';
import { Chat, User } from '../types/chat';
import { X, Users, ShieldCheck, FileText, Download, Trash2, Bell } from 'lucide-react';

interface ChatInfoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  chat: Chat;
  users: User[];
  onClearChat: () => void;
  onExportChat: () => void;
}

export const ChatInfoDrawer: React.FC<ChatInfoDrawerProps> = ({
  isOpen,
  onClose,
  chat,
  users,
  onClearChat,
  onExportChat,
}) => {
  if (!isOpen) return null;

  const members = users.filter((u) => chat.participants.includes(u.id));

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>Chat Details</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card */}
        <div className="flex flex-col items-center text-center my-6">
          <div
            className={`w-20 h-20 rounded-full ${
              chat.avatarBg || 'bg-indigo-600'
            } flex items-center justify-center text-white font-bold text-2xl shadow-xl border-2 border-indigo-500/30 mb-3`}
          >
            {chat.avatarText || chat.name.slice(0, 2).toUpperCase()}
          </div>
          <h2 className="text-lg font-bold text-slate-100">{chat.name}</h2>
          <p className="text-xs text-slate-400 mt-1">
            {chat.type === 'group' ? 'Group Channel' : 'Direct Conversation'}
          </p>
          {chat.topic && (
            <p className="text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-3 py-1.5 mt-3 max-w-xs">
              {chat.topic}
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <button
            onClick={onExportChat}
            className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>Export Chat</span>
          </button>
          
          {chat.id !== 'chat_global_1' && (
            <button
              onClick={onClearChat}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-900/50 text-xs font-semibold text-red-300 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {/* Channel Members */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Members ({members.length})</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="space-y-2">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/50 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="relative">
                  <div
                    className={`w-9 h-9 rounded-full ${member.avatarBg} flex items-center justify-center text-xs font-bold text-white shadow-md`}
                  >
                    {member.avatarText || member.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#111827] ${
                      member.status === 'online' ? 'bg-emerald-500' : 'bg-slate-500'
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-200 truncate flex items-center gap-1">
                    <span>{member.name}</span>
                    <span className="text-[10px] text-indigo-400 font-normal">
                      @{member.username}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">
                    {member.customStatus || (member.isBot ? 'Nexus AI Assistant' : 'Team Member')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <div className="pt-4 border-t border-slate-800 text-center text-[11px] text-slate-500">
          Nexus Chat · End-to-end client state persistence
        </div>
      </div>
    </div>
  );
};
