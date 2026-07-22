import React, { useState } from 'react';
import { User, Chat } from '../types/chat';
import { X, Plus, Users, MessageSquare } from 'lucide-react';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  currentUserId: string;
  onCreateChat: (newChat: Chat) => void;
}

const AVATAR_COLORS = [
  'bg-amber-600',
  'bg-indigo-600',
  'bg-teal-600',
  'bg-pink-500',
  'bg-emerald-600',
  'bg-purple-600',
];

export const NewChatModal: React.FC<NewChatModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUserId,
  onCreateChat,
}) => {
  const [type, setType] = useState<'direct' | 'group'>('group');
  const [groupName, setGroupName] = useState('');
  const [groupTopic, setGroupTopic] = useState('');
  const [selectedBg, setSelectedBg] = useState(AVATAR_COLORS[0]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([currentUserId]);
  const [selectedDirectUserId, setSelectedDirectUserId] = useState<string>('');

  if (!isOpen) return null;

  const availableOtherUsers = users.filter((u) => u.id !== currentUserId);

  const toggleUserSelection = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      if (userId === currentUserId) return; // Keep current user
      setSelectedUserIds(selectedUserIds.filter((id) => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (type === 'direct') {
      if (!selectedDirectUserId) return;
      const targetUser = users.find((u) => u.id === selectedDirectUserId);
      if (!targetUser) return;

      const newChat: Chat = {
        id: `chat_${Date.now()}`,
        type: 'direct',
        name: targetUser.name,
        avatarBg: targetUser.avatarBg,
        avatarText: targetUser.avatarText,
        participants: [currentUserId, targetUser.id],
        lastMessage: 'Conversation started',
        lastMessageTime: 'Just now',
        unreadCount: 0,
      };

      onCreateChat(newChat);
      onClose();
      return;
    }

    // Group Channel
    if (!groupName.trim()) return;

    const initials = groupName
      .trim()
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const newChat: Chat = {
      id: `chat_g_${Date.now()}`,
      type: 'group',
      name: groupName.trim(),
      avatarBg: selectedBg,
      avatarText: initials || 'GR',
      participants: selectedUserIds,
      topic: groupTopic.trim() || 'General discussion channel',
      lastMessage: 'Channel created',
      lastMessageTime: 'Just now',
      unreadCount: 0,
    };

    onCreateChat(newChat);
    onClose();
    setGroupName('');
    setGroupTopic('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-thin">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-lg">
            <Plus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Start Conversation</h2>
            <p className="text-xs text-slate-400">Create a group channel or direct message</p>
          </div>
        </div>

        {/* Type Toggle */}
        <div className="flex p-1 bg-slate-800 rounded-2xl border border-slate-700 mb-5">
          <button
            type="button"
            onClick={() => setType('group')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              type === 'group'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Group Channel</span>
          </button>
          <button
            type="button"
            onClick={() => setType('direct')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              type === 'direct'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Direct Message</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'direct' ? (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Select Contact
              </label>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {availableOtherUsers.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setSelectedDirectUserId(u.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors ${
                      selectedDirectUserId === u.id
                        ? 'bg-indigo-600/30 border-indigo-500 text-white'
                        : 'bg-slate-800/50 border-slate-800 hover:border-slate-700 text-slate-200'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-full ${u.avatarBg} flex items-center justify-center font-bold text-xs text-white`}
                    >
                      {u.avatarText || u.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold truncate flex items-center gap-1">
                        <span>{u.name}</span>
                        <span className="text-[10px] text-indigo-400">@{u.username}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 truncate block">
                        {u.customStatus || 'Available'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Channel Name *
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g. Design System Team"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Topic / Description
                </label>
                <input
                  type="text"
                  value={groupTopic}
                  onChange={(e) => setGroupTopic(e.target.value)}
                  placeholder="e.g. Discussing UI & mobile specs"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Channel Badge Color
                </label>
                <div className="flex items-center gap-2">
                  {AVATAR_COLORS.map((bg) => (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => setSelectedBg(bg)}
                      className={`w-7 h-7 rounded-full ${bg} transition-transform ${
                        selectedBg === bg
                          ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900'
                          : 'hover:scale-110 opacity-80'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Add Members ({selectedUserIds.length})
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {users.map((u) => {
                    const isSelected = selectedUserIds.includes(u.id);
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => toggleUserSelection(u.id)}
                        className={`w-full flex items-center gap-3 p-2 rounded-xl border text-left transition-colors ${
                          isSelected
                            ? 'bg-indigo-600/20 border-indigo-500/80 text-white'
                            : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full ${u.avatarBg} flex items-center justify-center font-bold text-xs text-white`}
                        >
                          {u.avatarText || u.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold truncate flex items-center gap-1">
                            <span>{u.name}</span>
                            <span className="text-[10px] text-indigo-400">@{u.username}</span>
                          </div>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] font-bold ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'border border-slate-600'
                          }`}
                        >
                          {isSelected && '✓'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full min-h-[44px] bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
            >
              <span>Create Channel</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
