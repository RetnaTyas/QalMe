import React, { useState, useEffect, useRef } from 'react';
import { SyringeIcon, CloseIcon } from './icons';

interface NadhirInjectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInject: (idea: string) => void;
  isLoading: boolean;
}

export const NadhirInjectionModal: React.FC<NadhirInjectionModalProps> = ({ isOpen, onClose, onInject, isLoading }) => {
  const [idea, setIdea] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    } else {
      setIdea('');
    }
  }, [isOpen]);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);


  if (!isOpen) {
    return null;
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (idea.trim()) {
        onInject(idea);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in-up"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="nadhir-modal-title"
    >
      <div 
        ref={modalRef}
        className="bg-slate-800 rounded-lg shadow-2xl p-6 w-full max-w-lg border border-teal-500/50 relative"
        onClick={e => e.stopPropagation()}
      >
        <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            aria-label="Close"
        >
            <CloseIcon />
        </button>

        <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-teal-500/20 rounded-full">
                <SyringeIcon className="w-6 h-6 text-teal-400" />
            </div>
            <h2 id="nadhir-modal-title" className="text-xl font-bold text-slate-100">Inject an Idea for Al-Nadhir</h2>
        </div>
        
        <p className="text-slate-400 mb-4 text-sm">
            Provide a provocative idea, a counter-argument, or a new perspective. Al-Nadhir will develop it into a full argument when its turn comes.
        </p>

        <form onSubmit={handleSubmit}>
            <textarea
              ref={textareaRef}
              value={idea}
              onChange={e => setIdea(e.target.value)}
              placeholder="Type your core idea here..."
              className="w-full bg-slate-900 border rounded-md p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all duration-200 resize-y border-slate-600 focus:ring-teal-500 min-h-[120px]"
              rows={4}
            />
            <div className="mt-4 flex justify-end">
                <button
                    type="submit"
                    disabled={!idea.trim() || isLoading}
                    className="bg-teal-600 hover:bg-teal-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-colors flex items-center gap-2"
                >
                    <SyringeIcon className="w-5 h-5" />
                    Inject Idea
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};
