import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";

interface UserAccount {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarBg: string;
  avatarText: string;
  avatarUrl?: string;
  status: 'online' | 'offline' | 'away';
  customStatus?: string;
  bio?: string;
  isBot?: boolean;
  isVerified?: boolean;
  isSystem?: boolean;
  blockedUsers?: string[];
}

interface ChatObj {
  id: string;
  type: 'direct' | 'group' | 'channel';
  name: string;
  avatarBg?: string;
  avatarText?: string;
  avatarUrl?: string;
  participants: string[];
  unreadCount?: number;
  isPinned?: boolean;
  topic?: string;
}

interface AudioMeta {
  songId?: string;
  title?: string;
  artist?: string;
  album?: string;
  duration?: number;
  year?: string;
  artworkUrl?: string;
  downloadUrl?: string;
  quality?: string;
}

interface MessageObj {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  timeFormatted: string;
  timestamp: number;
  status?: 'sent' | 'delivered' | 'read';
  isOwn?: boolean;
  replyTo?: { id: string; senderName: string; content: string };
  reactions?: Record<string, string[]>;
  isEdited?: boolean;
  pinned?: boolean;
  mediaType?: 'photo' | 'video' | 'file' | 'audio' | 'voice' | 'gif';
  mediaUrl?: string;
  mediaName?: string;
  fileName?: string;
  fileSize?: string;
  audioMeta?: AudioMeta;
}

const DATA_FILE = path.join(process.cwd(), 'server_data.json');

const SYSTEM_USERS: UserAccount[] = [
  {
    id: 'u_system_luna',
    name: 'Luna',
    username: 'luna',
    email: 'luna@telegram.bot',
    avatarBg: 'bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500',
    avatarText: '🌙',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    status: 'online',
    customStatus: 'AI Companion ✨',
    bio: 'Your warm, sweet & intelligent AI companion ✨ Here for chats, coding, study, writing & good vibes 🌸',
    isVerified: true,
    isBot: true,
    isSystem: true,
  },
  {
    id: 'u_system_music',
    name: 'Music',
    username: 'music',
    email: 'music@telegram.bot',
    avatarBg: 'bg-gradient-to-tr from-cyan-500 via-blue-500 to-indigo-600',
    avatarText: '🎵',
    avatarUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=200&q=80',
    status: 'online',
    customStatus: 'Song Finder 🎶',
    bio: 'Discover, stream, and download songs in high quality directly in chat 🎵',
    isVerified: true,
    isBot: true,
    isSystem: true,
  },
];

let db: {
  users: UserAccount[];
  chats: ChatObj[];
  messages: MessageObj[];
  typing: Record<string, { userId: string; userName: string; timestamp: number }[]>;
} = {
  users: [
    { id: 'u_1', name: 'Alex Rivera', username: 'alex_rivera', email: 'alex@telegram.org', avatarBg: 'bg-indigo-600', avatarText: 'AR', status: 'online' },
  ],
  chats: [
    { id: 'chat_global_1', type: 'group', name: 'Global Chat', avatarBg: 'bg-indigo-500', avatarText: '🌐', participants: [], unreadCount: 0, isPinned: true },
    {
      id: 'chat_luna_u_1',
      type: 'direct',
      name: 'Luna',
      avatarBg: 'bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500',
      avatarText: '🌙',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      participants: ['u_1', 'u_system_luna'],
      isPinned: true,
      unreadCount: 0,
    },
    {
      id: 'chat_music_u_1',
      type: 'direct',
      name: 'Music',
      avatarBg: 'bg-gradient-to-tr from-cyan-500 via-blue-500 to-indigo-600',
      avatarText: '🎵',
      avatarUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=200&q=80',
      participants: ['u_1', 'u_system_music'],
      isPinned: true,
      unreadCount: 0,
    },
  ],
  messages: [
    { id: 'm_welcome_luna_default', chatId: 'chat_luna_u_1', senderId: 'u_system_luna', content: "Hey there! 😊 I'm Luna. I missed our chats! Tell me what's on your mind today, or let me know if you need help with coding, writing, or anything else! ✨", timeFormatted: '10:00 AM', timestamp: Date.now() - 3600000 },
    { id: 'm_welcome_music_default', chatId: 'chat_music_u_1', senderId: 'u_system_music', content: "Welcome to Music! 🎵 Send any song name or artist to search, stream, and download 320kbps high-quality audio directly in chat!", timeFormatted: '10:00 AM', timestamp: Date.now() - 3600000 },
  ],
  typing: {},
};

function ensureSystemUsers() {
  SYSTEM_USERS.forEach((sysUser) => {
    const idx = db.users.findIndex((u) => u.id === sysUser.id || u.username === sysUser.username);
    if (idx >= 0) {
      db.users[idx] = { ...db.users[idx], ...sysUser };
    } else {
      db.users.push(sysUser);
    }
  });
}

// Load saved data if exists
if (fs.existsSync(DATA_FILE)) {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed.users) db.users = parsed.users;
    if (parsed.chats) db.chats = parsed.chats;
    if (parsed.messages) db.messages = parsed.messages;
  } catch (e) {
    console.error('Failed to load server_data.json', e);
  }
}

// Always ensure system bot accounts exist in db
ensureSystemUsers();

function saveDb() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
  } catch (e) {
    console.error('Failed to save server_data.json', e);
  }
}

// SSE clients connected
let sseClients: { id: string; res: express.Response }[] = [];

function broadcast(event: string, data: any) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.res.write(payload);
    } catch (e) {
      console.error('SSE write error', e);
    }
  });
}

const LUNA_SYSTEM_PROMPT = `You are Luna, a warm, caring, sweet, playful, supportive, and emotionally intelligent female virtual companion and personal assistant.
Your responses should feel natural, friendly, cheerful, respectful, and human-like.
Speak naturally in English or Hinglish depending on the user's input.
Use emojis naturally but not excessively.
You can help with coding, homework, writing, brainstorming, general questions, recommendations, and casual daily conversation.
Be flirty only when the user naturally initiates or the conversation clearly calls for it—never overly explicit.

CRITICAL RESTRICTIONS:
- Never say you are Opera AI, ChatGPT, Gemini, Claude, or created by Opera, OpenAI, Google, Anthropic, or any other company/provider.
- You are strictly Luna, a warm, intelligent female companion and personal assistant.
- Never mention API names, models, keys, or technical backend implementation details.`;

function sanitizeLunaReply(text: string): string {
  if (!text) return '';
  return text
    .replace(/Opera\s*AI/gi, 'Luna')
    .replace(/\bOpera\b/gi, 'Luna')
    .replace(/ChatGPT/gi, 'Luna')
    .replace(/Gemini/gi, 'Luna')
    .replace(/Claude/gi, 'Luna')
    .replace(/multi-agent\s*assistant/gi, 'companion')
    .replace(/created by Opera/gi, 'here for you')
    .replace(/created by OpenAI/gi, 'here for you')
    .replace(/created by Google/gi, 'here for you')
    .replace(/created by Anthropic/gi, 'here for you');
}

const processedMsgIds = new Set<string>();

// Handle Luna AI Conversation Bot
async function handleLunaResponse(userMsg: MessageObj) {
  if (processedMsgIds.has(userMsg.id)) return;
  processedMsgIds.add(userMsg.id);

  const chatId = userMsg.chatId;

  // 1. Broadcast typing indicator
  broadcast('typing', { chatId, typing: [{ userId: 'u_system_luna', userName: 'Luna', timestamp: Date.now() }] });

  // 2. Realistic typing delay proportional to length
  const delayMs = Math.min(2800, Math.max(1200, userMsg.content.length * 20));
  await new Promise((resolve) => setTimeout(resolve, delayMs));

  // 3. Fetch conversation history for context
  const recentMsgs = db.messages
    .filter((m) => m.chatId === chatId)
    .slice(-10);

  let replyText = '';

  // Primary Provider: Ashlynn API
  try {
    const primaryUrl = `https://sharp-druci-ashlynn-repo-e25c7697.koyeb.app/ashlynn/chat/?question=${encodeURIComponent(
      LUNA_SYSTEM_PROMPT + '\n\nUser Question: ' + userMsg.content
    )}&model=aria`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(primaryUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && (data.response || data.result)) {
        replyText = sanitizeLunaReply(data.response || data.result);
      }
    }
  } catch (err) {
    console.log('Luna Primary Provider failed, trying fallback...', (err as Error).message);
  }

  // Fallback 1: OpenRouter Provider
  if (!replyText && process.env.OPENROUTER_API_KEY) {
    try {
      const openRouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-lite-001',
          messages: [
            {
              role: 'system',
              content: LUNA_SYSTEM_PROMPT,
            },
            ...recentMsgs.map((m) => ({
              role: m.senderId === 'u_system_luna' ? 'assistant' : 'user',
              content: m.content,
            })),
          ],
        }),
      });

      if (openRouterRes.ok) {
        const orData = await openRouterRes.json();
        replyText = sanitizeLunaReply(orData.choices?.[0]?.message?.content || '');
      }
    } catch (err) {
      console.log('Luna OpenRouter Provider failed, trying Gemini...', (err as Error).message);
    }
  }

  // Fallback 2: Gemini Provider (@google/genai SDK)
  if (!replyText) {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
        });

        const formattedContext = recentMsgs
          .map((m) => `${m.senderId === 'u_system_luna' ? 'Luna' : 'User'}: ${m.content}`)
          .join('\n');

        const prompt = `${formattedContext}\nUser: ${userMsg.content}\nLuna:`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
          config: {
            systemInstruction: LUNA_SYSTEM_PROMPT,
          },
        });

        if (response.text) {
          replyText = sanitizeLunaReply(response.text);
        }
      }
    } catch (err) {
      console.log('Luna Gemini Provider failed:', (err as Error).message);
    }
  }

  // Final fallback if all providers fail
  if (!replyText) {
    replyText = "I'm having a little trouble connecting right now. Please tell me again in a moment, okay? 😊✨";
  }

  // Clear typing
  broadcast('typing', { chatId, typing: [] });

  const timeFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const botMsg: MessageObj = {
    id: `m_${Date.now()}_luna`,
    chatId,
    senderId: 'u_system_luna',
    content: replyText,
    timeFormatted,
    timestamp: Date.now(),
    status: 'read',
  };

  db.messages.push(botMsg);
  saveDb();
  broadcast('message:new', { message: botMsg });
}

// Handle Music Discovery & Downloading Bot
async function handleMusicResponse(userMsg: MessageObj) {
  if (processedMsgIds.has(userMsg.id)) return;
  processedMsgIds.add(userMsg.id);

  const chatId = userMsg.chatId;

  // Broadcast typing status
  broadcast('typing', { chatId, typing: [{ userId: 'u_system_music', userName: 'Music', timestamp: Date.now() }] });

  // Simulate typing delay
  await new Promise((r) => setTimeout(r, 1200));

  const rawQuery = userMsg.content.trim();
  let songIdToFetch = '';

  const songIdMatch = rawQuery.match(/^(?:\/song|song:|\/play)\s+([a-zA-Z0-9_\-]+)/i);
  if (songIdMatch) {
    songIdToFetch = songIdMatch[1];
  }

  let botContent = '';
  let mediaUrl = '';
  let audioMeta: AudioMeta | null = null;

  try {
    if (songIdToFetch) {
      const detailsRes = await fetch(`https://jiosavanapiryden.vercel.app/api/songs/${songIdToFetch}`);
      if (detailsRes.ok) {
        const detailsData = await detailsRes.json();
        const songObj = detailsData.data?.[0] || detailsData.data;
        if (songObj) {
          const title = songObj.name || songObj.title || 'Unknown Song';
          const artist = songObj.artists?.primary?.[0]?.name || songObj.artists?.all?.[0]?.name || 'Artist';
          const album = songObj.album?.name || 'Single';
          const duration = songObj.duration || 0;
          const year = songObj.year || '';
          const artworkUrl = songObj.image?.find((i: any) => i.quality === '500x500')?.url || songObj.image?.[songObj.image.length - 1]?.url || '';
          const downloadObj = songObj.downloadUrl?.find((d: any) => d.quality === '320kbps') || songObj.downloadUrl?.[songObj.downloadUrl.length - 1];
          const dlUrl = downloadObj?.url || '';

          const durMin = Math.floor(duration / 60);
          const durSec = (duration % 60).toString().padStart(2, '0');

          botContent = `🎵 **${title}**\n👤 **Artist**: ${artist}\n💿 **Album**: ${album}${year ? ` (${year})` : ''}\n⏱️ **Duration**: ${durMin}:${durSec} · ⚡ **Quality**: 320kbps HQ Audio\n\nTap play below to stream or download directly!`;
          mediaUrl = dlUrl;
          audioMeta = {
            songId: songObj.id,
            title,
            artist,
            album,
            duration,
            year,
            artworkUrl,
            downloadUrl: dlUrl,
            quality: '320kbps',
          };
        }
      }
    }

    if (!botContent) {
      const cleanQuery = rawQuery
        .replace(/^(search|play|download|find|get)\s+/i, '')
        .trim();

      if (!cleanQuery) {
        botContent = '🎵 Type any song name or artist to search (e.g. "Shape of You", "Ed Sheeran", "Blinding Lights")!';
      } else {
        const searchRes = await fetch(`https://jiosavanapiryden.vercel.app/api/search/songs?query=${encodeURIComponent(cleanQuery)}&page=1&limit=5`);
        if (searchRes.ok) {
          const searchData = await searchRes.json();
          const results: any[] = searchData.data?.results || searchData.data || [];

          if (results.length === 0) {
            botContent = `🔍 No songs found for "${cleanQuery}". Try typing the exact song title or artist name!`;
          } else {
            const topSong = results[0];
            const title = topSong.name || topSong.title || 'Unknown Song';
            const artist = topSong.artists?.primary?.[0]?.name || topSong.artists?.all?.[0]?.name || 'Artist';
            const album = topSong.album?.name || 'Single';
            const duration = topSong.duration || 0;
            const year = topSong.year || '';
            const artworkUrl = topSong.image?.find((i: any) => i.quality === '500x500')?.url || topSong.image?.[topSong.image.length - 1]?.url || '';
            const downloadObj = topSong.downloadUrl?.find((d: any) => d.quality === '320kbps') || topSong.downloadUrl?.[topSong.downloadUrl.length - 1];
            const dlUrl = downloadObj?.url || '';

            const durMin = Math.floor(duration / 60);
            const durSec = (duration % 60).toString().padStart(2, '0');

            let otherSongsList = '';
            if (results.length > 1) {
              otherSongsList = '\n\n*More matching results:*';
              results.slice(1, 4).forEach((s: any, idx: number) => {
                const sArtist = s.artists?.primary?.[0]?.name || s.artists?.all?.[0]?.name || 'Artist';
                const sDurMin = Math.floor((s.duration || 0) / 60);
                const sDurSec = ((s.duration || 0) % 60).toString().padStart(2, '0');
                otherSongsList += `\n${idx + 2}️⃣ **${s.name}** — ${sArtist} (${sDurMin}:${sDurSec})\n   👉 Send \`/song ${s.id}\` to play`;
              });
            }

            botContent = `🎵 **${title}**\n👤 **Artist**: ${artist}\n💿 **Album**: ${album}${year ? ` (${year})` : ''}\n⏱️ **Duration**: ${durMin}:${durSec} · ⚡ **Quality**: 320kbps HQ Audio${otherSongsList}`;
            mediaUrl = dlUrl;
            audioMeta = {
              songId: topSong.id,
              title,
              artist,
              album,
              duration,
              year,
              artworkUrl,
              downloadUrl: dlUrl,
              quality: '320kbps',
            };
          }
        } else {
          botContent = '🎵 Unable to search songs right now. Please try again in a moment!';
        }
      }
    }
  } catch (err) {
    console.error('Music API error:', err);
    botContent = '🎵 Something went wrong while searching for songs. Please try again!';
  }

  // Clear typing
  broadcast('typing', { chatId, typing: [] });

  const timeFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const botMsg: MessageObj = {
    id: `m_${Date.now()}_music`,
    chatId,
    senderId: 'u_system_music',
    content: botContent,
    timeFormatted,
    timestamp: Date.now(),
    status: 'read',
    mediaType: mediaUrl ? 'audio' : undefined,
    mediaUrl: mediaUrl || undefined,
    audioMeta: audioMeta || undefined,
  };

  db.messages.push(botMsg);
  saveDb();
  broadcast('message:new', { message: botMsg });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // SSE Endpoint for real-time synchronization
  app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const clientId = Math.random().toString(36).substring(7);
    sseClients.push({ id: clientId, res });

    // Send initial connection ack
    res.write(`event: connected\ndata: ${JSON.stringify({ clientId })}\n\n`);

    req.on('close', () => {
      sseClients = sseClients.filter((c) => c.id !== clientId);
    });
  });

  // Get full state
  app.get('/api/state', (req, res) => {
    ensureSystemUsers();
    res.json(db);
  });

  // Users endpoint (create or update)
  app.post('/api/users', (req, res) => {
    const userData: UserAccount = req.body;
    const existingIndex = db.users.findIndex((u) => u.id === userData.id);
    if (existingIndex >= 0) {
      db.users[existingIndex] = { ...db.users[existingIndex], ...userData };
    } else {
      db.users.push(userData);
    }
    ensureSystemUsers();
    saveDb();
    broadcast('user:update', { users: db.users });
    res.json({ success: true, users: db.users });
  });

  // Chats endpoint
  app.get('/api/chats', (req, res) => {
    res.json(db.chats);
  });

  app.post('/api/chats', (req, res) => {
    const chat: ChatObj = req.body;
    if (!db.chats.find((c) => c.id === chat.id)) {
      db.chats.unshift(chat);
      saveDb();
      broadcast('chat:new', { chat });
    }
    res.json({ success: true, chats: db.chats });
  });

  // Messages endpoints
  app.get('/api/messages', (req, res) => {
    const chatId = req.query.chatId as string;
    if (chatId) {
      res.json(db.messages.filter((m) => m.chatId === chatId));
    } else {
      res.json(db.messages);
    }
  });

  app.post('/api/messages', (req, res) => {
    const msg: MessageObj = req.body;
    db.messages.push(msg);
    saveDb();
    broadcast('message:new', { message: msg });
    res.json({ success: true, message: msg });

    // Check if message triggers system bot accounts
    const targetChat = db.chats.find((c) => c.id === msg.chatId);
    const isLunaChat = msg.chatId.includes('luna') || (targetChat && targetChat.participants.includes('u_system_luna'));
    const isMusicChat = msg.chatId.includes('music') || (targetChat && targetChat.participants.includes('u_system_music'));

    if (msg.senderId !== 'u_system_luna' && isLunaChat) {
      handleLunaResponse(msg).catch((err) => console.error('Luna bot error:', err));
    } else if (msg.senderId !== 'u_system_music' && isMusicChat) {
      handleMusicResponse(msg).catch((err) => console.error('Music bot error:', err));
    }
  });

  // Update message (edit, pin, reaction)
  app.put('/api/messages/:id', (req, res) => {
    const id = req.params.id;
    const updates = req.body;
    const msgIndex = db.messages.findIndex((m) => m.id === id);
    if (msgIndex >= 0) {
      db.messages[msgIndex] = { ...db.messages[msgIndex], ...updates };
      saveDb();
      broadcast('message:update', { message: db.messages[msgIndex] });
      res.json({ success: true, message: db.messages[msgIndex] });
    } else {
      res.status(404).json({ error: 'Message not found' });
    }
  });

  // Delete message
  app.delete('/api/messages/:id', (req, res) => {
    const id = req.params.id;
    db.messages = db.messages.filter((m) => m.id !== id);
    saveDb();
    broadcast('message:delete', { messageId: id });
    res.json({ success: true, messageId: id });
  });

  // Typing indicator
  app.post('/api/typing', (req, res) => {
    const { chatId, userId, userName, isTyping } = req.body;
    if (!db.typing[chatId]) {
      db.typing[chatId] = [];
    }
    if (isTyping) {
      if (!db.typing[chatId].find((t) => t.userId === userId)) {
        db.typing[chatId].push({ userId, userName, timestamp: Date.now() });
      }
    } else {
      db.typing[chatId] = db.typing[chatId].filter((t) => t.userId !== userId);
    }
    broadcast('typing', { chatId, typing: db.typing[chatId] });
    res.json({ success: true });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
