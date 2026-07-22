import React from 'react';
import { User } from '../types/chat';
import { X, MessageSquare, Shield, Phone, Mail, Calendar, Clock, UserCheck, Ban, Sparkles } from 'lucide-react';

interface UserProfileModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onStartChat: (user: User) => void;
  onBlockUser?: (userId: string) => void;
  isBlocked?: boolean;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onStartChat,
  onBlockUser,
  isBlocked,
}) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden">
        {/* Header Banner */}
        <div className="relative bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 p-6 pb-12 flex flex-col items-center text-center border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Avatar */}
          <div className="relative mb-3">
            <div
              className={`w-24 h-24 rounded-full ${user.avatarBg || 'bg-indigo-600'} flex items-center justify-center text-white font-bold text-3xl shadow-2xl border-4 border-slate-900`}
            >
              {user.avatarText || user.name.slice(0, 2).toUpperCase()}
            </div>
            <div
              className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-slate-900 ${
                user.status === 'online' ? 'bg-emerald-500' : 'bg-slate-600'
              }`}
            />
          </div>

          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-1.5">
            {user.name}
            {user.isBot && (
              <span className="text-[10px] bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-full font-mono">
                BOT
              </span>
            )}
          </h2>
          <p className="text-xs text-indigo-400 font-mono mt-0.5">@{user.username}</p>
          <span className="text-xs text-slate-400 mt-1 capitalize">
            {user.status === 'online' ? 'Online' : 'Last seen recently'}
          </span>
        </div>

        {/* Details & Info Section */}
        <div className="p-6 space-y-5 bg-[#111827]">
          {/* Bio */}
          {user.bio && (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 shadow-inner">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Bio & About
              </span>
              <p className="text-sm text-slate-200 leading-relaxed">{user.bio}</p>
            </div>
          )}

          {/* Contact Details */}
          <div className="space-y-3 bg-slate-900/40 border border-slate-800 rounded-xl p-4">
            {user.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Phone Number</span>
                  <span className="text-slate-200 font-medium">{user.phone}</span>
                </div>
              </div>
            )}
            {user.email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Email Address</span>
                  <span className="text-slate-200 font-medium">{user.email}</span>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Member Since</span>
                <span className="text-slate-200 font-medium">{user.joinDate || 'January 2026'}</span>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-center">
              <span className="text-lg font-bold text-indigo-400 block">12</span>
              <span className="text-[11px] text-slate-400 font-medium">Shared Media</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-center">
              <span className="text-lg font-bold text-cyan-400 block">3</span>
              <span className="text-[11px] text-slate-400 font-medium">Common Groups</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => {
                onStartChat(user);
                onClose();
              }}
              className="flex-1 min-h-[44px] bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer text-sm"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Send Message</span>
            </button>

            {onBlockUser && (
              <button
                onClick={() => {
                  onBlockUser(user.id);
                  onClose();
                }}
                className={`px-4 min-h-[44px] rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  isBlocked
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-600/30'
                    : 'bg-red-600/20 text-red-400 border border-red-500/40 hover:bg-red-600/30'
                }`}
              >
                <Ban className="w-4 h-4" />
                <span>{isBlocked ? 'Unblock' : 'Block'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
