import React, { useState } from 'react';
import { User, Chat } from '../types/chat';
import { Search, X, MessageSquare, Shield, AtSign, UserPlus, ExternalLink } from 'lucide-react';
import { VerifiedBadge } from './VerifiedBadge';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  chats: Chat[];
  currentUserId: string;
  onSelectUser: (user: User) => void;
  onSelectChat: (chatId: string) => void;
  onStartDirectChat: (user: User) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  users,
  chats,
  currentUserId,
  onSelectUser,
  onSelectChat,
  onStartDirectChat,
}) => {
  const [query, setQuery] = useState('');
  const [searchTab, setSearchTab] = useState<'all' | 'users' | 'chats'>('all');

  if (!isOpen) return null;

  const trimmedQuery = query.trim().toLowerCase();

  const matchingUsers = users.filter((u) => {
    if (u.id === currentUserId) return false;
    if (!trimmedQuery) return true;
    return (
      u.name.toLowerCase().includes(trimmedQuery) ||
      u.username.toLowerCase().includes(trimmedQuery) ||
      u.id.toLowerCase().includes(trimmedQuery) ||
      (u.bio && u.bio.toLowerCase().includes(trimmedQuery))
    );
  });

  const matchingChats = chats.filter((c) => {
    if (!trimmedQuery) return true;
    return (
      c.name.toLowerCase().includes(trimmedQuery) ||
      (c.lastMessage && c.lastMessage.toLowerCase().includes(trimmedQuery))
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-start justify-center pt-16 sm:pt-24 px-4 animate-in fade-in duration-200">
      <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl flex flex-col overflow-hidden max-h-[80vh]">
        {/* Search Bar Header */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-900/50">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users by @username, name, ID, or chats..."
            autoFocus
            className="flex-1 bg-transparent border-none text-slate-100 placeholder-slate-500 focus:outline-none text-base"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Esc
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b border-slate-800 px-4 py-2 gap-2 bg-slate-900/30">
          <button
            onClick={() => setSearchTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              searchTab === 'all'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            All Results
          </button>
          <button
            onClick={() => setSearchTab('users')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              searchTab === 'users'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            Users ({matchingUsers.length})
          </button>
          <button
            onClick={() => setSearchTab('chats')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              searchTab === 'chats'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            Chats ({matchingChats.length})
          </button>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {/* Users Section */}
          {(searchTab === 'all' || searchTab === 'users') && matchingUsers.length > 0 && (
            <div>
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Users & Global Contacts
              </h4>
              <div className="space-y-1.5">
                {matchingUsers.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-full ${u.avatarBg} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md overflow-hidden`}
                      >
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          u.avatarText || u.name.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h5 className="text-sm font-semibold text-slate-100 truncate">{u.name}</h5>
                          {(u.isVerified || u.isSystem || u.username === 'luna' || u.username === 'music') && (
                            <VerifiedBadge size="sm" />
                          )}
                          <span className="text-xs text-indigo-400 font-mono">@{u.username}</span>
                        </div>
                        <p className="text-xs text-slate-400 truncate">
                          {u.customStatus || u.bio || (u.status === 'online' ? 'Online' : 'Offline')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          onStartDirectChat(u);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chats Section */}
          {(searchTab === 'all' || searchTab === 'chats') && matchingChats.length > 0 && (
            <div className="mt-4">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Active Conversations & Groups
              </h4>
              <div className="space-y-1.5">
                {matchingChats.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      onSelectChat(c.id);
                      onClose();
                    }}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-full ${c.avatarBg || 'bg-indigo-600'} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md`}
                      >
                        {c.avatarText || c.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-sm font-semibold text-slate-100 truncate">{c.name}</h5>
                        <p className="text-xs text-slate-400 truncate">{c.lastMessage || 'No messages'}</p>
                      </div>
                    </div>
                    <span className="text-xs text-indigo-400 font-medium group-hover:underline">Open</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {matchingUsers.length === 0 && matchingChats.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <p className="text-sm font-medium">No users or chats found matching "{query}"</p>
              <p className="text-xs mt-1 text-slate-600">Try searching by exact @username or display name.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
