
import React, { useRef, useEffect, useState } from 'react';
import { ChatMessage, DialogueState } from '../types';
import { SendIcon, UserIcon, BotIcon, SpinnerIcon, ExpandIcon, CollapseIcon, ChallengeIcon } from './icons';

interface ChatPanelProps {
  messages: ChatMessage[];
  userInput: string;
  onUserInput: (value: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  isLoading: boolean;
  isChatFullscreen: boolean;
  onToggleFullscreen: (isFull: boolean) => void;
  dialogueState: DialogueState;
  onChallenge: (turnId: number) => void;
}

const ChatMessageItem: React.FC<{ message: ChatMessage; onChallenge: (turnId: number) => void; isLoading: boolean; }> = ({ message, onChallenge, isLoading }) => {
  const isUser = message.sender === 'user';
  const sources = message.metadata?.sources;

  return (
    <div className={`flex items-start gap-3 my-4 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-cyan-400">
          <BotIcon />
        </div>
      )}
      <div className={`max-w-md lg:max-w-xl px-4 py-3 rounded-lg relative group ${isUser ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
        {message.isRevision && (
            <div className="absolute -top-2.5 -right-2.5 text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full shadow-md font-semibold">
                Revised
            </div>
        )}
        <p className="whitespace-pre-wrap">{message.text}</p>
        {sources && sources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-600">
            <h4 className="text-xs font-semibold text-slate-400 mb-2">Sources:</h4>
            <ul className="space-y-1">
              {sources.map((source, index) => (
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
        {!isUser && message.isChallengeable && (
             <div className="absolute -bottom-4 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onChallenge(message.turnId!)}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 bg-slate-600 hover:bg-slate-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-slate-200 px-2 py-1 rounded-md text-xs shadow-lg transition-all"
                    title="Challenge this response"
                >
                    <ChallengeIcon className="h-4 w-4" />
                    Challenge
                </button>
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

export const ChatPanel: React.FC<ChatPanelProps> = ({ messages, userInput, onUserInput, onSendMessage, isLoading, isChatFullscreen, onToggleFullscreen, dialogueState, onChallenge }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [isInputExpanded, setIsInputExpanded] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const getPlaceholderText = () => {
      if (isLoading) return "Waiting for response...";
      if (dialogueState === 'challenging') return "Enter your counter-argument... (Shift+Enter for new line)";
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
          <ChatMessageItem key={msg.id} message={msg} onChallenge={onChallenge} isLoading={isLoading} />
        ))}
        {isLoading && messages.length > 0 && messages[messages.length-1].sender === 'user' && (
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
              className={`w-full bg-slate-700 border rounded-md py-2 pl-3 pr-9 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-200 resize-none ${dialogueState === 'challenging' ? 'border-purple-500 focus:ring-purple-400' : 'border-slate-600 focus:ring-cyan-500'}`}
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
        <button
          type="submit"
          disabled={isLoading || !userInput.trim()}
          className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-all duration-300 transform flex items-center justify-center h-10 w-10 shrink-0 self-end"
        >
          {isLoading ? <SpinnerIcon /> : <SendIcon />}
        </button>
      </form>
    </div>
  );
};
