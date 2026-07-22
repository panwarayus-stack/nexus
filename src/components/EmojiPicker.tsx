import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface EmojiPickerProps {
  onSelectEmoji: (emoji: string) => void;
  onClose: () => void;
}

const EMOJI_CATEGORIES = [
  {
    name: 'Popular',
    emojis: ['👍', '❤️', '😂', '🔥', '🚀', '🎉', '😊', '🙌', '💯', '✨', '😍', '👀'],
  },
  {
    name: 'Smileys',
    emojis: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😋', '😛', '😜', '🤪', '🧐', '🤓', '😎', '🤩', '🥳'],
  },
  {
    name: 'Gestures',
    emojis: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜'],
  },
  {
    name: 'Objects & Symbols',
    emojis: ['💻', '📱', '⚡', '🔥', '✨', '🎯', '💡', '💬', '📢', '🔔', '🚀', '🛠️', '⚙️', '📌', '🎉', '🏆', '💎', '🎨', '📚', '☕', '🍕', '❤️', '💙', '💜', '✅'],
  },
];

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelectEmoji, onClose }) => {
  const [search, setSearch] = useState('');

  const allEmojis = EMOJI_CATEGORIES.flatMap((c) => c.emojis);
  const filteredEmojis = search
    ? Array.from(new Set(allEmojis)) // search filter could be added
    : null;

  return (
    <div className="absolute bottom-full left-2 mb-2 w-72 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-700">
        <span className="text-xs font-bold text-slate-300">Emoji Picker</span>
        <button
          onClick={onClose}
          className="text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-700/50"
        >
          Close
        </button>
      </div>

      <div className="relative mb-2">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search emojis..."
          className="w-full bg-slate-900 border border-slate-700 rounded-lg py-1.5 pl-8 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div className="max-h-56 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
        {filteredEmojis ? (
          <div className="grid grid-cols-7 gap-1">
            {filteredEmojis.map((emoji, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSelectEmoji(emoji)}
                className="w-8 h-8 flex items-center justify-center text-lg hover:bg-slate-700/60 rounded-lg transition-transform active:scale-125"
              >
                {emoji}
              </button>
            ))}
          </div>
        ) : (
          EMOJI_CATEGORIES.map((cat) => (
            <div key={cat.name}>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                {cat.name}
              </h4>
              <div className="grid grid-cols-7 gap-1">
                {cat.emojis.map((emoji, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onSelectEmoji(emoji)}
                    className="w-8 h-8 flex items-center justify-center text-lg hover:bg-slate-700/60 rounded-lg transition-transform active:scale-125"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
