import React, { useState } from 'react';
import { Message, User } from '../types/chat';
import { Check, CheckCheck, Smile, Copy, Reply, Trash2, Edit2, Flag, Pin } from 'lucide-react';
import { FormattedMessageText } from '../utils/formatting';
import { motion } from 'motion/react';
import { VerifiedBadge } from './VerifiedBadge';
import { MusicAudioPlayer } from './MusicAudioPlayer';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  sender?: User;
  onReact: (messageId: string, emoji: string) => void;
  onCopy: (content: string) => void;
  onDelete?: (messageId: string) => void;
  onReply?: (message: Message) => void;
  onEdit?: (messageId: string, newContent: string) => void;
  onReport?: (messageId: string) => void;
  onPin?: (messageId: string) => void;
}

const POPULAR_REACTIONS = ['👍', '❤️', '😂', '🔥', '🚀', '😮'];

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  sender,
  onReact,
  onCopy,
  onDelete,
  onReply,
  onEdit,
  onReport,
  onPin,
}) => {
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  return (
    <div
      className={`group relative flex items-end gap-2.5 max-w-[85%] sm:max-w-[75%] ${
        isOwn ? 'self-end flex-row-reverse' : 'self-start flex-row'
      } animate-in fade-in slide-in-from-bottom-2 duration-200`}
    >
      {/* Sender Avatar (for received messages in group/direct) */}
      {!isOwn && (
        <div className="relative">
          <div
            className={`w-8 h-8 rounded-full ${
              sender?.avatarBg || 'bg-slate-700'
            } flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white shadow-md border border-slate-700/50 cursor-pointer overflow-hidden`}
          >
            {sender?.avatarUrl ? (
              <img src={sender.avatarUrl} alt={sender.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              sender?.avatarText || sender?.name.slice(0, 2).toUpperCase() || 'U'
            )}
          </div>
          {sender?.status === 'online' && (
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-slate-900" />
          )}
        </div>
      )}

      <div className="flex flex-col min-w-0">
        {/* Sender Name in group */}
        {!isOwn && sender && (
          <span className="text-[11px] font-medium text-slate-400 mb-1 ml-1 flex items-center gap-1.5">
            <span>{sender.name}</span>
            {(sender.isVerified || sender.isSystem || sender.username === 'luna' || sender.username === 'music') && (
              <VerifiedBadge size="sm" />
            )}
            <span className="text-[10px] text-indigo-400">@{sender.username}</span>
          </span>
        )}

        {/* Message Bubble Card */}
        <div
          className={`relative p-3.5 sm:p-4 rounded-2xl shadow-xl border text-sm leading-relaxed transition-all ${
            isOwn
              ? 'bg-indigo-600 text-white rounded-br-none border-indigo-500/50'
              : 'bg-slate-800 text-slate-200 rounded-bl-none border-slate-700/60'
          }`}
        >
          {message.pinned && (
            <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-amber-400 mb-1.5 opacity-90">
              <Pin className="w-3 h-3" /> Pinned
            </div>
          )}
          {/* Main Content */}
          <div>
            <FormattedMessageText text={message.content} isOwn={isOwn} />
          </div>

          {/* Music Audio Player if present */}
          {(message.mediaType === 'audio' || message.audioMeta || message.mediaUrl) && (message.mediaUrl || message.audioMeta?.downloadUrl) && (
            <MusicAudioPlayer
              audioUrl={message.audioMeta?.downloadUrl || message.mediaUrl || ''}
              meta={message.audioMeta}
              isOwn={isOwn}
            />
          )}

          {/* Timestamp & Status */}
          <div className="flex items-center justify-end gap-1.5 mt-2 text-[10px] font-medium opacity-80">
            {message.isEdited && (
              <span className={isOwn ? 'text-indigo-200/70' : 'text-slate-400/70'}>
                edited
              </span>
            )}
            <span className={isOwn ? 'text-indigo-200' : 'text-slate-400'}>
              {message.timeFormatted}
            </span>
            {isOwn && (
              <span className="text-indigo-200 flex items-center">
                {message.status === 'read' ? (
                  <motion.span
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="inline-flex items-center"
                  >
                    <CheckCheck className="w-3.5 h-3.5 text-cyan-300" />
                  </motion.span>
                ) : message.status === 'delivered' ? (
                  <CheckCheck className="w-3.5 h-3.5 text-indigo-200" />
                ) : (
                  <Check className="w-3.5 h-3.5 text-indigo-200" />
                )}
              </span>
            )}
          </div>

          {/* Quick Action Toolbar (appears on hover / focus) */}
          <div
            className={`absolute top-2 ${
              isOwn ? '-left-[144px]' : '-right-[144px]'
            } hidden group-hover:flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg p-1 shadow-2xl z-20`}
          >
            <button
              onClick={() => setShowReactionPicker(!showReactionPicker)}
              title="Add Reaction"
              className="p-1 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition-colors"
            >
              <Smile className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onCopy(message.content)}
              title="Copy Message"
              className="p-1 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            {onReply && (
              <button
                onClick={() => onReply(message)}
                title="Reply"
                className="p-1 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition-colors"
              >
                <Reply className="w-3.5 h-3.5" />
              </button>
            )}
            {isOwn && onEdit && (
              <button
                onClick={() => onEdit(message.id, message.content)}
                title="Edit Message"
                className="p-1 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 rounded transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
            {isOwn && onDelete && (
              <button
                onClick={() => onDelete(message.id)}
                title="Delete Message"
                className="p-1 hover:bg-red-900/50 text-red-400 hover:text-red-300 rounded transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            {onPin && (
              <button
                onClick={() => onPin(message.id)}
                title={message.pinned ? "Unpin Message" : "Pin Message"}
                className="p-1 hover:bg-slate-800 text-amber-400 hover:text-amber-300 rounded transition-colors"
              >
                <Pin className="w-3.5 h-3.5" />
              </button>
            )}
            {!isOwn && onReport && (
              <button
                onClick={() => onReport(message.id)}
                title="Report Message"
                className="p-1 hover:bg-orange-900/50 text-orange-400 hover:text-orange-300 rounded transition-colors"
              >
                <Flag className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Reaction Popover */}
          {showReactionPicker && (
            <div
              className={`absolute bottom-full ${
                isOwn ? 'right-0' : 'left-0'
              } mb-2 bg-slate-900 border border-slate-700 rounded-full px-2 py-1 shadow-2xl flex items-center gap-1 z-30 animate-in fade-in zoom-in-95 duration-100`}
            >
              {POPULAR_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onReact(message.id, emoji);
                    setShowReactionPicker(false);
                  }}
                  className="w-7 h-7 flex items-center justify-center text-sm hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reaction Badges below bubble */}
        {message.reactions && message.reactions.length > 0 && (
          <div
            className={`flex flex-wrap gap-1 mt-1.5 ${
              isOwn ? 'justify-end mr-1' : 'justify-start ml-1'
            }`}
          >
            {message.reactions.map((r, i) => (
              <button
                key={i}
                onClick={() => onReact(message.id, r.emoji)}
                className="flex items-center gap-1 px-2 py-0.5 bg-slate-800 border border-slate-700 rounded-full text-xs text-slate-300 hover:border-indigo-500 hover:text-white transition-all shadow-sm active:scale-95"
              >
                <span>{r.emoji}</span>
                <span className="text-[10px] font-bold text-slate-400">{r.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Own Avatar (for own messages) */}
      {isOwn && (
        <div
          className={`w-8 h-8 rounded-full bg-indigo-600 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white shadow-md border border-indigo-500/50`}
        >
          {sender?.avatarText || 'ME'}
        </div>
      )}
    </div>
  );
};
