import React, { useState } from 'react';
import { X, Megaphone } from 'lucide-react';

interface AnnouncementBarProps {
  text: string;
  color: string; // blue | cyan | green | amber | red | purple
}

const COLOR_MAP: Record<string, string> = {
  blue: 'bg-blue-600 text-white',
  cyan: 'bg-cyan-500 text-white',
  green: 'bg-emerald-500 text-white',
  amber: 'bg-amber-500 text-slate-900',
  red: 'bg-red-600 text-white',
  purple: 'bg-purple-600 text-white',
};

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ text, color }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !text) return null;

  const colorCls = COLOR_MAP[color] || COLOR_MAP.blue;

  return (
    <div className={`relative z-[60] w-full py-2.5 px-4 flex items-center justify-center gap-3 text-xs font-bold text-center ${colorCls}`}>
      <Megaphone className="w-3.5 h-3.5 shrink-0 opacity-80" />
      <span>{text}</span>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-black/15 transition cursor-pointer border-none bg-transparent"
        aria-label="Dismiss announcement"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
