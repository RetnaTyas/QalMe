import React, { useRef, useEffect, useState } from 'react';
import { MuzakarahState, DeliberationTurn } from '../types';
import { CouncilMemberNode } from './PipelineNode';
import { CopyIcon, CheckIcon, ChevronUpIcon, ChevronDownIcon } from './icons';

interface DeliberationCouncilProps {
  state: MuzakarahState;
  userQuery: string | null;
  onOpenNadhirModal: () => void;
  onResumeDebate: () => void;
}

const TranscriptTurn: React.FC<{ turn: DeliberationTurn }> = ({ turn }) => {
    const color = turn.isIntervention ? 'text-amber-400' : 'text-slate-300';
    const speakerFont = turn.isIntervention ? 'font-bold' : 'font-semibold';
    
    return (
        <div className="py-2 animate-fade-in-up">
            <p className="text-sm break-words">
                <span className={`${color} ${speakerFont}`}>{turn.speaker}: </span>
                <span className="text-slate-300 whitespace-pre-wrap">{turn.statement}</span>
            </p>
        </div>
    );
};

export const DeliberationCouncil: React.FC<DeliberationCouncilProps> = ({ state, userQuery, onOpenNadhirModal, onResumeDebate }) => {
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const [isTranscriptCopied, setIsTranscriptCopied] = useState(false);
  const [isCouncilCollapsed, setIsCouncilCollapsed] = useState(false);
  
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.deliberationTranscript]);

  const handleCopyTranscript = () => {
    if (state.deliberationTranscript.length === 0) return;

    const transcriptText = state.deliberationTranscript.map(turn => {
        const speaker = turn.isIntervention ? `[${turn.speaker} - INTERVENTION]` : `[${turn.speaker}]`;
        return `${speaker}: ${turn.statement}`;
    }).join('\n\n');

    navigator.clipboard.writeText(transcriptText).then(() => {
        setIsTranscriptCopied(true);
        setTimeout(() => setIsTranscriptCopied(false), 2500);
    });
  };
  
  const { participants } = state;

  return (
    <div className="flex flex-col h-full bg-slate-800/50 p-4 rounded-lg border border-slate-700 overflow-hidden">
      
      {/* Collapsible Council Section */}
      <div className="mb-4">
          <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-200">Deliberative Council</h2>
              <button
                  onClick={() => setIsCouncilCollapsed(!isCouncilCollapsed)}
                  className="p-1.5 text-slate-400 hover:text-slate-100 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
                  title={isCouncilCollapsed ? 'Expand Council' : 'Collapse Council'}
                  aria-expanded={!isCouncilCollapsed}
              >
                  {isCouncilCollapsed ? <ChevronDownIcon className="w-5 h-5" /> : <ChevronUpIcon className="w-5 h-5" />}
              </button>
          </div>
          
          <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isCouncilCollapsed ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100'}`}>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                  {participants['Al-Hakim'] && (
                      <div className="md:col-span-6 bg-slate-900/50 p-2 rounded-lg">
                          <CouncilMemberNode 
                              persona="Al-Hakim" 
                              state={participants['Al-Hakim']} 
                              isDebatePaused={state.status === 'paused_for_verdict'}
                              onResumeDebate={onResumeDebate}
                          />
                      </div>
                  )}
                  <div className="md:col-span-2">
                      <CouncilMemberNode persona="Al-Khatib" state={participants['Al-Khatib']} />
                  </div>
                  <div className="md:col-span-2">
                      <CouncilMemberNode persona="Al-Faqih" state={participants['Al-Faqih']} />
                  </div>
                  <div className="md:col-span-2">
                      <CouncilMemberNode persona="Al-Hypothesis" state={participants['Al-Hypothesis']} />
                  </div>
                  <div className="md:col-span-2">
                      <CouncilMemberNode persona="Al-Mizan" state={participants['Al-Mizan']} />
                  </div>
                  <div className="md:col-span-2">
                      <CouncilMemberNode persona="Al-Nadhir" state={participants['Al-Nadhir']} onOpenNadhirModal={onOpenNadhirModal} />
                  </div>
                  {participants['Al-Mudawwin'] && (
                      <div className="md:col-span-2">
                          <CouncilMemberNode persona="Al-Mudawwin" state={participants['Al-Mudawwin']} />
                      </div>
                  )}
              </div>
           </div>
      </div>


      {/* Separated Transcript Section */}
      <div className="flex-grow flex flex-col bg-slate-900/70 rounded-lg p-3 border border-slate-700 overflow-hidden">
         <div className="flex justify-between items-center mb-2 border-b border-slate-700 pb-2">
            <h3 className="text-md font-semibold text-slate-300">Muzakarah (Deliberation) Transcript</h3>
            {state.deliberationTranscript.length > 0 && (
                <button 
                    onClick={handleCopyTranscript}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 transition-colors disabled:opacity-50"
                    title="Copy full transcript"
                    disabled={isTranscriptCopied}
                    aria-label={isTranscriptCopied ? 'Transcript copied' : 'Copy transcript'}
                >
                    {isTranscriptCopied ? (
                        <>
                            <CheckIcon className="w-3.5 h-3.5 text-green-400" />
                            Copied!
                        </>
                    ) : (
                        <>
                            <CopyIcon className="w-3.5 h-3.5" />
                            Copy
                        </>
                    )}
                </button>
            )}
         </div>
         <div className="space-y-1 pr-2 overflow-y-auto">
            {state.deliberationTranscript.length > 0 ? (
                state.deliberationTranscript.map((turn, index) => <TranscriptTurn key={index} turn={turn} />)
            ) : (
                <p className="text-slate-400 italic text-center p-4">Awaiting user query to convene the council...</p>
            )}
            <div ref={transcriptEndRef} />
         </div>
      </div>
    </div>
  );
};