import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { User, Chat, Message, TypingStatus } from './types/chat';
import {
  loadUsers,
  saveUsers,
  loadChats,
  saveChats,
  loadMessages,
  saveMessages,
  loadCurrentUserId,
  saveCurrentUserId,
  loadSoundPreference,
  saveSoundPreference,
} from './utils/storage';
import {
  getActiveAuthSession,
  clearAuthSession,
} from './utils/security';
import { soundManager } from './utils/audio';
import { Sidebar } from './components/Sidebar';
import { ChatHeader } from './components/ChatHeader';
import { MessageList } from './components/MessageList';
import { MessageInput } from './components/MessageInput';
import { ChatInfoDrawer } from './components/ChatInfoDrawer';
import { AuthPage } from './components/AuthPage';
import { NewChatModal } from './components/NewChatModal';
import { ToastNotification, ToastItem } from './components/ToastNotification';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { SettingsModal } from './components/SettingsModal';
import { ContactsModal } from './components/ContactsModal';
import { UserProfileModal } from './components/UserProfileModal';
import { SharedMediaModal } from './components/SharedMediaModal';
import { MessageSquarePlus, Sparkles, ShieldCheck } from 'lucide-react';

export default function App() {
  const [users, setUsers] = useState<User[]>(loadUsers);
  const [chats, setChats] = useState<Chat[]>(loadChats);
  const [messages, setMessages] = useState<Message[]>(loadMessages);
  const [currentUserId, setCurrentUserId] = useState<string>(loadCurrentUserId);
  const [activeChatId, setActiveChatId] = useState<string>('');

  // Authentication & Session state
  const [activeSession, setActiveSession] = useState(() => getActiveAuthSession());
  const isAuthenticated = !!activeSession;

  const currentUser = useMemo(() => {
    const found = users.find((u) => u.id === currentUserId && !u.isBot && !u.isSystem);
    if (found) return found;

    const humanUser = users.find((u) => !u.isBot && !u.isSystem);
    if (humanUser) return humanUser;

    return {
      id: activeSession?.userId || 'u_1',
      name: activeSession?.username || 'Alex Rivera',
      username: activeSession?.username || 'alex_rivera',
      email: activeSession?.email || 'alex@telegram.org',
      avatarBg: 'bg-indigo-600',
      avatarText: (activeSession?.username || 'AR').slice(0, 2).toUpperCase(),
      status: 'online',
    };
  }, [users, currentUserId, activeSession]);

  const currentUserRef = useRef(currentUser.id);
  useEffect(() => {
    currentUserRef.current = currentUser.id;
  }, [currentUser.id]);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(loadSoundPreference);
  const [isOpenMobileSidebar, setIsOpenMobileSidebar] = useState<boolean>(false);
  const [isOpenChatInfo, setIsOpenChatInfo] = useState<boolean>(false);
  const [isOpenAuthModal, setIsOpenAuthModal] = useState<boolean>(false);
  const [isOpenNewChatModal, setIsOpenNewChatModal] = useState<boolean>(false);

  // New Telegram Modals State
  const [isOpenGlobalSearch, setIsOpenGlobalSearch] = useState<boolean>(false);
  const [isOpenSettings, setIsOpenSettings] = useState<boolean>(false);
  const [isOpenContacts, setIsOpenContacts] = useState<boolean>(false);
  const [isOpenSharedMedia, setIsOpenSharedMedia] = useState<boolean>(false);
  const [profileTargetUser, setProfileTargetUser] = useState<User | null>(null);

  const [replyingMessage, setReplyingMessage] = useState<Message | null>(null);
  const [typingStatuses, setTypingStatuses] = useState<TypingStatus[]>([]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Real-time synchronization via Server-Sent Events (SSE) & REST backend
  useEffect(() => {
    const fetchState = async () => {
      try {
        const res = await fetch('/api/state');
        const data = await res.json();
        if (data.users) setUsers(data.users);
        if (data.chats) setChats(data.chats);
        if (data.messages) setMessages(data.messages);
      } catch (e) {
        console.error('Failed to load initial state from server', e);
      }
    };

    fetchState();

    const eventSource = new EventSource('/api/events');

    eventSource.addEventListener('message:new', (event) => {
      const data = JSON.parse(event.data);
      if (data.message) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
        if (data.message.senderId !== currentUserRef.current) {
          soundManager.playReceive();
        }
      }
    });

    eventSource.addEventListener('message:update', (event) => {
      const data = JSON.parse(event.data);
      if (data.message) {
        setMessages((prev) =>
          prev.map((m) => (m.id === data.message.id ? data.message : m))
        );
      }
    });

    eventSource.addEventListener('message:delete', (event) => {
      const data = JSON.parse(event.data);
      if (data.messageId) {
        setMessages((prev) => prev.filter((m) => m.id !== data.messageId));
      }
    });

    eventSource.addEventListener('chat:new', (event) => {
      const data = JSON.parse(event.data);
      if (data.chat) {
        setChats((prev) => {
          if (prev.some((c) => c.id === data.chat.id)) return prev;
          return [data.chat, ...prev];
        });
      }
    });

    eventSource.addEventListener('user:update', (event) => {
      const data = JSON.parse(event.data);
      if (data.users) {
        setUsers(data.users);
      }
    });

    eventSource.addEventListener('typing', (event) => {
      const data = JSON.parse(event.data);
      if (data.chatId && data.typing) {
        setTypingStatuses((prev) => {
          const otherChatsTyping = prev.filter((t) => t.chatId !== data.chatId);
          const newTyping = data.typing.map((t: any) => ({
            chatId: data.chatId,
            userId: t.userId,
            username: t.userName || t.username,
          }));
          return [...otherChatsTyping, ...newTyping];
        });
      }
    });

    return () => {
      eventSource.close();
    };
  }, []);

  // Keep session synced with current user
  useEffect(() => {
    if (activeSession && activeSession.userId) {
      setCurrentUserId(activeSession.userId);
      const freshUsers = loadUsers();
      setUsers(freshUsers);
    }
  }, [activeSession]);

  // Ensure built-in assistant conversations (Luna & Music) exist for currentUser
  useEffect(() => {
    if (!currentUser.id) return;

    const lunaChatId = `chat_luna_${currentUser.id}`;
    const musicChatId = `chat_music_${currentUser.id}`;

    const newChatsToAdd: Chat[] = [];
    const newMsgsToAdd: Message[] = [];

    // Check Luna Chat
    if (!chats.some((c) => c.participants.includes('u_system_luna') && c.participants.includes(currentUser.id))) {
      const lunaChat: Chat = {
        id: lunaChatId,
        type: 'direct',
        name: 'Luna',
        avatarBg: 'bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500',
        avatarText: '🌙',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        participants: [currentUser.id, 'u_system_luna'],
        isPinned: true,
        unreadCount: 0,
      };
      newChatsToAdd.push(lunaChat);

      fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lunaChat),
      }).catch((e) => console.error(e));

      if (!messages.some((m) => m.chatId === lunaChatId)) {
        const welcomeMsg: Message = {
          id: `m_welcome_luna_${currentUser.id}`,
          chatId: lunaChatId,
          senderId: 'u_system_luna',
          content: "Hey there! 😊 I'm Luna. I missed our chats! Tell me what's on your mind today, or let me know if you need help with coding, writing, or anything else! ✨",
          timeFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: Date.now(),
          status: 'read',
        };
        newMsgsToAdd.push(welcomeMsg);

        fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(welcomeMsg),
        }).catch((e) => console.error(e));
      }
    }

    // Check Music Chat
    if (!chats.some((c) => c.participants.includes('u_system_music') && c.participants.includes(currentUser.id))) {
      const musicChat: Chat = {
        id: musicChatId,
        type: 'direct',
        name: 'Music',
        avatarBg: 'bg-gradient-to-tr from-cyan-500 via-blue-500 to-indigo-600',
        avatarText: '🎵',
        avatarUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=200&q=80',
        participants: [currentUser.id, 'u_system_music'],
        isPinned: true,
        unreadCount: 0,
      };
      newChatsToAdd.push(musicChat);

      fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(musicChat),
      }).catch((e) => console.error(e));

      if (!messages.some((m) => m.chatId === musicChatId)) {
        const welcomeMsg: Message = {
          id: `m_welcome_music_${currentUser.id}`,
          chatId: musicChatId,
          senderId: 'u_system_music',
          content: "Welcome to Music! 🎵 Send any song name or artist to search, stream, and download 320kbps high-quality audio directly in chat!",
          timeFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: Date.now(),
          status: 'read',
        };
        newMsgsToAdd.push(welcomeMsg);

        fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(welcomeMsg),
        }).catch((e) => console.error(e));
      }
    }

    if (newChatsToAdd.length > 0) {
      setChats((prev) => {
        const existingIds = new Set(prev.map((c) => c.id));
        const filtered = newChatsToAdd.filter((c) => !existingIds.has(c.id));
        return [...filtered, ...prev];
      });
    }

    if (newMsgsToAdd.length > 0) {
      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const filtered = newMsgsToAdd.filter((m) => !existingIds.has(m.id));
        return [...prev, ...filtered];
      });
    }
  }, [currentUser.id, chats, messages]);

  // Sound sync
  useEffect(() => {
    soundManager.setEnabled(soundEnabled);
    saveSoundPreference(soundEnabled);
  }, [soundEnabled]);

  // Persist state changes
  useEffect(() => {
    saveUsers(users);
  }, [users]);

  useEffect(() => {
    saveChats(chats);
  }, [chats]);

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  useEffect(() => {
    if (currentUserId) {
      saveCurrentUserId(currentUserId);
    }
  }, [currentUserId]);

  // Mark messages as 'read' when recipient opens the chat
  useEffect(() => {
    if (!activeChatId || !currentUser) return;

    const unreadMessages = messages.filter(
      (m) => m.chatId === activeChatId && m.senderId !== currentUser.id && m.status !== 'read'
    );

    if (unreadMessages.length > 0) {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.chatId === activeChatId && m.senderId !== currentUser.id && m.status !== 'read') {
            const updated = { ...m, status: 'read' as const };
            fetch(`/api/messages/${m.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'read' }),
            }).catch((err) => console.error('Failed to mark message read', err));
            return updated;
          }
          return m;
        })
      );
    }
  }, [activeChatId, messages, currentUser]);

  // Filter chats relevant to current user
  const userChats = useMemo(() => {
    return chats.filter((c) => c.id === 'chat_global_1' || c.participants.includes(currentUser.id));
  }, [chats, currentUser.id]);

  const activeChat = useMemo(() => {
    return userChats.find((c) => c.id === activeChatId) || userChats[0];
  }, [userChats, activeChatId]);

  const [searchMessageQuery, setSearchMessageQuery] = useState('');

  const usersMap = useMemo(() => {
    const map: Record<string, User> = {};
    users.forEach((u) => {
      map[u.id] = u;
    });
    return map;
  }, [users]);

  const activeMessages = useMemo(() => {
    if (!activeChat) return [];
    let msgs = messages.filter((m) => m.chatId === activeChat.id);
    
    // Filter blocked users
    if (currentUser?.blockedUsers?.length) {
      msgs = msgs.filter(m => !currentUser.blockedUsers!.includes(m.senderId));
    }
    
    if (searchMessageQuery) {
      const q = searchMessageQuery.toLowerCase();
      msgs = msgs.filter(m => 
        m.content.toLowerCase().includes(q) || 
        (usersMap[m.senderId]?.name || '').toLowerCase().includes(q)
      );
    }
    
    // Deduplicate messages by ID to ensure unique keys
    const seen = new Set<string>();
    return msgs.filter((m) => {
      if (!m || !m.id || seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  }, [messages, activeChat, searchMessageQuery, usersMap, currentUser]);

  // Toast Helper
  const addToast = (title: string, body: string, isMention: boolean = false) => {
    const id = `toast_${Date.now()}`;
    setToasts((prev) => [...prev, { id, title, body, isMention }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth Handlers
  const handleLoginSuccess = (loggedInUser: User, token: string) => {
    const freshUsers = loadUsers();
    setUsers(freshUsers);
    setCurrentUserId(loggedInUser.id);
    setActiveSession(getActiveAuthSession());
    setIsOpenAuthModal(false);
    addToast('Authentication Granted', `Welcome back, @${loggedInUser.username}`);
  };

  const handleLogout = () => {
    clearAuthSession();
    setActiveSession(null);
    setCurrentUserId('');
    setActiveChatId('');
    addToast('Logged Out', 'Your session has been terminated securely.');
  };

  const handleUpdateUser = (updated: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, ...updated } : u))
    );
    addToast('Profile Updated', 'Your Telegram profile details were saved successfully.');
  };

  // Start Direct Chat helper
  const handleStartDirectChat = (user: User) => {
    const existing = chats.find(
      (c) =>
        c.type === 'direct' &&
        c.participants.includes(user.id) &&
        c.participants.includes(currentUser.id)
    );
    if (existing) {
      setActiveChatId(existing.id);
    } else {
      const newChat: Chat = {
        id: `chat_${Date.now()}`,
        type: 'direct',
        name: user.name,
        avatarBg: user.avatarBg,
        avatarText: user.avatarText || user.name.slice(0, 2).toUpperCase(),
        avatarUrl: user.avatarUrl,
        participants: [currentUser.id, user.id],
        unreadCount: 0,
      };
      setChats((prev) => [newChat, ...prev]);
      setActiveChatId(newChat.id);

      fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newChat),
      }).catch((err) => console.error('Failed to post new chat', err));
    }
  };

  // User typing heartbeat
  const handleUserTyping = useCallback(() => {
    if (!activeChat || !currentUser) return;

    setTypingStatuses((prev) => {
      const exists = prev.some(
        (t) => t.chatId === activeChat.id && t.userId === currentUser.id
      );
      if (exists) return prev;
      return [
        ...prev,
        {
          chatId: activeChat.id,
          userId: currentUser.id,
          username: currentUser.username,
        },
      ];
    });

    fetch('/api/typing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatId: activeChat.id,
        userId: currentUser.id,
        userName: currentUser.name || currentUser.username,
        isTyping: true,
      }),
    }).catch(() => {});

    setTimeout(() => {
      setTypingStatuses((prev) =>
        prev.filter(
          (t) => !(t.chatId === activeChat.id && t.userId === currentUser.id)
        )
      );
    }, 3000);
  }, [activeChat, currentUser]);

  // Send message handler
  const [lastGlobalMsgTime, setLastGlobalMsgTime] = useState(0);

  const handleSendMessage = (
    content: string,
    mentions: string[] = [],
    replyToId?: string
  ) => {
    if (!activeChat || !currentUser) return;
    
    // Clear user typing status
    fetch('/api/typing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatId: activeChat.id,
        userId: currentUser.id,
        userName: currentUser.name || currentUser.username,
        isTyping: false,
      }),
    }).catch(() => {});

    // Slow mode enforcement for Global Chat (e.g. 5 seconds)
    if (activeChat.id === 'chat_global_1') {
      const now = Date.now();
      if (now - lastGlobalMsgTime < 5000) {
        addToast('Slow Mode Active', 'Please wait 5 seconds between messages in Global Chat.');
        return;
      }
      setLastGlobalMsgTime(now);
    }

    // Immediate assistant typing indicator trigger for Luna/Music
    if (activeChat.participants.includes('u_system_luna')) {
      setTypingStatuses((prev) => [
        ...prev.filter((t) => !(t.chatId === activeChat.id && t.userId === 'u_system_luna')),
        { chatId: activeChat.id, userId: 'u_system_luna', username: 'Luna' },
      ]);
    } else if (activeChat.participants.includes('u_system_music')) {
      setTypingStatuses((prev) => [
        ...prev.filter((t) => !(t.chatId === activeChat.id && t.userId === 'u_system_music')),
        { chatId: activeChat.id, userId: 'u_system_music', username: 'Music' },
      ]);
    }

    const timeFormatted = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newMsg: Message = {
      id: `m_${Date.now()}`,
      chatId: activeChat.id,
      senderId: currentUser.id,
      content,
      timestamp: new Date().toISOString(),
      timeFormatted,
      status: 'delivered',
      replyToId,
      mentions,
    };

    setMessages((prev) => [...prev, newMsg]);

    fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMsg),
    }).catch((err) => console.error('Failed to send message', err));

    // Update active chat's last message snippet
    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChat.id
          ? {
              ...c,
              lastMessage: content,
              lastMessageTime: timeFormatted,
              unreadCount: 0,
            }
          : c
      )
    );

    // soundManager.playSend();
  };

  // Toggle reaction on message
  const handleReact = (messageId: string, emoji: string) => {
    if (!currentUser) return;
    const targetMsg = messages.find((m) => m.id === messageId);
    if (!targetMsg) return;

    const reactions = targetMsg.reactions ? [...targetMsg.reactions] : [];
    const existingIdx = reactions.findIndex((r) => r.emoji === emoji);

    if (existingIdx !== -1) {
      const rx = reactions[existingIdx];
      const hasReacted = rx.users.includes(currentUser.id);

      if (hasReacted) {
        rx.users = rx.users.filter((id) => id !== currentUser.id);
        rx.count -= 1;
        if (rx.count <= 0) {
          reactions.splice(existingIdx, 1);
        }
      } else {
        rx.users.push(currentUser.id);
        rx.count += 1;
      }
    } else {
      reactions.push({
        emoji,
        count: 1,
        users: [currentUser.id],
      });
    }

    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, reactions } : m))
    );

    fetch(`/api/messages/${messageId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reactions }),
    }).catch((err) => console.error('Failed to update reaction', err));
  };

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast('Copied to clipboard', text.slice(0, 50));
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
    addToast('Message deleted', 'The message was removed from the thread');

    fetch(`/api/messages/${messageId}`, {
      method: 'DELETE',
    }).catch((err) => console.error('Failed to delete message', err));
  };

  const handleEditMessage = (messageId: string, newContent: string) => {
    const editContent = prompt('Edit your message:', newContent);
    if (editContent !== null && editContent.trim() !== '') {
      const updatedContent = editContent.trim();
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, content: updatedContent, isEdited: true } : m
        )
      );
      addToast('Message edited', 'The message was updated');

      fetch(`/api/messages/${messageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: updatedContent, isEdited: true }),
      }).catch((err) => console.error('Failed to edit message', err));
    }
  };

  const handleReportMessage = (messageId: string) => {
    addToast('Message reported', 'The message has been reported to moderators.');
  };

  const handlePinMessage = (messageId: string) => {
    if (activeChat?.id !== 'chat_global_1') return; // For simplicity, only in Global Chat
    const targetMsg = messages.find((m) => m.id === messageId);
    if (!targetMsg) return;

    const newPinned = !targetMsg.pinned;
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, pinned: newPinned } : m))
    );
    addToast('Message Pinned', 'The message was pinned to the channel.');

    fetch(`/api/messages/${messageId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pinned: newPinned }),
    }).catch((err) => console.error('Failed to pin message', err));
  };

  const handleBlockUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === currentUser.id) {
          const blockedUsers = u.blockedUsers || [];
          if (blockedUsers.includes(userId)) {
            // Unblock
            return { ...u, blockedUsers: blockedUsers.filter((id) => id !== userId) };
          } else {
            // Block
            return { ...u, blockedUsers: [...blockedUsers, userId] };
          }
        }
        return u;
      })
    );
    addToast('Privacy Settings Updated', 'User block status changed.');
  };

  const handleClearChat = () => {
    if (!activeChat) return;
    if (
      window.confirm(
        `Are you sure you want to clear all messages in ${activeChat.name}?`
      )
    ) {
      setMessages((prev) => prev.filter((m) => m.chatId !== activeChat.id));
      setChats((prev) =>
        prev.map((c) =>
          c.id === activeChat.id
            ? { ...c, lastMessage: 'Chat cleared', lastMessageTime: '' }
            : c
        )
      );
      addToast('Chat Cleared', `Messages in ${activeChat.name} were reset`);
      setIsOpenChatInfo(false);
    }
  };

  const handleExportChat = () => {
    if (!activeChat) return;
    const chatMessages = messages.filter((m) => m.chatId === activeChat.id);
    const exportData = {
      chatName: activeChat.name,
      exportDate: new Date().toISOString(),
      messages: chatMessages.map((m) => ({
        sender: usersMap[m.senderId]?.name || m.senderId,
        username: usersMap[m.senderId]?.username || '',
        time: m.timeFormatted,
        content: m.content,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeChat.name.replace(/\s+/g, '_')}_chat_export.json`;
    a.click();
    URL.revokeObjectURL(url);

    addToast('Export Complete', 'Exported chat history JSON file');
  };

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, unreadCount: 0 } : c))
    );
  };

  const handleCreateChat = (newChat: Chat) => {
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    addToast('Conversation Started', newChat.name);
  };

  // PROTECTED ROUTE GATE: Unauthenticated users MUST NOT access any feature!
  if (!isAuthenticated) {
    return (
      <AuthPage
        users={users}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen bg-[#0f172a] text-slate-200 font-sans overflow-hidden select-none">
      {/* Toast Banner Container */}
      <ToastNotification toasts={toasts} onDismiss={handleDismissToast} />

      {/* Sidebar Navigation */}
      <Sidebar
        chats={userChats}
        activeChatId={activeChat?.id || ''}
        onSelectChat={handleSelectChat}
        currentUser={currentUser}
        users={users}
        typingStatuses={typingStatuses}
        onSelectUser={(u) => setCurrentUserId(u.id)}
        onOpenAuthModal={() => setIsOpenAuthModal(true)}
        onLogout={handleLogout}
        onNewChat={() => setIsOpenNewChatModal(true)}
        onOpenSearch={() => setIsOpenGlobalSearch(true)}
        onOpenContacts={() => setIsOpenContacts(true)}
        onOpenSettings={() => setIsOpenSettings(true)}
        isOpenMobile={isOpenMobileSidebar}
        onCloseMobile={() => setIsOpenMobileSidebar(false)}
      />

      {/* Main Conversation Window */}
      <main className="flex-1 flex flex-col relative bg-[#0f172a] overflow-hidden min-w-0">
        {activeChat ? (
          <>
            <ChatHeader
              activeChat={activeChat}
              users={users}
              currentUserId={currentUser.id}
              typingStatuses={typingStatuses}
              onOpenMobileSidebar={() => setIsOpenMobileSidebar(true)}
              onOpenChatInfo={() => setIsOpenChatInfo(true)}
              onClearChat={handleClearChat}
              onExportChat={handleExportChat}
              searchQuery={searchMessageQuery}
              onSearchChange={setSearchMessageQuery}
            />

            <MessageList
              messages={activeMessages}
              currentUserId={currentUser.id}
              usersMap={usersMap}
              typingStatuses={typingStatuses}
              activeChatId={activeChat.id}
              onReact={handleReact}
              onCopy={handleCopyMessage}
              onDelete={handleDeleteMessage}
              onReply={(msg) => setReplyingMessage(msg)}
              onEdit={handleEditMessage}
              onReport={handleReportMessage}
              onPin={handlePinMessage}
            />

            <MessageInput
              onSendMessage={handleSendMessage}
              onTyping={handleUserTyping}
              availableUsers={users}
              replyingToMessage={replyingMessage}
              onCancelReply={() => setReplyingMessage(null)}
              soundEnabled={soundEnabled}
              onToggleSound={() => setSoundEnabled(!soundEnabled)}
            />
          </>
        ) : (
          /* Empty State when no chats exist for current user */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#0f172a]">
            <div className="w-16 h-16 rounded-3xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 shadow-xl">
              <MessageSquarePlus className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-100 mb-1">No Data Available Yet</h2>
            <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
              Welcome, <strong className="text-slate-200">{currentUser.name}</strong> (@{currentUser.username})! You do not have any active chats yet. Start a new conversation or channel to begin messaging.
            </p>

            <button
              onClick={() => setIsOpenNewChatModal(true)}
              className="min-h-[44px] bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all active:scale-95 cursor-pointer text-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start New Conversation</span>
            </button>
          </div>
        )}
      </main>

      {/* Chat Info Drawer */}
      {activeChat && (
        <ChatInfoDrawer
          isOpen={isOpenChatInfo}
          onClose={() => setIsOpenChatInfo(false)}
          chat={activeChat}
          users={users}
          onClearChat={handleClearChat}
          onExportChat={handleExportChat}
        />
      )}

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isOpenGlobalSearch}
        onClose={() => setIsOpenGlobalSearch(false)}
        users={users}
        chats={userChats}
        currentUserId={currentUser.id}
        onSelectUser={(u) => setProfileTargetUser(u)}
        onSelectChat={handleSelectChat}
        onStartDirectChat={handleStartDirectChat}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isOpenSettings}
        onClose={() => setIsOpenSettings(false)}
        currentUser={currentUser}
        onUpdateUser={handleUpdateUser}
        onLogout={handleLogout}
      />

      {/* Contacts Modal */}
      <ContactsModal
        isOpen={isOpenContacts}
        onClose={() => setIsOpenContacts(false)}
        users={users}
        currentUserId={currentUser.id}
        onStartChat={handleStartDirectChat}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        user={profileTargetUser}
        isOpen={!!profileTargetUser}
        onClose={() => setProfileTargetUser(null)}
        onStartChat={handleStartDirectChat}
        onBlockUser={handleBlockUser}
        isBlocked={currentUser.blockedUsers?.includes(profileTargetUser?.id || '')}
      />

      {/* Switch or Add Account Modal */}
      {isOpenAuthModal && (
        <AuthPage
          users={users}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* New Chat/Group Modal */}
      <NewChatModal
        isOpen={isOpenNewChatModal}
        onClose={() => setIsOpenNewChatModal(false)}
        users={users}
        currentUserId={currentUser.id}
        onCreateChat={handleCreateChat}
      />
    </div>
  );
}

