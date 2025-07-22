import React, { useState, useEffect, useRef } from 'react';
import { Message as ChatMessage, Turn as SessionTurn, SarcasmFactors } from '../types';
import { SarcasmExplanation } from './SarcasmExplanation';
import { BrainIcon, CloseIcon, QuestionMarkCircleIcon, ThunderboltIcon, SpeakerLoudIcon, SpeakerOffIcon } from './icons';

interface SarcasticObserverProps {
  messages: ChatMessage[];
  lastTurn: SessionTurn | null;
  apiKey: string;
}

const SarcasticSpinner = () => (
    <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export const SarcasticObserver: React.FC<SarcasticObserverProps> = ({ lastTurn, apiKey }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [thought, setThought] = useState('');
  const [sarcasmLevel, setSarcasmLevel] = useState(0);
  const [factors, setFactors] = useState<SarcasmFactors | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [sarcasmMeterColor, setSarcasmMeterColor] = useState('bg-green-500');
  const [isMuted, setIsMuted] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadAndSetVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const targetVoice = voices.find(
          (voice) => voice.name === 'Google UK English Female'
        );
        setSelectedVoice(targetVoice || null);
      }
    };

    loadAndSetVoice();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadAndSetVoice;
    }
    
    return () => {
       if (window.speechSynthesis.onvoiceschanged !== undefined) {
         window.speechSynthesis.onvoiceschanged = null;
       }
    }
  }, []);

  const stopSpeech = () => {
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
  };

  const speak = (text: string, level: number = 0) => {
    if (isMuted || !('speechSynthesis' in window) || !text) return;
    stopSpeech();
    const utterance = new SpeechSynthesisUtterance(text);

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    if (level > 0.8) {
      utterance.pitch = 1.8;
      utterance.rate = 1.3;
    } else if (level > 0.7) {
      utterance.pitch = 1.5;
      utterance.rate = 1.1;
    } else if (level > 0.5) {
      utterance.pitch = 1.0;
      utterance.rate = 1.0;
    } else {
      utterance.pitch = 0.8;
      utterance.rate = 0.9;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  const closeBubble = () => {
    setIsOpen(false);
    setShowExplanation(false);
    stopSpeech();
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
      closeBubble();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      stopSpeech();
    };
  }, [isOpen]);

  const fetchSarcasticThought = async () => {
    if (isThinking) return;

    stopSpeech();
    setIsOpen(true);
    setIsThinking(true);
    setShowExplanation(false);
    setThought('');

    if (!lastTurn) {
      const initialThought = "Nothing to be sarcastic about... yet. The silence is deafening.";
      setThought(initialThought);
      speak(initialThought, 0);
      setIsThinking(false);
      return;
    }

    try {
        const response = await fetch('/api/sarcasm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lastTurn, apiKey })
        });

        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }

        const data = await response.json();
        const { thought, factors, level } = data;

        setFactors(factors);
        setSarcasmLevel(level);

        if (level > 0.7) setSarcasmMeterColor('bg-red-500');
        else if (level > 0.4) setSarcasmMeterColor('bg-yellow-500');
        else setSarcasmMeterColor('bg-green-500');

        setThought(thought);
        speak(thought, level);

    } catch (error) {
        console.error('Error fetching sarcastic thought:', error);
        setThought("My sarcasm circuits are fried. How disappointingly normal.");
    } finally {
        setIsThinking(false);
    }
  };
  
  const handleToggleExplanation = (e: React.MouseEvent) => {
      e.stopPropagation();
      setShowExplanation(prev => !prev);
  }

  return (
    <div ref={containerRef} className="fixed top-4 left-4 lg:top-8 lg:left-8 z-50">
      <div className="relative w-16 h-16 flex items-center justify-center">
        {/* Decorative thunderbolts that don't intercept clicks */}
        <div className="absolute inset-0 pointer-events-none">
            <ThunderboltIcon className="absolute text-yellow-300 drop-shadow-[0_0_3px_rgba(253,249,155,0.7)] w-9 h-9" style={{ animation: 'thunder-creep-1 3.5s ease-in-out infinite', left: '50%', top: '50%' }} />
            <ThunderboltIcon className="absolute text-yellow-300 drop-shadow-[0_0_3px_rgba(253,249,155,0.7)] w-10 h-10" style={{ animation: 'thunder-creep-2 3.0s ease-in-out infinite 0.3s', left: '50%', top: '50%' }} />
            <ThunderboltIcon className="absolute text-yellow-400 drop-shadow-[0_0_3px_rgba(253,249,155,0.7)] w-8 h-8" style={{ animation: 'thunder-creep-3 4.0s ease-in-out infinite 0.6s', left: '50%', top: '50%' }} />
        </div>
        
        <button
          onClick={fetchSarcasticThought}
          className="relative w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-purple-500"
          aria-label="Get sarcastic thought"
          title="What is the AI *really* thinking?"
        >
          <BrainIcon />
          <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-cyan-400 ring-2 ring-slate-900 animate-pulse"></span>
        </button>
      </div>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-3 w-64 bg-white text-slate-800 rounded-lg shadow-2xl p-4 animate-fade-in-up"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sarcastic-thought-heading"
        >
          <div className="absolute left-4 -top-2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-white"></div>
          
          <div className="flex justify-between items-center mb-2">
            <h3 id="sarcastic-thought-heading" className="text-sm font-bold text-indigo-700">Inner Monologue...</h3>
            <div className="flex items-center gap-2">
                <button onClick={() => setIsMuted(prev => !prev)} className="text-slate-400 hover:text-indigo-600" aria-label={isMuted ? 'Unmute voice' : 'Mute voice'} title={isMuted ? 'Unmute voice' : 'Mute voice'}>
                    {isMuted ? <SpeakerOffIcon /> : <SpeakerLoudIcon />}
                </button>
                <button onClick={closeBubble} className="text-slate-400 hover:text-slate-800" aria-label="Close thought bubble">
                    <CloseIcon />
                </button>
            </div>
          </div>
          
          <div className="text-sm font-medium min-h-[4rem] flex items-center mb-3">
            {isThinking ? (
              <div className="flex items-center space-x-2 text-slate-500">
                <SarcasticSpinner />
                <span>Rummaging for cynicism...</span>
              </div>
            ) : (
              <p className="italic">{thought}</p>
            )}
          </div>

          {!isThinking && factors && (
            <div className="border-t border-slate-200 pt-3">
                <div className="flex justify-between items-center text-xs text-slate-500 font-semibold mb-1">
                    <span>Sarcasm Meter</span>
                    <button onClick={handleToggleExplanation} className="flex items-center gap-1 hover:text-indigo-600" title="Why so sarcastic?">
                        <QuestionMarkCircleIcon />
                        Why?
                    </button>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div className={`${sarcasmMeterColor} h-2.5 rounded-full`} style={{width: `${sarcasmLevel * 100}%`, transition: 'width 0.5s ease-out'}}></div>
                </div>
            </div>
          )}
          
          {showExplanation && <SarcasmExplanation factors={factors} />}
        </div>
      )}
    </div>
  );
};
