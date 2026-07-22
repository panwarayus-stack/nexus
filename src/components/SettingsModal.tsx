import React, { useState } from 'react';
import { User, PrivacySettings, ActiveSession } from '../types/chat';
import {
  X,
  User as UserIcon,
  Lock,
  Bell,
  MessageCircle,
  Monitor,
  Palette,
  ShieldCheck,
  HelpCircle,
  Info,
  LogOut,
  ChevronRight,
  Smartphone,
  Check,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpdateUser: (updated: Partial<User>) => void;
  onLogout: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  onLogout,
}) => {
  const [activeSection, setActiveSection] = useState<
    'main' | 'profile' | 'privacy' | 'notifications' | 'chat' | 'devices' | 'appearance' | 'help' | 'about'
  >('main');

  // Local editing states
  const [name, setName] = useState(currentUser.name);
  const [username, setUsername] = useState(currentUser.username);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [phone, setPhone] = useState(currentUser.phone || '');

  // Privacy states
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    lastSeen: 'everybody',
    profilePhoto: 'everybody',
    bio: 'everybody',
    phone: 'contacts',
    groupsAdd: 'everybody',
    calls: 'everybody',
    readReceipts: true,
    passcodeLock: false,
    twoStepVerification: true,
  });

  // Active sessions mock list
  const [sessions, setSessions] = useState<ActiveSession[]>([
    {
      id: 's_1',
      deviceName: 'Chrome Web Client',
      browser: 'Chrome 125.0 (macOS)',
      ipAddress: '192.168.1.45',
      loginTime: 'Today at 09:42',
      lastActive: 'Just now',
      isCurrent: true,
    },
    {
      id: 's_2',
      deviceName: 'Telegram Mobile App',
      browser: 'Telegram iOS 10.8',
      ipAddress: '192.168.1.88',
      loginTime: 'Yesterday at 14:15',
      lastActive: '2 hours ago',
      isCurrent: false,
    },
  ]);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({ name, username, bio, phone });
    setActiveSection('main');
  };

  const terminateSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            {activeSection !== 'main' && (
              <button
                onClick={() => setActiveSection('main')}
                className="text-xs text-indigo-400 font-semibold hover:underline cursor-pointer"
              >
                ← Back
              </button>
            )}
            <h3 className="text-base font-bold text-slate-100 capitalize">
              {activeSection === 'main' ? 'Telegram Settings' : `${activeSection} Settings`}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          {activeSection === 'main' && (
            <div className="space-y-6">
              {/* User Profile Card */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div
                  className={`w-16 h-16 rounded-full ${currentUser.avatarBg || 'bg-indigo-600'} flex items-center justify-center text-white font-bold text-xl shadow-lg`}
                >
                  {currentUser.avatarText || currentUser.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-bold text-slate-100 truncate">{currentUser.name}</h4>
                  <p className="text-xs text-indigo-400 font-mono">@{currentUser.username}</p>
                  <p className="text-xs text-emerald-400 font-medium mt-0.5">Online</p>
                </div>
                <button
                  onClick={() => setActiveSection('profile')}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Edit Profile
                </button>
              </div>

              {/* Settings Menu List */}
              <div className="space-y-1 bg-slate-900/40 border border-slate-800 rounded-2xl p-2">
                <button
                  onClick={() => setActiveSection('profile')}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/60 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-semibold block">My Account</span>
                      <span className="text-xs text-slate-500">Edit profile details, phone, bio</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>

                <button
                  onClick={() => setActiveSection('privacy')}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/60 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-semibold block">Privacy and Security</span>
                      <span className="text-xs text-slate-500">Last seen, passcode, blocked users</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>

                <button
                  onClick={() => setActiveSection('notifications')}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/60 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-semibold block">Notifications and Sounds</span>
                      <span className="text-xs text-slate-500">Chat alerts, ringtones, vibration</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>

                <button
                  onClick={() => setActiveSection('chat')}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/60 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-semibold block">Chat Settings</span>
                      <span className="text-xs text-slate-500">Wallpapers, themes, font sizing</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>

                <button
                  onClick={() => setActiveSection('devices')}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/60 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                      <Monitor className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-semibold block">Active Devices</span>
                      <span className="text-xs text-slate-500">Manage connected sessions</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>

                <button
                  onClick={() => setActiveSection('appearance')}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/60 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                      <Palette className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-semibold block">Appearance</span>
                      <span className="text-xs text-slate-500">Dark theme, accent colors</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              {/* Logout Button */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="w-full py-3 bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 text-red-400 font-semibold rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out of Telegram</span>
                </button>
              </div>
            </div>
          )}

          {activeSection === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Username (@)</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Any details about you..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 019-2834"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveSection('main')}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {activeSection === 'privacy' && (
            <div className="space-y-4 text-sm">
              <div className="space-y-3 bg-slate-900/40 border border-slate-800 rounded-2xl p-4">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Privacy Controls</h4>

                <div className="flex items-center justify-between py-2 border-b border-slate-800">
                  <div>
                    <span className="font-semibold text-slate-200 block">Last Seen & Online</span>
                    <span className="text-xs text-slate-500">Who can see your last online time</span>
                  </div>
                  <select
                    value={privacy.lastSeen}
                    onChange={(e) => setPrivacy({ ...privacy, lastSeen: e.target.value as any })}
                    className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
                  >
                    <option value="everybody">Everybody</option>
                    <option value="contacts">My Contacts</option>
                    <option value="nobody">Nobody</option>
                  </select>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-800">
                  <div>
                    <span className="font-semibold text-slate-200 block">Profile Photo</span>
                    <span className="text-xs text-slate-500">Who can see your profile picture</span>
                  </div>
                  <select
                    value={privacy.profilePhoto}
                    onChange={(e) => setPrivacy({ ...privacy, profilePhoto: e.target.value as any })}
                    className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
                  >
                    <option value="everybody">Everybody</option>
                    <option value="contacts">My Contacts</option>
                    <option value="nobody">Nobody</option>
                  </select>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <span className="font-semibold text-slate-200 block">Read Receipts</span>
                    <span className="text-xs text-slate-500">Show when you read messages</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacy.readReceipts}
                    onChange={(e) => setPrivacy({ ...privacy, readReceipts: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-0 bg-slate-900 border-slate-700 cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-3 bg-slate-900/40 border border-slate-800 rounded-2xl p-4">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Security</h4>
                <div className="flex items-center justify-between py-2 border-b border-slate-800">
                  <div>
                    <span className="font-semibold text-slate-200 block">Two-Step Verification</span>
                    <span className="text-xs text-emerald-400 font-medium">Enabled (Password Protected)</span>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <span className="font-semibold text-slate-200 block">Passcode Lock</span>
                    <span className="text-xs text-slate-500">Require PIN to open app</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacy.passcodeLock}
                    onChange={(e) => setPrivacy({ ...privacy, passcodeLock: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-0 bg-slate-900 border-slate-700 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'devices' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-400">
                  You are logged in on these devices. You can terminate remote sessions.
                </p>
                <button
                  onClick={() => setSessions(sessions.filter((s) => s.isCurrent))}
                  className="px-3 py-1.5 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-xl text-xs font-semibold border border-red-500/30 transition-colors cursor-pointer"
                >
                  Terminate All Other Sessions
                </button>
              </div>

              <div className="space-y-3">
                {sessions.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-indigo-600/20 text-indigo-400">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-sm font-bold text-slate-100">{s.deviceName}</h5>
                          {s.isCurrent && (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                              This Device
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{s.browser} • IP: {s.ipAddress}</p>
                        <p className="text-[10px] text-slate-500 mt-1">Logged in: {s.loginTime}</p>
                      </div>
                    </div>

                    {!s.isCurrent && (
                      <button
                        onClick={() => terminateSession(s.id)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-red-600/20 text-slate-300 hover:text-red-400 rounded-xl text-xs font-semibold transition-all cursor-pointer border border-slate-700"
                      >
                        Terminate
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection !== 'main' && activeSection !== 'profile' && activeSection !== 'privacy' && activeSection !== 'devices' && (
            <div className="text-center py-12 text-slate-400">
              <p className="text-base font-semibold text-slate-200 capitalize">{activeSection} Configuration</p>
              <p className="text-xs text-slate-500 mt-1">All Telegram settings and options are fully enabled and synced.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
