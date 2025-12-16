export enum AppPhase {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  REVIEW = 'REVIEW', // Input brand name & Intent
  CONCEPTUALIZING = 'CONCEPTUALIZING', // Generating 4 options
  SELECTION = 'SELECTION', // User picking 1 of 4
  COMPLETE = 'COMPLETE', // Chat/Refine on selected
  ERROR = 'ERROR'
}

export enum StyleDirection {
  BOLD = 'BOLD',
  ELEGANT = 'ELEGANT',
  IMAGINATIVE = 'IMAGINATIVE',
  MINIMALIST = 'MINIMALIST'
}

export interface DesignAnalysis {
  intent: string;
  structuralDNA: string;
  elevationTargets: string;
  rationale: string;
}

export interface ConceptDraft {
  style: StyleDirection;
  imageUrl: string | null;
  status: 'pending' | 'loading' | 'success' | 'error';
}

export interface GeneratedAsset {
  imageUrl: string;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text?: string;
  imageUrl?: string;
  timestamp: number;
}

declare global {
  interface AIStudio {
    hasSelectedApiKey(): Promise<boolean>;
    openSelectKey(): Promise<void>;
  }
}