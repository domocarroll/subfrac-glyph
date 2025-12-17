import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { AnalysisPanel } from './components/AnalysisPanel';
import { RefinementChat } from './components/RefinementChat';
import { ConceptPicker } from './components/ConceptPicker';
import { analyzeSketch, generateRefinedWordmark, refineWordmark } from './services/geminiService';
import { AppPhase, DesignAnalysis, StyleDirection, ChatMessage, ConceptDraft } from './types';
import { Loader2, RefreshCw, Download, PenTool } from 'lucide-react';

const App: React.FC = () => {
  const [phase, setPhase] = useState<AppPhase>(AppPhase.IDLE);
  const [base64Sketch, setBase64Sketch] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<DesignAnalysis | null>(null);

  // Concept State
  const [brandName, setBrandName] = useState<string>('');
  const [concepts, setConcepts] = useState<ConceptDraft[]>([]);

  // Final Selection & Chat State
  const [selectedConcept, setSelectedConcept] = useState<ConceptDraft | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null); // The current active image
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isRefining, setIsRefining] = useState(false);

  const resultRef = useRef<HTMLDivElement>(null);

  const handleFileSelected = async (base64: string) => {
    setBase64Sketch(base64);
    setPhase(AppPhase.ANALYZING);
    try {
      setAnalysis(result);
      setPhase(AppPhase.REVIEW);
    } catch (error: any) {
      console.error(error);
      if (error.message === 'MISSING_API_KEY') {
        alert("API Key is missing. Please configure GEMINI_API_KEY in your Vercel project settings.");
        setPhase(AppPhase.IDLE); // Reset to idle so they can try again after fixing
        return;
      }
      setPhase(AppPhase.ERROR);
    }
  };

  const handleGenerateConcepts = async () => {
    if (!base64Sketch || !analysis || !brandName) return;

    setPhase(AppPhase.SELECTION); // Move to selection view immediately

    // Initialize placeholders
    const styles = [
      StyleDirection.BOLD,
      StyleDirection.ELEGANT,
      StyleDirection.IMAGINATIVE,
      StyleDirection.MINIMALIST
    ];

    setConcepts(styles.map(style => ({
      style,
      imageUrl: null,
      status: 'loading'
    })));

    // Fire requests in parallel but update state independently
    styles.forEach(async (style) => {
      try {
        const url = await generateRefinedWordmark(base64Sketch, analysis, style, brandName);
        setConcepts(prev => prev.map(c =>
          c.style === style ? { ...c, imageUrl: url, status: 'success' } : c
        ));
      } catch (error: any) {
        console.error(`Failed to generate ${style}`, error);
        if (error.message === 'MISSING_API_KEY') {
          alert("API Key is missing. Please configure GEMINI_API_KEY in your Vercel project settings.");
          return;
        }
        setConcepts(prev => prev.map(c =>
          c.style === style ? { ...c, status: 'error' } : c
        ));
      }
    });
  };

  const handleSelectConcept = (concept: ConceptDraft) => {
    if (!concept.imageUrl) return;

    setSelectedConcept(concept);
    setGeneratedImage(concept.imageUrl);
    setPhase(AppPhase.COMPLETE);

    // Initialize chat context with Danni's voice
    const styleDescriptions: Record<StyleDirection, string> = {
      [StyleDirection.BOLD]: 'commanding presence and confident weight',
      [StyleDirection.ELEGANT]: 'refined proportions and sophisticated restraint',
      [StyleDirection.IMAGINATIVE]: 'unexpected details and memorable flourishes',
      [StyleDirection.MINIMALIST]: 'essential forms and perfect optical spacing'
    };

    setChatMessages([
      {
        id: Date.now().toString(),
        role: 'ai',
        text: `I've noticed something fascinating in this direction. The ${concept.style.toLowerCase()} interpretation captures ${styleDescriptions[concept.style]}—precisely what "${brandName}" needs to feel ownable. The mark is almost there... shall we refine it together?`,
        imageUrl: concept.imageUrl,
        timestamp: Date.now()
      }
    ]);
  };

  const handleRefineMessage = async (text: string) => {
    if (!generatedImage) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: Date.now()
    };
    setChatMessages(prev => [...prev, userMsg]);
    setIsRefining(true);

    try {
      const result = await refineWordmark(generatedImage, text);
      setGeneratedImage(result.image);

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: result.text,
        imageUrl: result.image,
        timestamp: Date.now()
      };
      setChatMessages(prev => [...prev, aiMsg]);

    } catch (error: any) {
      console.error("Refinement error", error);

      let errorMessage = "I encountered an issue refining the design. Please try rephrasing your request.";
      if (error.message === 'MISSING_API_KEY') {
        errorMessage = "API Key is missing. Please configure GEMINI_API_KEY in your Vercel project settings.";
      }

      const errorMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'ai',
        text: errorMessage,
        timestamp: Date.now()
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsRefining(false);
    }
  };

  const handleReset = () => {
    setPhase(AppPhase.IDLE);
    setBase64Sketch(null);
    setAnalysis(null);
    setGeneratedImage(null);
    setBrandName('');
    setConcepts([]);
    setChatMessages([]);
  };

  // Scroll to result on complete
  useEffect(() => {
    if (phase === AppPhase.COMPLETE && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [phase]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-white selection:text-black">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-12">

        {/* Phase: IDLE / Upload */}
        {phase === AppPhase.IDLE && (
          <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-900/50 border border-neutral-800/50 text-[10px] font-mono text-neutral-400 uppercase tracking-[0.2em] mb-8">
                <span className="w-1 h-1 rounded-full bg-white"></span>
                D.A.N.N.I. Active
              </div>
              <h2 className="text-4xl md:text-5xl font-serif text-white mb-6 leading-tight">
                What intrigues me most<br /><span className="italic text-neutral-600">is what your sketch wants to become.</span>
              </h2>
              <p className="text-neutral-500 text-base max-w-lg mx-auto leading-relaxed font-light">
                Upload your rough concept. I'll analyze its hidden geometry and generate four distinct typographic directions—each one a different path to the same destination.
              </p>
            </div>
            <UploadZone onFileSelected={handleFileSelected} />
          </div>
        )}

        {/* Phase: LOADING (Analysis) */}
        {phase === AppPhase.ANALYZING && (
          <div className="flex flex-col items-center justify-center h-[60vh] animate-in fade-in duration-500">
            <div className="w-12 h-12 border border-neutral-700 flex items-center justify-center mb-8">
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            </div>
            <h3 className="text-lg font-serif text-white mb-2 italic">I sense something fascinating here...</h3>
            <p className="font-mono text-xs text-neutral-600 uppercase tracking-wider">
              Reading the structural DNA
            </p>
          </div>
        )}

        {/* Phase: REVIEW (Name & Intent) */}
        {phase === AppPhase.REVIEW && analysis && (
          <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-neutral-800/30">
              {/* Sketch Preview */}
              <div className="relative bg-neutral-900 aspect-video flex items-center justify-center">
                <div className="absolute top-4 left-4 text-[9px] font-mono text-neutral-600 uppercase tracking-[0.2em]">
                  Source
                </div>
                <img src={`data:image/jpeg;base64,${base64Sketch}`} alt="Original" className="max-w-[80%] max-h-[80%] object-contain opacity-70" />
              </div>

              {/* Controls */}
              <div className="bg-neutral-950 p-8 space-y-6">
                <div>
                  <label className="block text-[9px] font-mono text-neutral-600 uppercase tracking-[0.2em] mb-4">Brand Name</label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="Enter brand name"
                    className="w-full bg-transparent border-b border-neutral-800 text-2xl font-serif text-white pb-3 focus:outline-none focus:border-neutral-600 transition-colors placeholder:text-neutral-800"
                    autoFocus
                  />
                </div>
                <div className="pt-6">
                  <button
                    onClick={handleGenerateConcepts}
                    disabled={!brandName}
                    className="w-full bg-white text-neutral-950 font-mono text-xs uppercase tracking-wider h-12 flex items-center justify-center gap-2 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <PenTool size={14} />
                    <span>Generate Four Directions</span>
                  </button>
                </div>
              </div>
            </div>

            <AnalysisPanel analysis={analysis} />
          </div>
        )}

        {/* Phase: SELECTION (The Grid) */}
        {(phase === AppPhase.SELECTION) && (
          <div className="max-w-5xl mx-auto">
            <ConceptPicker concepts={concepts} onSelect={handleSelectConcept} />

            <div className="mt-12 text-center">
              <button onClick={() => setPhase(AppPhase.REVIEW)} className="text-neutral-600 hover:text-neutral-400 text-[10px] font-mono uppercase tracking-wider transition-colors">
                ← Back to Analysis
              </button>
            </div>
          </div>
        )}

        {/* Phase: COMPLETE (Refinement) */}
        {phase === AppPhase.COMPLETE && generatedImage && selectedConcept && (
          <div ref={resultRef} className="animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-24">

            <div className="flex items-center justify-between mb-8">
              <button onClick={handleReset} className="flex items-center gap-2 text-neutral-600 hover:text-neutral-400 transition-colors">
                <RefreshCw size={12} />
                <span className="text-[10px] font-mono uppercase tracking-wider">New Project</span>
              </button>
              <div className="flex gap-4">
                <a
                  href={generatedImage}
                  download={`subfrac-glyph-${brandName}-${selectedConcept.style}.png`}
                  className="flex items-center gap-2 bg-white text-neutral-950 px-5 py-2 text-[10px] font-mono uppercase tracking-wider hover:bg-neutral-100 transition-colors"
                >
                  <Download size={12} />
                  Export
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-neutral-800/30 mb-12">
              {/* Original */}
              <div className="bg-neutral-900 p-12 flex flex-col items-center justify-center relative min-h-[400px]">
                <span className="absolute top-6 left-6 text-[9px] font-mono text-neutral-700 uppercase tracking-[0.2em]">Source</span>
                <img src={`data:image/jpeg;base64,${base64Sketch}`} alt="Original" className="max-w-full max-h-[250px] opacity-50 grayscale" />
              </div>

              {/* Selected/Refined */}
              <div className="bg-white p-12 flex flex-col items-center justify-center relative min-h-[400px]">
                <div className="absolute top-6 left-6 flex items-center gap-3">
                  <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-[0.2em]">Active</span>
                  <span className="text-[9px] font-mono text-neutral-300 uppercase tracking-[0.15em]">
                    {selectedConcept.style}
                  </span>
                </div>
                <img src={generatedImage} alt="Generated" className="max-w-full max-h-[250px]" />

                <div className="absolute bottom-6 right-6 flex items-center gap-2">
                  <div className="h-px w-6 bg-neutral-200"></div>
                  <span className="text-[8px] font-mono text-neutral-400 uppercase tracking-[0.2em]">Subfrac.Glyph</span>
                </div>
              </div>
            </div>

            {/* CHAT SECTION */}
            <RefinementChat
              messages={chatMessages}
              onSendMessage={handleRefineMessage}
              isProcessing={isRefining}
            />

          </div>
        )}

        {/* Error State */}
        {phase === AppPhase.ERROR && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-12 h-12 border border-neutral-800 text-neutral-600 mb-8">
              <Loader2 className="w-5 h-5" />
            </div>
            <h3 className="text-xl text-white font-serif italic mb-2">Something shifted unexpectedly...</h3>
            <p className="text-neutral-600 text-sm mb-10">
              The process was interrupted. Let's try again.
            </p>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-white text-neutral-950 font-mono text-xs uppercase tracking-wider hover:bg-neutral-100 transition-colors"
            >
              Start Over
            </button>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;
