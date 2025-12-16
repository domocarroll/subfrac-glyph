import React from 'react';
import { Hexagon } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white text-neutral-950 flex items-center justify-center">
            <Hexagon size={16} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-mono text-sm font-medium tracking-tight text-white">
              SUBFRAC<span className="text-neutral-500">.</span>GLYPH
            </h1>
            <p className="text-[9px] font-mono text-neutral-600 uppercase tracking-[0.2em] leading-none">
              Mark Intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[10px] font-mono text-neutral-600">
          <span className="hidden sm:block uppercase tracking-wider">Subfracture Studio</span>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
            <span className="uppercase tracking-wider">Live</span>
          </div>
        </div>
      </div>
    </header>
  );
};
