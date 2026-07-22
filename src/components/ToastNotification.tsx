import React, { useEffect } from 'react';
import { AtSign, Bell, X } from 'lucide-react';

export interface ToastItem {
  id: string;
  title: string;
  body: string;
  isMention?: boolean;
}

interface ToastNotificationProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  toasts,
  onDismiss,
}) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start gap-3 p-3.5 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-md text-slate-100 animate-in fade-in slide-in-from-top-4 duration-200"
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold shadow-md ${
              toast.isMention ? 'bg-indigo-600' : 'bg-slate-700'
            }`}
          >
            {toast.isMention ? (
              <AtSign className="w-5 h-5 text-indigo-200" />
            ) : (
              <Bell className="w-5 h-5 text-slate-300" />
            )}
          </div>

          <div className="flex-1 min-w-0 pr-1">
            <h4 className="text-xs font-bold text-slate-100 truncate flex items-center gap-1.5">
              <span>{toast.title}</span>
              {toast.isMention && (
                <span className="text-[9px] bg-indigo-500/30 text-indigo-300 font-semibold px-1.5 py-0.2 rounded">
                  Mentioned You
                </span>
              )}
            </h4>
            <p className="text-xs text-slate-300 truncate mt-0.5">{toast.body}</p>
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
