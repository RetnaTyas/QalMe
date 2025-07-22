import React from 'react';
import { ParticipantState, Persona } from '../types';
import { SpinnerIcon, ScalesIcon, MagnifyingGlassIcon, FeatherIcon, BranchingIcon, ScrollIcon, DuelingSwordsIcon, SyringeIcon, ChallengeIcon } from './icons';

interface CouncilMemberNodeProps {
  persona: Persona;
  state: ParticipantState;
  onOpenNadhirModal?: () => void;
  // NEW: Prop to handle debate resumption
  onResumeDebate?: () => void;
  isDebatePaused?: boolean;
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
  'Al-Hakim': {
    title: 'Al-Hakim',
    role: 'The Judge',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1.5a.75.75 0 0 1 .75.75V7.5h-1.5V2.25A.75.75 0 0 1 12 1.5zM12 10.5a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5zM5.023 6.25a.75.75 0 0 1 .75-.75h12.454a.75.75 0 0 1 0 1.5H5.773a.75.75 0 0 1-.75-.75zM12 17.25a.75.75 0 0 1 .75.75v5.25H11.25v-5.25a.75.75 0 0 1 .75-.75zM3.869 9.117a.75.75 0 0 1 .188 1.05l-2.062 3.572a.75.75 0 1 1-1.299-.75l2.062-3.572a.75.75 0 0 1 1.11-.2zM21.293 8.367a.75.75 0 0 1 1.11.2l2.062 3.572a.75.75 0 1 1-1.3.75l-2.06-3.573a.75.75 0 0 1 .188-1.05z" /></svg>,
    color: 'gray'
  },
  'Al-Nadhir': {
    title: 'Al-Nadhir',
    role: 'The Counterpart',
    icon: <DuelingSwordsIcon className="w-7 h-7" />,
    color: 'teal'
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
        teal: 'border-teal-500 shadow-teal-500/30',
        slate: 'border-slate-500 shadow-slate-500/30',
        gray: 'border-gray-500 shadow-gray-500/30',
    },
    thinking: {
        blue: 'border-blue-500/50',
        red: 'border-red-500/50',
        purple: 'border-purple-500/50',
        amber: 'border-amber-500/50',
        teal: 'border-teal-500/50',
        slate: 'border-slate-500/50',
        gray: 'border-gray-500/50',
    }
};

export const CouncilMemberNode: React.FC<CouncilMemberNodeProps> = ({ persona, state, onOpenNadhirModal, onResumeDebate, isDebatePaused }) => {
  const config = personaConfig[persona];
  if (!config) return null;

  const isSpeaking = state.status === 'speaking';
  const isThinking = state.status === 'thinking';
  
  // @ts-ignore
  const glowClass = isSpeaking ? `shadow-lg ${statusClasses.speaking[config.color]}` : isThinking ? `shadow-md ${statusClasses.thinking[config.color]}` : 'border-slate-700';
  const textColorClass = `text-${config.color === 'gray' ? 'slate' : config.color}-400`;
  const titleColorClass = `text-${config.color === 'gray' ? 'slate' : config.color}-300`;

  return (
    <div className={`bg-slate-800 rounded-lg p-3 border-2 ${glowClass} transition-all duration-300 flex flex-col relative`}>
      {/* NEW: Conditional button for Al-Hakim */}
      {persona === 'Al-Hakim' && isDebatePaused && onResumeDebate && (
          <button
            onClick={onResumeDebate}
            className="absolute -top-4 right-4 flex items-center gap-2 bg-gradient-to-r from-amber-500 to-red-600 text-white font-bold px-3 py-1.5 rounded-full text-xs shadow-lg hover:scale-105 transition-transform animate-pulse z-10"
            title="Challenge the Verdict and Resume Debate"
          >
            <ChallengeIcon className="w-4 h-4" />
            CABAR KEPUTUSAN
          </button>
      )}

      <div className="flex items-center gap-3 mb-2">
        {persona === 'Al-Nadhir' ? (
            <div className="flex flex-col items-center gap-1">
                {onOpenNadhirModal && (
                    <button
                    onClick={onOpenNadhirModal}
                    className="p-1.5 rounded-md text-teal-400 bg-teal-500/10 hover:bg-teal-500/30 transition-colors shrink-0"
                    title="Inject idea for Al-Nadhir"
                    aria-label="Inject idea for Al-Nadhir"
                    >
                    <SyringeIcon />
                    </button>
                )}
                <div className={textColorClass}>{config.icon}</div>
            </div>
        ) : (
            <div className={textColorClass}>{config.icon}</div>
        )}

        <div className="flex-grow">
          <h3 className={`font-bold text-lg ${titleColorClass}`}>{config.title}</h3>
          <p className="text-xs text-slate-400 font-medium">{config.role}</p>
        </div>

        {isThinking && <SpinnerIcon />}
      </div>
      <div className="text-sm text-slate-300 min-h-[40px] flex-grow mt-1 pt-2 border-t border-slate-700/50">
        <p className={`${isSpeaking ? 'opacity-100' : 'opacity-60 italic'} break-words`}>
            {state.statement || "Waiting..."}
        </p>
      </div>
    </div>
  );
};
