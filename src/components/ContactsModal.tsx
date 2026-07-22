import React, { useState } from 'react';
import { User } from '../types/chat';
import { X, UserPlus, Search, MessageSquare, Star, Shield } from 'lucide-react';
import { VerifiedBadge } from './VerifiedBadge';

interface ContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  currentUserId: string;
  onStartChat: (user: User) => void;
}

export const ContactsModal: React.FC<ContactsModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUserId,
  onStartChat,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);

  if (!isOpen) return null;

  const contactList = users.filter((u) => u.id !== currentUserId);
  const filteredContacts = contactList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone && u.phone.includes(searchQuery))
  );

  const toggleFavorite = (userId: string) => {
    setFavorites((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-100">Telegram Contacts</h3>
            <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-semibold">
              {contactList.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/30">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, @username or phone..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin">
          {filteredContacts.length > 0 ? (
            filteredContacts.map((u) => {
              const isFav = favorites.includes(u.id);
              return (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 hover:bg-slate-800/80 border border-slate-800/80 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-full ${u.avatarBg} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md overflow-hidden`}
                    >
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        u.avatarText || u.name.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-sm font-semibold text-slate-100 truncate">{u.name}</h4>
                        {(u.isVerified || u.isSystem || u.username === 'luna' || u.username === 'music') && (
                          <VerifiedBadge size="sm" />
                        )}
                        <span className="text-xs text-indigo-400 font-mono">@{u.username}</span>
                      </div>
                      <p className="text-xs text-slate-400 truncate">
                        {u.customStatus ? u.customStatus : u.status === 'online' ? 'Online' : 'Last seen recently'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleFavorite(u.id)}
                      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                      className={`p-2 rounded-xl transition-colors cursor-pointer ${
                        isFav
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-slate-800 text-slate-400 hover:text-amber-400'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
                    </button>
                    <button
                      onClick={() => {
                        onStartChat(u);
                        onClose();
                      }}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 text-slate-500">
              <p className="text-sm font-medium">No contacts found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
