import React, { useState } from 'react';
import { User } from '../types/chat';
import { X, UserPlus, LogIn, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (newUser: User) => void;
}

const AVATAR_COLORS = [
  'bg-indigo-600',
  'bg-pink-500',
  'bg-teal-600',
  'bg-amber-600',
  'bg-emerald-600',
  'bg-purple-600',
  'bg-rose-600',
  'bg-cyan-600',
];

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onRegister }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [customStatus, setCustomStatus] = useState('');
  const [selectedBg, setSelectedBg] = useState(AVATAR_COLORS[0]);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Full Name is required');
      return;
    }
    if (!username.trim()) {
      setError('Username handle is required');
      return;
    }

    const cleanUsername = username.replace(/[^a-zA-Z0-9_]/g, '');
    if (!cleanUsername) {
      setError('Username must contain valid letters or numbers');
      return;
    }

    const initials = name
      .trim()
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const newUser: User = {
      id: `u_${Date.now()}`,
      name: name.trim(),
      username: cleanUsername,
      avatarBg: selectedBg,
      avatarText: initials || 'U',
      status: 'online',
      customStatus: customStatus.trim() || 'Online and ready',
    };

    onRegister(newUser);
    onClose();
    setName('');
    setUsername('');
    setCustomStatus('');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-lg">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Create Account</h2>
            <p className="text-xs text-slate-400">Join Nexus Chat with a custom user profile</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Morgan"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Username Handle (@mention) *
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-indigo-400 font-bold text-sm">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="AlexMorgan"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Custom Status
            </label>
            <input
              type="text"
              value={customStatus}
              onChange={(e) => setCustomStatus(e.target.value)}
              placeholder="e.g. ⚡ Coding away"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              Avatar Color Theme
            </label>
            <div className="flex items-center gap-2">
              {AVATAR_COLORS.map((bg) => (
                <button
                  key={bg}
                  type="button"
                  onClick={() => setSelectedBg(bg)}
                  className={`w-8 h-8 rounded-full ${bg} transition-transform ${
                    selectedBg === bg
                      ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900'
                      : 'hover:scale-110 opacity-80'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full min-h-[44px] bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create Account & Log In</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
