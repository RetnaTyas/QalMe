
import React, { useRef, useEffect } from 'react';
import { MuzakarahState, DeliberationTurn } from '../types';
import { CouncilMemberNode } from './PipelineNode';

interface DeliberationCouncilProps {
  state: MuzakarahState;
  userQuery: string | null;
}

const TranscriptTurn: React.FC<{ turn: DeliberationTurn }> = ({ turn }) => {
    const color = turn.isIntervention ? 'text-amber-400' : 'text-slate-300';
    const speakerFont = turn.isIntervention ? 'font-bold' : 'font-semibold';
    
    return (
        <div className="py-2 animate-fade-in-up">
            <p className="text-sm">
                <span className={`${color} ${speakerFont}`}>{turn.speaker}: </span>
                <span className="text-slate-300 whitespace-pre-wrap">{turn.statement}</span>
            </p>
        </div>
    );
};

export const DeliberationCouncil: React.FC<DeliberationCouncilProps> = ({ state, userQuery }) => {
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.deliberationTranscript]);
  
  const { participants } = state;

  return (
    <div className="flex flex-col h-full bg-slate-800/50 p-4 rounded-lg border border-slate-700 overflow-hidden">
      <h2 className="text-lg font-bold text-slate-200 mb-4 text-center">Deliberative Council</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4">
        <div className="md:col-span-2">
            <CouncilMemberNode persona="Al-Khatib" state={participants['Al-Khatib']} />
        </div>
        <div className="md:col-span-2">
            <CouncilMemberNode persona="Al-Faqih" state={participants['Al-Faqih']} />
        </div>
        <div className="md:col-span-2">
            <CouncilMemberNode persona="Al-Hypothesis" state={participants['Al-Hypothesis']} />
        </div>
        <div className="md:col-span-3">
            <CouncilMemberNode persona="Al-Mizan" state={participants['Al-Mizan']} />
        </div>
         {participants['Al-Mudawwin'] && (
            <div className="md:col-span-3">
                <CouncilMemberNode persona="Al-Mudawwin" state={participants['Al-Mudawwin']} />
            </div>
        )}
      </div>

      <div className="flex-grow bg-slate-900/70 rounded-lg p-3 overflow-y-auto border border-slate-700">
         <h3 className="text-md font-semibold text-slate-300 mb-2 border-b border-slate-700 pb-2">Muzakarah (Deliberation) Transcript</h3>
         <div className="space-y-1 pr-2">
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
