import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Hexagon, Loader2 } from 'lucide-react';
import { ChatMessage } from '../types';

interface RefinementChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isProcessing: boolean;
}

export const RefinementChat: React.FC<RefinementChatProps> = ({ messages, onSendMessage, isProcessing }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-12 bg-neutral-900/20 border border-neutral-800/50 overflow-hidden">
      <div className="p-4 border-b border-neutral-800/50 bg-neutral-900/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white text-neutral-950 flex items-center justify-center">
            <Hexagon size={14} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-white font-mono text-sm">Danni</h3>
            <p className="text-[9px] text-neutral-600 font-mono uppercase tracking-[0.15em]">Design Intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
            <span className="text-[9px] text-neutral-600 font-mono uppercase tracking-wider">Active</span>
        </div>
      </div>

      <div className="h-[500px] overflow-y-auto p-6 space-y-8 scroll-smooth">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`
              flex-shrink-0 w-8 h-8 flex items-center justify-center
              ${msg.role === 'user' ? 'bg-neutral-800 text-white' : 'bg-white text-neutral-950'}
            `}>
              {msg.role === 'user' ? <User size={12} /> : <Hexagon size={12} strokeWidth={2.5} />}
            </div>

            <div className={`flex flex-col gap-3 max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>

              {/* Text Bubble */}
              {msg.text && (
                <div className={`
                  text-sm leading-relaxed
                  ${msg.role === 'user'
                    ? 'bg-neutral-800/50 text-white px-4 py-3 font-mono text-xs'
                    : 'text-neutral-400 font-serif italic'
                  }
                `}>
                  {msg.text}
                </div>
              )}

              {/* Image Attachment (For AI) */}
              {msg.imageUrl && (
                <div className="overflow-hidden border border-neutral-800/50 w-full max-w-xs group cursor-pointer transition-transform hover:scale-[1.01]">
                   <img src={msg.imageUrl} alt="Refinement" className="w-full h-auto bg-white" />
                   <div className="bg-neutral-900/50 px-3 py-2 border-t border-neutral-800/50 flex justify-between items-center">
                      <span className="text-[9px] text-neutral-600 font-mono uppercase tracking-wider">Iteration {msg.id.slice(-4)}</span>
                   </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-white text-neutral-950 flex items-center justify-center">
              <Hexagon size={12} strokeWidth={2.5} />
            </div>
            <div className="flex items-center gap-3 text-neutral-600">
               <Loader2 size={12} className="animate-spin" />
               <span className="text-xs font-mono animate-pulse uppercase tracking-wider">Refining the mark...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-neutral-900/30 border-t border-neutral-800/50">
        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe what you'd like to adjust..."
            className="w-full bg-neutral-950 border border-neutral-800/50 text-white px-4 py-4 focus:outline-none focus:border-neutral-700 transition-all font-mono text-xs pr-12 placeholder:text-neutral-700"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="absolute right-2 p-2 bg-white text-neutral-950 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
};
