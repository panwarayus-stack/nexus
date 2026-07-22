import React, { useState, useRef } from 'react';
import { Play, Pause, Download, Music as MusicIcon, Volume2 } from 'lucide-react';

interface MusicAudioPlayerProps {
  audioUrl: string;
  meta?: {
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
  isOwn?: boolean;
}

export const MusicAudioPlayer: React.FC<MusicAudioPlayerProps> = ({ audioUrl, meta, isOwn = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(meta?.duration || 0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch((e) => console.error('Audio play error', e));
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const downloadLink = meta?.downloadUrl || audioUrl;

  return (
    <div className="mt-3 p-3 bg-slate-900/90 border border-slate-700/80 rounded-xl shadow-lg max-w-sm w-full text-slate-100">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        onLoadedMetadata={handleTimeUpdate}
      />

      <div className="flex items-start gap-3">
        {/* Album Artwork */}
        <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 shrink-0 shadow-md flex items-center justify-center">
          {meta?.artworkUrl ? (
            <img
              src={meta.artworkUrl}
              alt={meta.title || 'Album Art'}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <MusicIcon className="w-6 h-6 text-cyan-400" />
          )}
          {isPlaying && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
              <div className="flex items-end gap-0.5 h-4">
                <span className="w-1 bg-cyan-400 animate-pulse h-full rounded-full" />
                <span className="w-1 bg-cyan-400 animate-pulse h-2/3 rounded-full" />
                <span className="w-1 bg-cyan-400 animate-pulse h-4/5 rounded-full" />
              </div>
            </div>
          )}
        </div>

        {/* Title & Info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold truncate text-white">{meta?.title || 'Song Track'}</h4>
          <p className="text-xs text-cyan-300 font-medium truncate">{meta?.artist || 'Unknown Artist'}</p>
          <p className="text-[10px] text-slate-400 truncate mt-0.5">
            {meta?.album || 'Album'}{meta?.year ? ` (${meta.year})` : ''}
          </p>
        </div>

        {/* Quality Badge */}
        <span className="text-[9px] font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
          320kbps
        </span>
      </div>

      {/* Progress Slider */}
      <div className="mt-3 space-y-1">
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
        />
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Player Controls */}
      <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-800/80">
        <button
          onClick={togglePlay}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-white" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
              <span>Play</span>
            </>
          )}
        </button>

        {downloadLink && (
          <a
            href={downloadLink}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-cyan-200 text-xs font-medium border border-slate-700 transition-all cursor-pointer"
            title="Download 320kbps Audio"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="text-[11px]">Download</span>
          </a>
        )}
      </div>
    </div>
  );
};
