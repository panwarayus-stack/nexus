import { User, Chat, Message } from '../types/chat';

export interface RegisteredUserAccount {
  id: string;
  name: string;
  username: string;
  email: string;
  passwordHash: string;
  avatarBg: string;
  avatarText: string;
  status: 'online' | 'offline' | 'away';
  customStatus?: string;
  createdAt: string;
}

const STORAGE_KEYS = {
  REGISTERED_ACCOUNTS: 'nexus_registered_accounts_v3',
  CHATS: 'nexus_user_chats_v3',
  MESSAGES: 'nexus_user_messages_v3',
  CURRENT_USER_ID: 'nexus_user_current_id_v3',
  SOUND: 'nexus_chat_sound_v3',
};

/**
 * Load all registered user accounts from database
 */
export function loadRegisteredAccounts(): RegisteredUserAccount[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.REGISTERED_ACCOUNTS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load registered accounts', e);
  }
  return [];
}

/**
 * Save registered user accounts array
 */
export function saveRegisteredAccounts(accounts: RegisteredUserAccount[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.REGISTERED_ACCOUNTS, JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed to save registered accounts', e);
  }
}

/**
 * Convert RegisteredUserAccount to User UI object (stripping sensitive hashes)
 */
export function toUser(acc: RegisteredUserAccount): User {
  return {
    id: acc.id,
    name: acc.name,
    username: acc.username,
    email: acc.email,
    avatarBg: acc.avatarBg || 'bg-indigo-600',
    avatarText: acc.avatarText || acc.name.slice(0, 2).toUpperCase(),
    status: acc.status || 'online',
    customStatus: acc.customStatus || '',
  };
}

export function loadUsers(): User[] {
  return loadRegisteredAccounts().map(toUser);
}

export function saveUsers(users: User[]) {
  // User list is updated via saveRegisteredAccounts
}

export const GLOBAL_CHAT_ID = 'chat_global_1';

/**
 * Load chats from database
 */
export function loadChats(): Chat[] {
  let chats: Chat[] = [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CHATS);
    if (data) chats = JSON.parse(data);
  } catch (e) {
    console.error('Failed to load chats', e);
  }
  
  // Ensure Global Chat always exists
  if (!chats.find(c => c.id === GLOBAL_CHAT_ID)) {
    chats.unshift({
      id: GLOBAL_CHAT_ID,
      type: 'group',
      name: 'Global Chat',
      avatarBg: 'bg-indigo-500',
      avatarText: '🌐',
      participants: [], // Everyone is implicitly a participant
      unreadCount: 0,
      isPinned: true,
    });
  }
  
  return chats;
}

export function saveChats(chats: Chat[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
  } catch (e) {
    console.error('Failed to save chats', e);
  }
}

/**
 * Load messages from database
 */
export function loadMessages(): Message[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load messages', e);
  }
  return [];
}

export function saveMessages(messages: Message[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  } catch (e) {
    console.error('Failed to save messages', e);
  }
}

export function loadCurrentUserId(): string {
  try {
    const id = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (id) return id;
  } catch (e) {
    console.error(e);
  }
  return '';
}

export function saveCurrentUserId(id: string) {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, id);
  } catch (e) {
    console.error(e);
  }
}

export function loadSoundPreference(): boolean {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.SOUND);
    if (val !== null) return JSON.parse(val);
  } catch (e) {
    console.error(e);
  }
  return true;
}

export function saveSoundPreference(enabled: boolean) {
  try {
    localStorage.setItem(STORAGE_KEYS.SOUND, JSON.stringify(enabled));
  } catch (e) {
    console.error(e);
  }
}
