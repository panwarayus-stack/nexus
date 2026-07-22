import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Message, User, TypingStatus } from '../types/chat';
import { MessageBubble } from './MessageBubble';
import { MessageSquare, ArrowDown } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  usersMap: Record<string, User>;
  typingStatuses: TypingStatus[];
  activeChatId: string;
  onReact: (messageId: string, emoji: string) => void;
  onCopy: (content: string) => void;
  onDelete?: (messageId: string) => void;
  onReply?: (message: Message) => void;
  onEdit?: (messageId: string, newContent: string) => void;
  onReport?: (messageId: string) => void;
  onPin?: (messageId: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  usersMap,
  typingStatuses,
  activeChatId,
  onReact,
  onCopy,
  onDelete,
  onReply,
  onEdit,
  onReport,
  onPin,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const prevMessagesCountRef = useRef(messages.length);
  const prevChatIdRef = useRef(activeChatId);

  // Check scroll position
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 120;

    setShowScrollBottom(!isNearBottom);
    if (isNearBottom) {
      setUnreadCount(0);
    }
  }, []);

  const scrollToBottom = useCallback((smooth = true) => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
    setShowScrollBottom(false);
    setUnreadCount(0);
  }, []);

  // Handle active chat switch or incoming new messages
  useEffect(() => {
    const isChatChanged = prevChatIdRef.current !== activeChatId;
    const isNewMessageAdded = messages.length > prevMessagesCountRef.current;

    prevChatIdRef.current = activeChatId;
    prevMessagesCountRef.current = messages.length;

    if (isChatChanged) {
      // Switched chat: immediately scroll to bottom
      scrollToBottom(false);
      return;
    }

    if (isNewMessageAdded) {
      scrollToBottom(true);
    }
  }, [messages, activeChatId, currentUserId, scrollToBottom]);

  const activeTyping = typingStatuses.filter(
    (t) => t.chatId === activeChatId && t.userId !== currentUserId
  );

  return (
    <div className="relative flex-1 flex flex-col min-h-0 bg-[#0f172a]">
      {/* Scrollable Message Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 scrollbar-thin"
      >
        {/* Empty State */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 text-slate-400 my-auto">
            <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mb-4 text-indigo-400 shadow-xl">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-200 mb-1">No messages yet</h3>
            <p className="text-xs text-slate-400 max-w-xs">
              Start the conversation! Type a message below or mention team members with <code className="text-indigo-400">@</code>.
            </p>
          </div>
        )}

        {/* Date Divider */}
        {messages.length > 0 && (
          <div className="flex justify-center my-2">
            <span className="px-3.5 py-1 bg-slate-800/80 border border-slate-700/50 rounded-full text-[10px] text-slate-400 uppercase tracking-widest font-bold shadow-sm backdrop-blur-md">
              Today
            </span>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg) => {
          const isOwn = msg.senderId === currentUserId;
          const sender = usersMap[msg.senderId];
          return (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={isOwn}
              sender={sender}
              onReact={onReact}
              onCopy={onCopy}
              onDelete={onDelete}
              onReply={onReply}
              onEdit={onEdit}
              onReport={onReport}
              onPin={onPin}
            />
          );
        })}

        {/* Typing Indicator */}
        {activeTyping.length > 0 && (
          <div className="flex items-center gap-3 px-3 py-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700/70 px-3.5 py-2 rounded-2xl rounded-bl-none shadow-lg">
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
            </div>
            <span className="text-xs text-slate-400 italic">
              {activeTyping.map((t) => t.username).join(', ')}{' '}
              {activeTyping.length > 1 ? 'are' : 'is'} typing...
            </span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Floating Scroll to Bottom Down Arrow Button */}
      {showScrollBottom && (
        <button
          onClick={() => scrollToBottom(true)}
          title="Scroll to bottom"
          className="absolute bottom-5 right-6 z-30 w-11 h-11 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xl border border-indigo-400/40 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer animate-in fade-in zoom-in-90"
        >
          <ArrowDown className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-cyan-400 text-slate-950 font-extrabold text-[10px] rounded-full flex items-center justify-center shadow-md animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
};
