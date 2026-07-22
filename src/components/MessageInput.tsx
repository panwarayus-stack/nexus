import React, { useState, useRef, useEffect, useCallback } from 'react';
import { User, Message } from '../types/chat';
import { MentionDropdown } from './MentionDropdown';
import { EmojiPicker } from './EmojiPicker';
import {
  Send,
  Smile,
  AtSign,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Quote,
  EyeOff,
  X,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string, mentions?: string[], replyToId?: string) => void;
  onTyping: () => void;
  availableUsers: User[];
  replyingToMessage: Message | null;
  onCancelReply: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTyping,
  availableUsers,
  replyingToMessage,
  onCancelReply,
  soundEnabled,
  onToggleSound,
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionIndex, setMentionIndex] = useState(0);
  const [textLength, setTextLength] = useState(0);

  const editorRef = useRef<HTMLDivElement>(null);

  // Update text length counter based on innerText
  const updateLength = () => {
    if (editorRef.current) {
      setTextLength(editorRef.current.innerText.length);
    }
  };

  const handleInput = () => {
    updateLength();
    onTyping();

    // Check for @ mention query
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const textBeforeCursor = range.startContainer.textContent?.slice(0, range.startOffset) || '';
      const lastAt = textBeforeCursor.lastIndexOf('@');
      if (lastAt !== -1) {
        const query = textBeforeCursor.slice(lastAt + 1);
        if (!/\s/.test(query)) {
          setMentionQuery(query);
          setShowMentions(true);
          setMentionIndex(0);
          return;
        }
      }
    }
    setShowMentions(false);
  };

  const handleSelectMentionUser = (user: User) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !editorRef.current) return;

    const range = selection.getRangeAt(0);
    const node = range.startContainer;
    if (node.nodeType === Node.TEXT_NODE && node.textContent) {
      const text = node.textContent;
      const atIdx = text.lastIndexOf('@');
      if (atIdx !== -1) {
        const beforeAt = text.slice(0, atIdx);
        const afterCursor = text.slice(range.startOffset);
        node.textContent = `${beforeAt}@${user.username} ${afterCursor}`;
        
        // Place cursor after mention
        const newRange = document.createRange();
        newRange.setStart(node, atIdx + user.username.length + 2);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    }

    setShowMentions(false);
    updateLength();
    editorRef.current.focus();
  };

  // Rich formatting applicator for contenteditable
  const applyRichFormat = useCallback(
    (tagOrType: 'b' | 'i' | 'u' | 's' | 'code' | 'spoiler' | 'quote') => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || !editorRef.current) return;

      const range = selection.getRangeAt(0);

      if (tagOrType === 'quote') {
        const quoteEl = document.createElement('blockquote');
        quoteEl.className = 'border-l-4 border-indigo-400 pl-3 py-1 my-1.5 bg-indigo-500/10 rounded-r-lg italic text-slate-200';
        if (!range.collapsed) {
          quoteEl.appendChild(range.extractContents());
        } else {
          quoteEl.textContent = 'Quote text';
        }
        range.insertNode(quoteEl);
        selection.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(quoteEl);
        selection.addRange(newRange);
      } else if (tagOrType === 'spoiler') {
        const span = document.createElement('span');
        span.className = 'tg-spoiler';
        if (!range.collapsed) {
          span.appendChild(range.extractContents());
        } else {
          span.textContent = 'spoiler text';
        }
        range.insertNode(span);
        selection.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        selection.addRange(newRange);
      } else {
        const tagMap: Record<string, string> = {
          b: 'b',
          i: 'i',
          u: 'u',
          s: 's',
          code: 'code',
        };
        const tagName = tagMap[tagOrType] || 'b';
        const el = document.createElement(tagName);
        if (tagName === 'code') {
          el.className = 'bg-slate-900/90 text-cyan-300 font-mono text-xs px-1.5 py-0.5 rounded border border-slate-700/70 inline-block';
        }

        if (!range.collapsed) {
          el.appendChild(range.extractContents());
        } else {
          el.textContent = `${tagOrType} text`;
        }
        range.insertNode(el);
        selection.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(el);
        selection.addRange(newRange);
      }

      updateLength();
      onTyping();
      editorRef.current.focus();
    },
    [onTyping]
  );

  const handleInsertEmoji = (emoji: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !editorRef.current) return;
    const range = selection.getRangeAt(0);
    range.deleteContents();
    const textNode = document.createTextNode(emoji);
    range.insertNode(textNode);
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    selection.removeAllRanges();
    selection.addRange(range);

    setShowEmojiPicker(false);
    updateLength();
    editorRef.current.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (showMentions && filteredMentionUsers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionIndex((prev) => (prev + 1) % filteredMentionUsers.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionIndex((prev) => (prev - 1 + filteredMentionUsers.length) % filteredMentionUsers.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        handleSelectMentionUser(filteredMentionUsers[mentionIndex]);
        return;
      }
      if (e.key === 'Escape') {
        setShowMentions(false);
        return;
      }
    }

    const isCmdOrCtrl = e.metaKey || e.ctrlKey;
    if (isCmdOrCtrl) {
      const key = e.key.toLowerCase();
      if (key === 'b') {
        e.preventDefault();
        applyRichFormat('b');
        return;
      }
      if (key === 'i') {
        e.preventDefault();
        applyRichFormat('i');
        return;
      }
      if (key === 'u') {
        e.preventDefault();
        applyRichFormat('u');
        return;
      }
      if (e.shiftKey && key === 'x') {
        e.preventDefault();
        applyRichFormat('s');
        return;
      }
      if (e.shiftKey && key === 'm') {
        e.preventDefault();
        applyRichFormat('code');
        return;
      }
      if (e.shiftKey && key === 'p') {
        e.preventDefault();
        applyRichFormat('spoiler');
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!editorRef.current) return;
    const htmlContent = editorRef.current.innerHTML.trim();
    const textContent = editorRef.current.innerText.trim();

    if (!textContent) return;

    // Extract @mentions
    const mentionMatches = textContent.match(/@[a-zA-Z0-9_]+/g);
    const mentions = mentionMatches ? mentionMatches.map((m) => m.slice(1)) : [];

    onSendMessage(htmlContent, mentions, replyingToMessage ? replyingToMessage.id : undefined);

    editorRef.current.innerHTML = '';
    setTextLength(0);
    setShowMentions(false);
    setShowEmojiPicker(false);
    if (replyingToMessage) {
      onCancelReply();
    }
  };

  const filteredMentionUsers = availableUsers.filter(
    (u) =>
      u.username.toLowerCase().includes(mentionQuery.toLowerCase()) ||
      u.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  return (
    <div className="p-3 sm:p-4 border-t border-slate-800 bg-[#111827] relative">
      {/* Replying Banner */}
      {replyingToMessage && (
        <div className="flex items-center justify-between bg-slate-800 border-l-4 border-indigo-500 rounded-lg p-2.5 mb-2.5 animate-in fade-in duration-150">
          <div className="min-w-0 flex-1 mr-2">
            <span className="text-[11px] font-bold text-indigo-400 block">
              Replying to message
            </span>
            <p className="text-xs text-slate-300 truncate">{replyingToMessage.content.replace(/<[^>]*>?/gm, '')}</p>
          </div>
          <button
            onClick={onCancelReply}
            className="p-1 hover:bg-slate-700 text-slate-400 hover:text-white rounded-md cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Mention Dropdown */}
      {showMentions && (
        <MentionDropdown
          users={filteredMentionUsers}
          selectedIndex={mentionIndex}
          onSelect={handleSelectMentionUser}
        />
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <EmojiPicker
          onSelectEmoji={handleInsertEmoji}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}

      {/* Formatting Toolbar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-0.5 sm:gap-1 flex-wrap">
          <button
            type="button"
            onClick={() => applyRichFormat('b')}
            title="Bold (Ctrl+B)"
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => applyRichFormat('i')}
            title="Italic (Ctrl+I)"
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => applyRichFormat('u')}
            title="Underline (Ctrl+U)"
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <Underline className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => applyRichFormat('s')}
            title="Strikethrough (Ctrl+Shift+X)"
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => applyRichFormat('code')}
            title="Monospace Code (Ctrl+Shift+M)"
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => applyRichFormat('spoiler')}
            title="Spoiler (Ctrl+Shift+P)"
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <EyeOff className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => applyRichFormat('quote')}
            title="Quote"
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              const selection = window.getSelection();
              if (editorRef.current && selection) {
                editorRef.current.focus();
                document.execCommand('insertText', false, '@');
                handleInput();
              }
            }}
            title="Mention (@user)"
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <AtSign className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            title="Emoji Keyboard"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              showEmojiPicker
                ? 'bg-indigo-600 text-white'
                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Smile className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 shrink-0">
          <button
            type="button"
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>
          <span
            className={`font-mono text-[11px] ${
              textLength > 900
                ? 'text-red-400 font-bold'
                : textLength > 800
                ? 'text-amber-400'
                : 'text-slate-500'
            }`}
          >
            {textLength}/1000
          </span>
        </div>
      </div>

      {/* Rich Text ContentEditable Editor */}
      <div className="flex items-end gap-2 bg-slate-800/90 border border-slate-700/80 p-2.5 rounded-2xl shadow-inner focus-within:border-indigo-500/80 transition-all">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          data-placeholder="Type a message, @mention, #hashtag, or formatted text..."
          className="flex-1 bg-transparent border-none text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-0 max-h-40 overflow-y-auto py-1 px-1 scrollbar-thin whitespace-pre-wrap break-words"
        />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={textLength === 0}
          title="Send message (Enter)"
          className={`min-w-[44px] min-h-[44px] h-11 w-11 rounded-xl flex items-center justify-center text-white shadow-lg transition-all active:scale-95 flex-shrink-0 ${
            textLength > 0
              ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/25 cursor-pointer'
              : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
