import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <img
            src="/subfracture-logo.png"
            alt="Subfracture"
            className="h-5 w-auto opacity-90"
          />
          <div className="h-4 w-px bg-neutral-800"></div>
          <div>
            <h1 className="font-mono text-sm font-medium tracking-tight text-white">
              SUBFRAC<span className="text-neutral-500">.</span>GLYPH
            </h1>
            <p className="text-[9px] font-mono text-neutral-600 uppercase tracking-[0.2em] leading-none">
              D.A.N.N.I.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-600">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
          <span className="uppercase tracking-wider">Live</span>
        </div>
      </div>
    </header>
  );
};
