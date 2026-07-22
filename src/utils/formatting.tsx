import React, { useState } from 'react';

interface SpoilerTextProps {
  children: React.ReactNode;
}

/**
 * Telegram-style spoiler component for legacy text.
 */
export const SpoilerText: React.FC<SpoilerTextProps> = ({ children }) => {
  const [revealed, setRevealed] = useState(false);

  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        setRevealed(!revealed);
      }}
      title={revealed ? 'Click to hide spoiler' : 'Click to reveal spoiler'}
      className={`inline-block px-1 py-0.5 rounded cursor-pointer transition-all duration-200 select-none ${
        revealed
          ? 'bg-slate-800/90 text-slate-100 border border-slate-700/60'
          : 'bg-slate-700/90 text-transparent blur-[4px] hover:blur-[2px] border border-slate-600/50'
      }`}
    >
      {children}
    </span>
  );
};

interface TokenMatch {
  type: 'code' | 'spoiler' | 'bold' | 'underline' | 'strikethrough' | 'italic' | 'mention' | 'hashtag' | 'url';
  raw: string;
  inner?: string;
  index: number;
  length: number;
}

function findEarliestToken(text: string): TokenMatch | null {
  const matches: TokenMatch[] = [];

  const codeRegex = /`([^`]+)`/g;
  let m = codeRegex.exec(text);
  if (m) {
    matches.push({ type: 'code', raw: m[0], inner: m[1], index: m.index, length: m[0].length });
  }

  const spoilerRegex = /\|\|((?:(?!\|\|).)+)\|\|/g;
  m = spoilerRegex.exec(text);
  if (m) {
    matches.push({ type: 'spoiler', raw: m[0], inner: m[1], index: m.index, length: m[0].length });
  }

  const boldRegex = /\*\*([^*]+)\*\*/g;
  m = boldRegex.exec(text);
  if (m) {
    matches.push({ type: 'bold', raw: m[0], inner: m[1], index: m.index, length: m[0].length });
  }

  const underlineRegex = /__([^_]+)__/g;
  m = underlineRegex.exec(text);
  if (m) {
    matches.push({ type: 'underline', raw: m[0], inner: m[1], index: m.index, length: m[0].length });
  }

  const strikeRegex = /~~([^~]+)~~/g;
  m = strikeRegex.exec(text);
  if (m) {
    matches.push({ type: 'strikethrough', raw: m[0], inner: m[1], index: m.index, length: m[0].length });
  }

  const italicStarRegex = /\*([^*]+)\*/g;
  m = italicStarRegex.exec(text);
  if (m) {
    matches.push({ type: 'italic', raw: m[0], inner: m[1], index: m.index, length: m[0].length });
  }

  const italicUnderRegex = /_([^_]+)_/g;
  m = italicUnderRegex.exec(text);
  if (m) {
    matches.push({ type: 'italic', raw: m[0], inner: m[1], index: m.index, length: m[0].length });
  }

  const mentionRegex = /@[a-zA-Z0-9_]{1,30}/g;
  m = mentionRegex.exec(text);
  if (m) {
    matches.push({ type: 'mention', raw: m[0], index: m.index, length: m[0].length });
  }

  const hashtagRegex = /#[a-zA-Z0-9_\u00C0-\u024F]{1,50}/g;
  m = hashtagRegex.exec(text);
  if (m) {
    matches.push({ type: 'hashtag', raw: m[0], index: m.index, length: m[0].length });
  }

  const urlRegex = /(?:https?:\/\/|www\.)[^\s<]+/g;
  m = urlRegex.exec(text);
  if (m) {
    matches.push({ type: 'url', raw: m[0], index: m.index, length: m[0].length });
  }

  if (matches.length === 0) return null;

  matches.sort((a, b) => a.index - b.index);
  return matches[0];
}

function parseInlineFormattedText(
  text: string,
  isOwn = false,
  keyPrefix = 'inline'
): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining.length > 0) {
    const token = findEarliestToken(remaining);
    if (!token) {
      nodes.push(remaining);
      break;
    }

    if (token.index > 0) {
      nodes.push(remaining.substring(0, token.index));
    }

    const currentKey = `${keyPrefix}_${keyIdx++}`;

    switch (token.type) {
      case 'code':
        nodes.push(
          <code
            key={currentKey}
            className="bg-slate-900/90 text-cyan-300 font-mono text-xs px-1.5 py-0.5 rounded border border-slate-700/70 inline-block my-0.5"
          >
            {token.inner}
          </code>
        );
        break;

      case 'spoiler':
        nodes.push(
          <SpoilerText key={currentKey}>
            {parseInlineFormattedText(token.inner || '', isOwn, `${currentKey}_sp`)}
          </SpoilerText>
        );
        break;

      case 'bold':
        nodes.push(
          <strong key={currentKey} className="font-bold text-white">
            {parseInlineFormattedText(token.inner || '', isOwn, `${currentKey}_b`)}
          </strong>
        );
        break;

      case 'underline':
        nodes.push(
          <u key={currentKey} className="underline decoration-indigo-300/80 decoration-2">
            {parseInlineFormattedText(token.inner || '', isOwn, `${currentKey}_u`)}
          </u>
        );
        break;

      case 'strikethrough':
        nodes.push(
          <s key={currentKey} className="line-through opacity-80">
            {parseInlineFormattedText(token.inner || '', isOwn, `${currentKey}_s`)}
          </s>
        );
        break;

      case 'italic':
        nodes.push(
          <em key={currentKey} className="italic text-slate-100">
            {parseInlineFormattedText(token.inner || '', isOwn, `${currentKey}_i`)}
          </em>
        );
        break;

      case 'mention':
        nodes.push(
          <span
            key={currentKey}
            className={`font-semibold px-1 py-0.5 rounded text-xs inline-block transition-colors cursor-pointer ${
              isOwn
                ? 'bg-indigo-700/90 text-white underline decoration-indigo-300/50 hover:bg-indigo-600'
                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-500/30'
            }`}
          >
            {token.raw}
          </span>
        );
        break;

      case 'hashtag':
        nodes.push(
          <span
            key={currentKey}
            className="font-medium text-cyan-400 hover:underline cursor-pointer px-1 py-0.5 rounded bg-cyan-950/30 border border-cyan-800/40 text-xs inline-block"
          >
            {token.raw}
          </span>
        );
        break;

      case 'url': {
        const href = token.raw.startsWith('www.') ? `https://${token.raw}` : token.raw;
        nodes.push(
          <a
            key={currentKey}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-cyan-300 hover:text-cyan-200 underline font-medium break-all"
          >
            {token.raw}
          </a>
        );
        break;
      }
    }

    remaining = remaining.substring(token.index + token.length);
  }

  return nodes;
}

function LegacyFormattedMessageText({ text, isOwn = false }: { text: string; isOwn?: boolean }) {
  if (!text) return null;

  const codeBlockRegex = /```(?:[a-zA-Z0-9_-]+)?\n?([\s\S]*?)```/g;
  const blocks: React.ReactNode[] = [];
  let lastIdx = 0;
  let match: RegExpExecArray | null;
  let blockKey = 0;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      const normalChunk = text.substring(lastIdx, match.index);
      blocks.push(...renderParagraphsAndQuotes(normalChunk, isOwn, `blk_${blockKey++}`));
    }

    const codeContent = match[1];
    blocks.push(
      <pre
        key={`codeblock_${blockKey++}`}
        className="bg-slate-900/90 text-cyan-300 font-mono text-xs p-3 rounded-xl border border-slate-700/80 my-2 overflow-x-auto whitespace-pre leading-relaxed shadow-inner"
      >
        <code>{codeContent}</code>
      </pre>
    );

    lastIdx = codeBlockRegex.lastIndex;
  }

  if (lastIdx < text.length) {
    const remainingChunk = text.substring(lastIdx);
    blocks.push(...renderParagraphsAndQuotes(remainingChunk, isOwn, `blk_${blockKey++}`));
  }

  return <div className="space-y-1">{blocks}</div>;
}

function renderParagraphsAndQuotes(
  text: string,
  isOwn: boolean,
  keyPrefix: string
): React.ReactNode[] {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentQuoteLines: string[] = [];
  let elemKey = 0;

  const flushQuote = () => {
    if (currentQuoteLines.length > 0) {
      const quoteText = currentQuoteLines.join('\n');
      elements.push(
        <blockquote
          key={`${keyPrefix}_q_${elemKey++}`}
          className="border-l-4 border-indigo-400 pl-3 py-1 my-1.5 bg-indigo-500/10 rounded-r-lg italic text-slate-200 leading-relaxed"
        >
          {parseInlineFormattedText(quoteText, isOwn, `${keyPrefix}_q_in`)}
        </blockquote>
      );
      currentQuoteLines = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('>') || line.startsWith('&gt;')) {
      const cleanLine = line.replace(/^(?:>|&gt;)\s?/, '');
      currentQuoteLines.push(cleanLine);
    } else {
      flushQuote();
      if (line.trim().length === 0 && i < lines.length - 1) {
        elements.push(<div key={`${keyPrefix}_sp_${elemKey++}`} className="h-2" />);
      } else {
        elements.push(
          <div key={`${keyPrefix}_p_${elemKey++}`} className="whitespace-pre-wrap break-words">
            {parseInlineFormattedText(line, isOwn, `${keyPrefix}_p_in_${elemKey}`)}
          </div>
        );
      }
    }
  }

  flushQuote();

  return elements;
}

/**
 * Main FormattedMessageText component.
 * Renders HTML rich text from Telegram composer (with interactive spoiler reveal) or falls back to legacy markdown.
 */
export function FormattedMessageText({ text, isOwn = false }: { text: string; isOwn?: boolean }) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = (e.target as HTMLElement).closest('.tg-spoiler');
    if (target) {
      target.classList.toggle('revealed');
    }
  };

  const isHtml = /<\/?[a-z][\s\S]*>/i.test(text);

  if (isHtml) {
    return (
      <div
        ref={containerRef}
        onClick={handleClick}
        className="space-y-1 break-words prose prose-invert max-w-none text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: text }}
      />
    );
  }

  return (
    <div ref={containerRef} onClick={handleClick}>
      <LegacyFormattedMessageText text={text} isOwn={isOwn} />
    </div>
  );
}
