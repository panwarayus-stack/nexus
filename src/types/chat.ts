export interface User {
  id: string;
  name: string;
  username: string; // e.g. "James"
  email?: string;
  phone?: string;
  bio?: string;
  avatarBg: string; // Tailwind bg color class
  avatarText?: string;
  avatarUrl?: string; // UI Avatars URL fallback
  status: 'online' | 'offline' | 'away';
  customStatus?: string;
  lastSeen?: string;
  joinDate?: string;
  isBot?: boolean;
  isVerified?: boolean;
  isSystem?: boolean;
  blockedUsers?: string[];
}

export interface PrivacySettings {
  lastSeen: 'everybody' | 'contacts' | 'nobody';
  profilePhoto: 'everybody' | 'contacts' | 'nobody';
  bio: 'everybody' | 'contacts' | 'nobody';
  phone: 'everybody' | 'contacts' | 'nobody';
  groupsAdd: 'everybody' | 'contacts';
  calls: 'everybody' | 'contacts' | 'nobody';
  readReceipts: boolean;
  passcodeLock: boolean;
  twoStepVerification: boolean;
}

export interface ActiveSession {
  id: string;
  deviceName: string;
  browser: string;
  ipAddress: string;
  loginTime: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface Reaction {
  emoji: string;
  count: number;
  users: string[]; // user ids
}

export interface PollOption {
  id: string;
  text: string;
  voters: string[]; // user ids
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  multipleChoice?: boolean;
  anonymous?: boolean;
  closed?: boolean;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  timestamp: number | string; // timestamp or ISO string
  timeFormatted: string; // e.g. "12:42 PM"
  status: 'sent' | 'delivered' | 'read';
  reactions?: Reaction[];
  replyToId?: string;
  forwardedFrom?: string;
  mentions?: string[]; // usernames mentioned
  isFormatted?: boolean;
  isEdited?: boolean;
  pinned?: boolean;
  poll?: Poll;
  mediaType?: 'photo' | 'video' | 'file' | 'audio' | 'voice' | 'gif';
  mediaUrl?: string;
  mediaName?: string;
  audioMeta?: {
    songId?: string;
    title?: string;
    artist?: string;
    album?: string;
    duration?: number;
    year?: string;
    artworkUrl?: string;
    downloadUrl?: string;
    quality?: string;
  };
}

export interface Chat {
  id: string;
  type: 'direct' | 'group' | 'saved' | 'channel';
  name: string;
  avatarBg?: string;
  avatarText?: string;
  avatarUrl?: string;
  participants: string[]; // user ids
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  isPinned?: boolean;
  isArchived?: boolean;
  isMuted?: boolean;
  topic?: string;
  wallpaper?: string;
  themeColor?: string;
}

export interface TypingStatus {
  chatId: string;
  userId: string;
  username: string;
}

