import React from 'react';
import { DesignAnalysis } from '../types';

interface AnalysisPanelProps {
  analysis: DesignAnalysis;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ analysis }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="border-l border-neutral-700 pl-4 mb-8">
        <p className="text-[9px] font-mono text-neutral-600 uppercase tracking-[0.2em] mb-1">
          Pattern Recognition
        </p>
        <h2 className="text-xl font-serif text-white italic">What I've noticed...</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-neutral-800/30">
        <div className="bg-neutral-950 p-6">
          <p className="font-mono text-[9px] text-neutral-600 uppercase tracking-[0.2em] mb-3">Intent</p>
          <p className="text-neutral-400 text-sm leading-relaxed">{analysis.intent}</p>
        </div>

        <div className="bg-neutral-950 p-6">
          <p className="font-mono text-[9px] text-neutral-600 uppercase tracking-[0.2em] mb-3">Structural DNA</p>
          <p className="text-neutral-400 text-sm leading-relaxed">{analysis.structuralDNA}</p>
        </div>

        <div className="bg-neutral-950 p-6">
          <p className="font-mono text-[9px] text-neutral-600 uppercase tracking-[0.2em] mb-3">Elevation Targets</p>
          <p className="text-neutral-400 text-sm leading-relaxed">{analysis.elevationTargets}</p>
        </div>

        <div className="bg-neutral-900/50 p-6">
          <p className="font-mono text-[9px] text-neutral-500 uppercase tracking-[0.2em] mb-3">Rationale</p>
          <p className="text-neutral-300 text-sm font-serif italic leading-relaxed">"{analysis.rationale}"</p>
        </div>
      </div>
    </div>
  );
};
