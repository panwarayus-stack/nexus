import React, { useState } from 'react';
import { Message } from '../types/chat';
import { X, Image, FileText, Music, Link as LinkIcon, Download, Eye } from 'lucide-react';

interface SharedMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  chatName: string;
}

export const SharedMediaModal: React.FC<SharedMediaModalProps> = ({
  isOpen,
  onClose,
  messages,
  chatName,
}) => {
  const [mediaTab, setMediaTab] = useState<'photos' | 'files' | 'audio' | 'links'>('photos');

  if (!isOpen) return null;

  // Filter messages by media type or content patterns
  const photoMessages = messages.filter((m) => m.mediaType === 'photo' || m.mediaUrl);
  const fileMessages = messages.filter((m) => m.mediaType === 'file');
  const audioMessages = messages.filter((m) => m.mediaType === 'audio' || m.mediaType === 'voice');
  const linkMessages = messages.filter((m) => /(https?:\/\/|www\.)[^\s<]+/g.test(m.content));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div>
            <h3 className="text-base font-bold text-slate-100">Shared Media</h3>
            <p className="text-xs text-slate-400">{chatName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media Tabs */}
        <div className="flex border-b border-slate-800 px-4 py-2 gap-2 bg-slate-900/30">
          <button
            onClick={() => setMediaTab('photos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              mediaTab === 'photos'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Image className="w-4 h-4" />
            <span>Photos ({photoMessages.length})</span>
          </button>
          <button
            onClick={() => setMediaTab('files')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              mediaTab === 'files'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Files ({fileMessages.length})</span>
          </button>
          <button
            onClick={() => setMediaTab('audio')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              mediaTab === 'audio'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>Voice & Audio ({audioMessages.length})</span>
          </button>
          <button
            onClick={() => setMediaTab('links')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              mediaTab === 'links'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            <span>Links ({linkMessages.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {mediaTab === 'photos' && (
            <div>
              {photoMessages.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {photoMessages.map((m) => (
                    <div
                      key={m.id}
                      className="group relative aspect-square bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex items-center justify-center"
                    >
                      <div className="text-xs text-slate-500 font-mono text-center p-2">
                        {m.mediaName || 'Photo Preview'}
                      </div>
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <span className="text-xs text-white font-medium">{m.timeFormatted}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-slate-500">
                  <Image className="w-12 h-12 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-medium">No shared photos in this chat</p>
                </div>
              )}
            </div>
          )}

          {mediaTab === 'files' && (
            <div className="space-y-2">
              {fileMessages.length > 0 ? (
                fileMessages.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-sm font-semibold text-slate-100">{m.mediaName || 'Document.pdf'}</h5>
                        <span className="text-xs text-slate-500">{m.timeFormatted}</span>
                      </div>
                    </div>
                    <button className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 text-slate-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-medium">No shared files in this chat</p>
                </div>
              )}
            </div>
          )}

          {mediaTab === 'audio' && (
            <div className="space-y-2">
              {audioMessages.length > 0 ? (
                audioMessages.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-xl">
                        <Music className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-sm font-semibold text-slate-100">Voice Note / Audio</h5>
                        <span className="text-xs text-slate-500">{m.timeFormatted}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 text-slate-500">
                  <Music className="w-12 h-12 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-medium">No voice messages or audio found</p>
                </div>
              )}
            </div>
          )}

          {mediaTab === 'links' && (
            <div className="space-y-2">
              {linkMessages.length > 0 ? (
                linkMessages.map((m) => (
                  <div key={m.id} className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl">
                    <p className="text-sm text-cyan-300 font-medium break-all">{m.content}</p>
                    <span className="text-xs text-slate-500 block mt-1">{m.timeFormatted}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 text-slate-500">
                  <LinkIcon className="w-12 h-12 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-medium">No shared links found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
