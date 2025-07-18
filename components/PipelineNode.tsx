
import React from 'react';
import { ParticipantState, Persona } from '../types';
import { SpinnerIcon, ScalesIcon, MagnifyingGlassIcon, FeatherIcon, BranchingIcon, ScrollIcon } from './icons';

interface CouncilMemberNodeProps {
  persona: Persona;
  state: ParticipantState;
}

const personaConfig: { [key in Persona]?: { title: string; role: string; icon: React.ReactNode; color: string; } } = {
  'Al-Khatib': {
    title: 'Al-Khatib',
    role: 'The Generator',
    icon: <FeatherIcon className="w-7 h-7" />,
    color: 'blue'
  },
  'Al-Faqih': {
    title: 'Al-Faqih',
    role: 'The Critic',
    icon: <MagnifyingGlassIcon className="w-7 h-7" />,
    color: 'red'
  },
  'Al-Hypothesis': {
    title: 'Al-Hypothesis',
    role: 'The Deviant',
    icon: <BranchingIcon className="w-7 h-7" />,
    color: 'purple'
  },
  'Al-Mizan': {
    title: 'Al-Mizan',
    role: 'The Moderator',
    icon: <ScalesIcon className="w-7 h-7" />,
    color: 'amber'
  },
  'Al-Mudawwin': {
    title: 'Al-Mudawwin',
    role: 'The Chronicler',
    icon: <ScrollIcon className="w-7 h-7" />,
    color: 'slate'
  }
};

const statusClasses = {
    speaking: {
        blue: 'border-blue-500 shadow-blue-500/30',
        red: 'border-red-500 shadow-red-500/30',
        purple: 'border-purple-500 shadow-purple-500/30',
        amber: 'border-amber-500 shadow-amber-500/30',
        slate: 'border-slate-500 shadow-slate-500/30',
    },
    thinking: {
        blue: 'border-blue-500/50',
        red: 'border-red-500/50',
        purple: 'border-purple-500/50',
        amber: 'border-amber-500/50',
        slate: 'border-slate-500/50',
    }
};

export const CouncilMemberNode: React.FC<CouncilMemberNodeProps> = ({ persona, state }) => {
  const config = personaConfig[persona];
  if (!config) return null;

  const isSpeaking = state.status === 'speaking';
  const isThinking = state.status === 'thinking';
  
  const glowClass = isSpeaking ? `shadow-lg ${statusClasses.speaking[config.color]}` : isThinking ? `shadow-md ${statusClasses.thinking[config.color]}` : 'border-slate-700';

  return (
    <div className={`bg-slate-800 rounded-lg p-3 border-2 ${glowClass} transition-all duration-300 flex flex-col`}>
      <div className="flex items-center gap-3 mb-2">
        <div className={`text-${config.color}-400`}>{config.icon}</div>
        <div>
          <h3 className={`font-bold text-lg text-${config.color}-300`}>{config.title}</h3>
          <p className="text-xs text-slate-400 font-medium">{config.role}</p>
        </div>
         {isThinking && <SpinnerIcon />}
      </div>
      <div className="text-sm text-slate-300 min-h-[40px] flex-grow mt-1 pt-2 border-t border-slate-700/50">
        <p className={`${isSpeaking ? 'opacity-100' : 'opacity-60 italic'}`}>
            {state.statement || "Waiting..."}
        </p>
      </div>
    </div>
  );
};
