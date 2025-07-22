

import React, { useRef, useEffect, useState } from 'react';
import { Message as ChatMessage, HakimVerdict } from '../types';
import { SendIcon, UserIcon, BotIcon, SpinnerIcon, ExpandIcon, CollapseIcon, CopyIcon, CheckIcon, ChevronDownIcon, ChevronUpIcon } from './icons';

interface ChatPanelProps {
  messages: ChatMessage[];
  userInput: string;
  onUserInput: (value: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  isLoading: boolean;
  isChatFullscreen: boolean;
  onToggleFullscreen: (isFull: boolean) => void;
}

const VerdictIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 1.5a.75.75 0 0 1 .75.75V7.5h-1.5V2.25A.75.75 0 0 1 12 1.5zM12 10.5a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5zM5.023 6.25a.75.75 0 0 1 .75-.75h12.454a.75.75 0 0 1 0 1.5H5.773a.75.75 0 0 1-.75-.75zM12 17.25a.75.75 0 0 1 .75.75v5.25H11.25v-5.25a.75.75 0 0 1 .75-.75zM3.869 9.117a.75.75 0 0 1 .188 1.05l-2.062 3.572a.75.75 0 1 1-1.299-.75l2.062-3.572a.75.75 0 0 1 1.11-.2zM21.293 8.367a.75.75 0 0 1 1.11.2l2.062 3.572a.75.75 0 1 1-1.3.75l-2.06-3.573a.75.75 0 0 1 .188-1.05z" /></svg>
);

const HakimVerdictDisplay: React.FC<{ verdict: HakimVerdict }> = ({ verdict }) => {
    const [isMatrixOpen, setIsMatrixOpen] = useState(false);
    const [isVerdictCopied, setIsVerdictCopied] = useState(false);

    const evaluationEntries = Object.entries(verdict.evaluationMatrix);
    const totalScore = evaluationEntries.reduce((acc, [, criteria]) => acc + criteria.score, 0);
    const averageScore = evaluationEntries.length > 0 ? totalScore / evaluationEntries.length : 0;

    const getScoreColor = (score: number) => {
        if (score > 0.75) return 'bg-green-500';
        if (score > 0.5) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const formatCriteriaKey = (key: string) => {
        return key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
    };
    
    const handleCopyVerdict = () => {
        if (!verdict) return;

        const evaluationText = Object.entries(verdict.evaluationMatrix)
            .map(([key, criteria]) => {
                const formattedKey = formatCriteriaKey(key);
                const scorePercent = Math.round(criteria.score * 100);
                return `- ${formattedKey}: ${scorePercent}% - ${criteria.justification}`;
            })
            .join('\n');

        const textToCopy = `
Al-Hakim's Verdict
=====================
Final Verdict: "${verdict.finalVerdict}"

Winning Argument Summary:
${verdict.winningArgumentSummary}

Evaluation Matrix
--------------------
${evaluationText}
        `.trim().replace(/^\s+/gm, '');

        navigator.clipboard.writeText(textToCopy).then(() => {
            setIsVerdictCopied(true);
            setTimeout(() => setIsVerdictCopied(false), 2500);
        });
    };

    return (
        <div className="mt-4 pt-3 border-t border-slate-600">
            <div className="flex items-center justify-between gap-2 text-slate-300">
                <div className="flex items-center gap-2">
                    <VerdictIcon className="w-5 h-5 text-slate-400" />
                    <h4 className="text-sm font-bold">Al-Hakim's Verdict</h4>
                </div>
                <button
                    onClick={handleCopyVerdict}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 transition-colors disabled:opacity-50"
                    title={isVerdictCopied ? 'Verdict copied!' : 'Copy verdict text'}
                    aria-label={isVerdictCopied ? 'Verdict copied to clipboard' : 'Copy verdict text to clipboard'}
                    disabled={isVerdictCopied}
                >
                    {isVerdictCopied ? (
                        <>
                            <CheckIcon className="w-3.5 h-3.5 text-green-400" />
                            Copied
                        </>
                    ) : (
                        <>
                            <CopyIcon className="w-3.5 h-3.5" />
                            Copy
                        </>
                    )}
                </button>
            </div>
            <p className="text-sm italic text-slate-400 my-2">"{verdict.finalVerdict}"</p>
            
            <button onClick={() => setIsMatrixOpen(!isMatrixOpen)} className="w-full text-left text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 my-2 focus:outline-none">
                {isMatrixOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                Evaluation Matrix (Overall Score: {Math.round(averageScore * 100)}%)
            </button>
            
            {isMatrixOpen && (
                <div className="space-y-3 p-3 bg-slate-800/50 rounded-md animate-fade-in-up">
                    {evaluationEntries.map(([key, criteria]) => (
                        <div key={key}>
                            <div className="flex justify-between items-center text-xs mb-1">
                                <span className="font-semibold text-slate-300">{formatCriteriaKey(key)}</span>
                                <span className="font-mono text-slate-400">{Math.round(criteria.score * 100)}%</span>
                            </div>
                            <div className="w-full bg-slate-600 rounded-full h-2">
                                <div className={`${getScoreColor(criteria.score)} h-2 rounded-full transition-all duration-500`} style={{ width: `${criteria.score * 100}%` }}></div>
                            </div>
                            <p className="text-xs text-slate-400 mt-1 italic">
                                {criteria.justification}
                            </p>
                        </div>
                    ))}
                    <div className="border-t border-slate-700 pt-2 mt-3">
                        <p className="text-xs font-semibold text-slate-300">Winning Argument:</p>
                        <p className="text-xs text-slate-400 italic">{verdict.winningArgumentSummary}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

const ChatMessageItem: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.sender === 'user';
  const sources = message.metadata?.sources;
  const verdict = message.metadata?.verdict;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!message.text) return;
    navigator.clipboard.writeText(message.text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    });
  };

  return (
    <div className={`flex items-start gap-3 my-4 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-cyan-400">
          <BotIcon />
        </div>
      )}
      <div className={`max-w-md lg:max-w-xl px-4 py-3 rounded-lg relative group ${isUser ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
        {!isUser && (
            <button 
                onClick={handleCopy}
                className="absolute top-2 right-2 p-1 rounded-md text-slate-400 bg-slate-800/50 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                title={copied ? 'Copied!' : 'Copy text'}
                aria-label={copied ? 'Message text copied to clipboard' : 'Copy message text to clipboard'}
            >
                {copied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <CopyIcon className="w-4 h-4" />}
            </button>
        )}
        {message.isRevision && (
            <div className="absolute -top-2.5 -right-2.5 text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full shadow-md font-semibold">
                Revised
            </div>
        )}
        <p className="whitespace-pre-wrap">{message.text}</p>
        
        {verdict && <HakimVerdictDisplay verdict={verdict} />}
        
        {sources && sources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-600">
            <h4 className="text-xs font-semibold text-slate-400 mb-2">Sources:</h4>
            <ul className="space-y-1">
              {sources.map((source: { uri: string; title: string }, index: number) => (
                <li key={index} className="truncate">
                  <a
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 text-xs underline"
                    title={source.title}
                  >
                    {`[${index + 1}] ${source.title || source.uri}`}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
       {isUser && (
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
          <UserIcon />
        </div>
      )}
    </div>
  );
};

export const ChatPanel: React.FC<ChatPanelProps> = ({ messages, userInput, onUserInput, onSendMessage, isLoading, isChatFullscreen, onToggleFullscreen }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [isInputExpanded, setIsInputExpanded] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const getPlaceholderText = () => {
      if (isLoading) return "Waiting for response...";
      return "Ask me anything... (Shift+Enter for new line)";
  }

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      if (isInputExpanded) {
        textareaRef.current.style.height = '128px'; // 8rem
        textareaRef.current.style.overflowY = 'auto';
      } else {
        // Auto-grow
        textareaRef.current.style.height = 'auto';
        const scrollHeight = textareaRef.current.scrollHeight;
        const maxHeight = 96; // 6rem
        if (scrollHeight > maxHeight) {
            textareaRef.current.style.height = `${maxHeight}px`;
            textareaRef.current.style.overflowY = 'auto';
        } else {
            textareaRef.current.style.height = `${scrollHeight}px`;
            textareaRef.current.style.overflowY = 'hidden';
        }
      }
    }
  }, [userInput, isInputExpanded]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (formRef.current && !isLoading && userInput.trim()) {
        formRef.current.requestSubmit();
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-800/50 p-4 rounded-lg border border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-slate-200">Chat Interface</h2>
        <button
          onClick={() => onToggleFullscreen(!isChatFullscreen)}
          className="p-1.5 text-slate-400 hover:text-slate-100 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
          aria-label={isChatFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          title={isChatFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isChatFullscreen
            ? <CollapseIcon className="w-5 h-5" />
            : <ExpandIcon className="w-5 h-5" />}
        </button>
      </div>
      <div className="flex-grow overflow-y-auto mb-4 pr-2">
        {messages.map((msg) => (
          <ChatMessageItem key={msg.id} message={msg} />
        ))}
        {isLoading && (
           <div className="flex items-start gap-3 my-4">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-cyan-400">
                <BotIcon />
              </div>
              <div className="max-w-md lg:max-w-lg px-4 py-3 rounded-lg bg-slate-700 flex items-center space-x-2">
                <SpinnerIcon />
                <span className="text-slate-400">Thinking...</span>
              </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form ref={formRef} onSubmit={onSendMessage} className="flex items-start gap-2 border-t border-slate-700 pt-4">
        <div className="flex-grow relative">
            <textarea
              ref={textareaRef}
              value={userInput}
              onChange={(e) => onUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={getPlaceholderText()}
              disabled={isLoading}
              className="w-full bg-slate-700 border rounded-md py-2 pl-3 pr-9 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-200 resize-none border-slate-600 focus:ring-cyan-500"
              rows={1}
              style={{ overflowY: 'hidden' }}
            />
            <button
              type="button"
              onClick={() => setIsInputExpanded(prev => !prev)}
              className="absolute right-1.5 top-1.5 p-1.5 text-slate-400 hover:text-slate-100 rounded-md focus:outline-none"
              aria-label={isInputExpanded ? 'Collapse input' : 'Expand input'}
              title={isInputExpanded ? 'Collapse input' : 'Expand input'}
            >
              {isInputExpanded ? <CollapseIcon className="w-4 h-4" /> : <ExpandIcon className="w-4 h-4" />}
            </button>
        </div>
        <div className="self-end">
            <button
              type="submit"
              disabled={isLoading || !userInput.trim()}
              className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-all duration-300 transform flex items-center justify-center h-10 w-10 shrink-0"
              aria-label="Send message"
            >
              {isLoading ? <SpinnerIcon /> : <SendIcon />}
            </button>
        </div>
      </form>
    </div>
  );
};
