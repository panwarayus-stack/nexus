import React, { useState } from 'react';
import { Chat, User } from '../types/chat';
import {
  Menu,
  Info,
  Trash2,
  Download,
  Users,
  Search,
  X
} from 'lucide-react';
import { VerifiedBadge } from './VerifiedBadge';

interface ChatHeaderProps {
  activeChat: Chat;
  users: User[];
  currentUserId: string;
  typingStatuses?: { chatId: string; userId: string; username: string }[];
  onOpenMobileSidebar: () => void;
  onOpenChatInfo: () => void;
  onClearChat: () => void;
  onExportChat: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  activeChat,
  users,
  currentUserId,
  typingStatuses = [],
  onOpenMobileSidebar,
  onOpenChatInfo,
  onClearChat,
  onExportChat,
  searchQuery,
  onSearchChange,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Check active typing for this chat
  const activeTyping = typingStatuses.filter(
    (t) => t.chatId === activeChat.id && t.userId !== currentUserId
  );
  const isTyping = activeTyping.length > 0;
  const typingNames = activeTyping.map((t) => t.username).join(', ');

  // Determine header status text
  let statusText = 'Online';
  let isOnline = true;
  let isVerified = false;

  if (activeChat.type === 'direct') {
    const otherUserId = activeChat.participants.find((p) => p !== currentUserId);
    const otherUser = users.find((u) => u.id === otherUserId);
    if (otherUser) {
      statusText = otherUser.customStatus || (otherUser.status === 'online' ? 'Online' : 'Offline');
      isOnline = otherUser.status === 'online';
      if (otherUser.isVerified || otherUser.isSystem || activeChat.name === 'Luna' || activeChat.name === 'Music') {
        isVerified = true;
      }
    }
  } else {
    const participantCount = activeChat.participants.length;
    statusText = `${participantCount} members · ${activeChat.topic || 'Group Channel'}`;
  }

  return (
    <header className="h-16 border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 bg-[#0f172a]/90 backdrop-blur-md z-10 sticky top-0">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          title="Open Channels"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div
            className={`w-10 h-10 rounded-full ${
              activeChat.avatarBg || 'bg-slate-700'
            } flex items-center justify-center font-bold text-white text-sm shadow-md border border-slate-700/50 overflow-hidden`}
          >
            {activeChat.avatarUrl ? (
              <img src={activeChat.avatarUrl} alt={activeChat.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              activeChat.avatarText || activeChat.name.slice(0, 2).toUpperCase()
            )}
          </div>
          <div
            className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-[#0f172a] rounded-full ${
              isOnline ? 'bg-emerald-500' : 'bg-slate-500'
            }`}
          />
        </div>

        {/* Title & Subtitle */}
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-slate-100 truncate flex items-center gap-1.5">
            <span>{activeChat.name}</span>
            {isVerified && <VerifiedBadge size="sm" />}
            {activeChat.type === 'group' && (
              <Users className="w-3.5 h-3.5 text-indigo-400" />
            )}
          </h2>
          {isTyping ? (
            <p className="text-[11px] text-indigo-400 font-semibold truncate mt-0.5 flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping inline-block" />
              <span>{typingNames} {activeTyping.length > 1 ? 'are' : 'is'} typing</span>
              <span className="inline-flex tracking-widest">
                <span className="animate-bounce [animation-delay:-0.3s]">.</span>
                <span className="animate-bounce [animation-delay:-0.15s]">.</span>
                <span className="animate-bounce">.</span>
              </span>
            </p>
          ) : (
            <p className="text-[11px] text-emerald-400 truncate mt-0.5 flex items-center gap-1 font-medium">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isOnline ? 'bg-emerald-500' : 'bg-slate-500'
                }`}
              />
              <span className="truncate">{statusText}</span>
            </p>
          )}
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-1 sm:gap-2 text-slate-400">
        {isSearchOpen ? (
          <div className="flex items-center bg-slate-800 rounded-xl px-2 py-1 mr-2 border border-slate-700 w-48 sm:w-64 animate-in fade-in slide-in-from-right-4">
            <Search className="w-4 h-4 text-slate-500 mr-2" />
            <input
              type="text"
              autoFocus
              value={searchQuery || ''}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search messages..."
              className="bg-transparent text-sm text-slate-200 outline-none flex-1 min-w-0"
            />
            <button
              onClick={() => {
                setIsSearchOpen(false);
                onSearchChange?.('');
              }}
              className="p-1 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsSearchOpen(true)}
            title="Search Messages"
            className="p-2 hover:bg-slate-800 hover:text-white rounded-xl transition-colors hidden sm:flex"
          >
            <Search className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={onExportChat}
          title="Export Chat History"
          className="p-2 hover:bg-slate-800 hover:text-white rounded-xl transition-colors hidden sm:flex"
        >
          <Download className="w-4 h-4" />
        </button>

        {activeChat.id !== 'chat_global_1' && (
          <button
            onClick={onClearChat}
            title="Clear Chat History"
            className="p-2 hover:bg-red-950/50 text-slate-400 hover:text-red-400 rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={onOpenChatInfo}
          title="Chat Info & Members"
          className="p-2 hover:bg-slate-800 hover:text-white rounded-xl transition-colors"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
