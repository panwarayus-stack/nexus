import React, { useState } from 'react';
import { Chat, User } from '../types/chat';
import { AccountSwitcher } from './AccountSwitcher';
import { Search, Plus, MessageSquare, Users, Pin, X, Users2, Settings } from 'lucide-react';
import { VerifiedBadge } from './VerifiedBadge';

interface SidebarProps {
  chats: Chat[];
  activeChatId: string;
  onSelectChat: (chatId: string) => void;
  currentUser: User;
  users: User[];
  typingStatuses?: { chatId: string; userId: string; username: string }[];
  onSelectUser: (user: User) => void;
  onOpenAuthModal: () => void;
  onLogout?: () => void;
  onNewChat: () => void;
  onOpenSearch: () => void;
  onOpenContacts: () => void;
  onOpenSettings: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  chats,
  activeChatId,
  onSelectChat,
  currentUser,
  users,
  typingStatuses = [],
  onSelectUser,
  onOpenAuthModal,
  onLogout,
  onNewChat,
  onOpenSearch,
  onOpenContacts,
  onOpenSettings,
  isOpenMobile,
  onCloseMobile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'direct' | 'group'>('all');

  // Filter chats by tab & search query
  const filteredChats = chats.filter((chat) => {
    if (activeTab === 'direct' && chat.type !== 'direct') return false;
    if (activeTab === 'group' && chat.type !== 'group') return false;
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      chat.name.toLowerCase().includes(query) ||
      (chat.lastMessage && chat.lastMessage.toLowerCase().includes(query))
    );
  });

  const pinnedChats = filteredChats.filter((c) => c.isPinned);
  const otherChats = filteredChats.filter((c) => !c.isPinned);

  const renderChatItem = (chat: Chat) => {
    const isActive = chat.id === activeChatId;

    // Find target user for direct chat online status
    let isOnline = false;
    let isVerified = false;
    if (chat.type === 'direct') {
      const otherUserId = chat.participants.find((p) => p !== currentUser.id);
      const otherUser = users.find((u) => u.id === otherUserId);
      if (otherUser && otherUser.status === 'online') {
        isOnline = true;
      }
      if (otherUser?.isVerified || otherUser?.isSystem || chat.name === 'Luna' || chat.name === 'Music') {
        isVerified = true;
      }
    } else {
      isOnline = true; // group channel active
    }

    const chatTyping = typingStatuses.filter(
      (t) => t.chatId === chat.id && t.userId !== currentUser.id
    );

    return (
      <button
        key={chat.id}
        onClick={() => {
          onSelectChat(chat.id);
          onCloseMobile();
        }}
        className={`w-full flex items-center gap-3 p-3 transition-all rounded-xl text-left ${
          isActive
            ? 'bg-slate-800/80 border-l-4 border-indigo-500 shadow-md text-slate-100'
            : 'hover:bg-slate-800/40 text-slate-300 hover:text-slate-100'
        }`}
      >
        <div className="relative flex-shrink-0">
          <div
            className={`w-11 h-11 rounded-full ${
              chat.avatarBg || 'bg-slate-700'
            } flex items-center justify-center text-white font-bold text-xs shadow-md border border-slate-700/50 overflow-hidden`}
          >
            {chat.avatarUrl ? (
              <img src={chat.avatarUrl} alt={chat.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              chat.avatarText || chat.name.slice(0, 2).toUpperCase()
            )}
          </div>
          <div
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#111827] ${
              isOnline ? 'bg-emerald-500' : 'bg-slate-600'
            }`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline mb-1">
            <h3 className="text-sm font-semibold truncate flex items-center gap-1.5">
              <span>{chat.name}</span>
              {isVerified && <VerifiedBadge size="sm" />}
              {chat.type === 'group' && (
                <span className="text-[10px] text-indigo-400 bg-indigo-500/20 px-1.5 py-0.2 rounded font-normal">
                  Group
                </span>
              )}
            </h3>
            <span className="text-[10px] text-slate-500 font-medium">
              {chat.lastMessageTime || ''}
            </span>
          </div>
          {chatTyping.length > 0 ? (
            <p className="text-xs text-indigo-400 font-semibold italic truncate animate-pulse flex items-center gap-1">
              <span>{chatTyping.map((t) => t.username).join(', ')}</span>
              <span>{chatTyping.length > 1 ? 'are' : 'is'} typing...</span>
            </p>
          ) : (
            <p className="text-xs text-slate-400 truncate">
              {chat.lastMessage || 'No messages yet'}
            </p>
          )}
        </div>

        {chat.unreadCount > 0 && !isActive && (
          <div className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-600/30">
            {chat.unreadCount}
          </div>
        )}
      </button>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 left-0 bottom-0 z-40 w-80 max-w-[85vw] border-r border-slate-800 flex flex-col bg-[#111827] transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header with Account Switcher */}
        <div className="p-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <AccountSwitcher
              currentUser={currentUser}
              users={users.filter((u) => !u.isBot && !u.isSystem && u.id !== 'u_system_luna' && u.id !== 'u_system_music')}
              onSelectUser={onSelectUser}
              onOpenAuthModal={onOpenAuthModal}
              onLogout={onLogout}
            />
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onOpenSettings}
              title="Settings"
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar & Actions */}
        <div className="p-3 space-y-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div
              onClick={onOpenSearch}
              className="relative flex-1 bg-slate-800 border border-slate-700/80 rounded-xl py-2 pl-9 pr-3 text-sm text-slate-400 cursor-pointer hover:border-indigo-500/80 transition-all flex items-center"
            >
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <span>Search chats, @username...</span>
            </div>

            <button
              onClick={onOpenContacts}
              title="Telegram Contacts"
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Users2 className="w-4 h-4" />
            </button>

            <button
              onClick={onNewChat}
              title="New Chat / Channel"
              className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-800/50 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('direct')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'direct'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3 h-3" />
              Direct
            </button>
            <button
              onClick={() => setActiveTab('group')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'group'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3 h-3" />
              Groups
            </button>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
          {/* Pinned Section */}
          {pinnedChats.length > 0 && (
            <div className="mb-3">
              <div className="px-3 py-1 flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <Pin className="w-3 h-3 text-indigo-400" />
                <span>Pinned Conversations</span>
              </div>
              <div className="space-y-1 mt-1">{pinnedChats.map(renderChatItem)}</div>
            </div>
          )}

          {/* Other Chats */}
          {otherChats.length > 0 && (
            <div>
              {pinnedChats.length > 0 && (
                <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-2 mb-1">
                  <span>Recent Conversations</span>
                </div>
              )}
              <div className="space-y-1">{otherChats.map(renderChatItem)}</div>
            </div>
          )}

          {filteredChats.length === 0 && (
            <div className="p-6 text-center text-slate-500 text-xs my-auto">
              No conversations found.
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

