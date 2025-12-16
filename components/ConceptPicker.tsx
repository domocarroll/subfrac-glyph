import React from 'react';
import { ConceptDraft, StyleDirection } from '../types';
import { Loader2, ArrowUpRight, AlertCircle } from 'lucide-react';

interface ConceptPickerProps {
  concepts: ConceptDraft[];
  onSelect: (concept: ConceptDraft) => void;
}

export const ConceptPicker: React.FC<ConceptPickerProps> = ({ concepts, onSelect }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="text-center mb-10">
        <p className="text-[9px] font-mono text-neutral-600 uppercase tracking-[0.3em] mb-3">Four Paths</p>
        <h2 className="text-2xl font-serif text-white italic">Which direction calls to you?</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-neutral-800/30">
        {concepts.map((concept) => (
          <div
            key={concept.style}
            onClick={() => concept.status === 'success' && onSelect(concept)}
            className={`
              relative group overflow-hidden transition-all duration-300
              aspect-[4/3] flex flex-col bg-neutral-950
              ${concept.status === 'success'
                ? 'cursor-pointer hover:bg-neutral-900'
                : 'cursor-default'
              }
            `}
          >
            {/* Header / Label */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-10">
              <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-neutral-500">
                {concept.style}
              </span>
              {concept.status === 'success' && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white">
                  <ArrowUpRight size={14} />
                </div>
              )}
            </div>

            {/* Content State */}
            <div className="flex-1 flex items-center justify-center relative">

              {/* LOADING */}
              {concept.status === 'loading' && (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-5 h-5 text-neutral-700 animate-spin" />
                  <span className="text-[9px] font-mono text-neutral-700 animate-pulse uppercase tracking-wider">Generating</span>
                </div>
              )}

              {/* PENDING */}
              {concept.status === 'pending' && (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-1 h-1 rounded-full bg-neutral-800" />
                  <span className="text-[9px] font-mono text-neutral-800 uppercase tracking-wider">Queued</span>
                </div>
              )}

              {/* SUCCESS */}
              {concept.status === 'success' && concept.imageUrl && (
                <div className="w-full h-full p-8 bg-white flex items-center justify-center">
                  <img
                    src={concept.imageUrl}
                    alt={concept.style}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}

              {/* ERROR */}
              {concept.status === 'error' && (
                <div className="flex flex-col items-center gap-2 text-neutral-700">
                   <AlertCircle size={16} />
                   <span className="text-[9px] font-mono uppercase tracking-wider">Failed</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
