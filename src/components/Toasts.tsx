import React from 'react';
import { useAkra } from '../context/AkraContext';
import { Heart, Camera, Mail, Film, Info, X } from 'lucide-react';

export const Toasts: React.FC = () => {
  const { toasts, removeToast } = useAkra();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-16 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let Icon = Heart;
        let iconColor = 'text-[#6D4C41] bg-[#FAF7F2] border border-[#E8D5C4]';
        if (toast.type === 'photo') {
          Icon = Camera;
          iconColor = 'text-[#6D4C41] bg-[#FAF7F2] border border-[#E8D5C4]';
        } else if (toast.type === 'letter') {
          Icon = Mail;
          iconColor = 'text-[#6D4C41] bg-[#FAF7F2] border border-[#E8D5C4]';
        } else if (toast.type === 'movie') {
          Icon = Film;
          iconColor = 'text-[#6D4C41] bg-[#FAF7F2] border border-[#E8D5C4]';
        } else if (toast.type === 'info') {
          Icon = Info;
          iconColor = 'text-[#6D4C41] bg-[#FAF7F2] border border-[#E8D5C4]';
        }

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 rounded-[24px] bg-white p-3.5 shadow-xl border border-[#E8D5C4] transition-all animate-in slide-in-from-top-2"
          >
            <div className={`p-2 rounded-xl shrink-0 ${iconColor}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-serif font-bold text-[#3E2723]">{toast.title}</p>
              <p className="text-xs text-[#5D4037] mt-0.5 line-clamp-2">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-full text-[#8D6E63] hover:bg-[#FAF7F2]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
