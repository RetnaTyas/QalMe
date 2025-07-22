import React, { useState, useCallback, useEffect } from 'react';
import { ChatPanel } from './components/ChatPanel';
import { DeliberationCouncil } from './components/ReasoningPipeline';
import { SarcasticObserver } from './components/SarcasticObserver';
import { NadhirInjectionModal } from './components/NadhirInjectionModal';
import { SettingsModal } from './components/SettingsModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { ChatMessage, SessionState, MuzakarahState } from './types';
import { appOrchestrator } from './services/orchestrator';
import { apiKeyManager } from './services/apiKeyManager';

const getInitialMuzakarahState = (): MuzakarahState => ({
  status: 'concluded',
  participants: {
      'Al-Khatib': { status: 'waiting', statement: '' },
      'Al-Faqih': { status: 'waiting', statement: '' },
      'Al-Hypothesis': { status: 'waiting', statement: '' },
      'Al-Nadhir': { status: 'waiting', statement: '' },
      'Al-Mizan': { status: 'governing', statement: '' },
      'Al-Mudawwin': { status: 'waiting', statement: '' },
      'Al-Hakim': { status: 'waiting', statement: '' },
  },
  deliberationTranscript: [],
});

function App() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [muzakarahState, setMuzakarahState] = useState<MuzakarahState>(getInitialMuzakarahState());
  const [isChatFullscreen, setIsChatFullscreen] = useState(false);
  const [sessionState, setSessionState] = useState<SessionState>({ sessionId: null, history: [] });
  
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isNadhirModalOpen, setIsNadhirModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Nadhir idea queue on the client
  const [nadhirIdea, setNadhirIdea] = useState<string | undefined>(undefined);

  useEffect(() => {
    const existingKey = apiKeyManager.get();
    if (existingKey) {
      setApiKey(existingKey);
    } else {
      setIsApiKeyModalOpen(true);
    }
    
    appOrchestrator.registerUIUpdaters({
      setMessages,
      setMuzakarahState,
      setIsLoading,
      setSessionState,
    });
  }, []);

  const handleApiKeySave = (key: string) => {
    apiKeyManager.set(key);
    setApiKey(key);
    setIsApiKeyModalOpen(false);
  };

  const handleClearApiKey = () => {
    if (confirm('Are you sure you want to clear your API key? You will need to re-enter it to use the app.')) {
      apiKeyManager.clear();
      setApiKey(null);
      setMessages([]);
      setMuzakarahState(getInitialMuzakarahState());
      setSessionState({ sessionId: null, history: [] });
      setIsApiKeyModalOpen(true);
    }
  };

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const currentInput = userInput;
    if (!currentInput.trim() || isLoading || !apiKey) return;
    setUserInput(''); // Clear input immediately
    
    await appOrchestrator.handleUserMessage(currentInput, sessionState, apiKey, nadhirIdea);
    setNadhirIdea(undefined); // Consume the idea
  }, [userInput, sessionState, isLoading, apiKey, nadhirIdea]);

  const handleInjectIdea = useCallback((idea: string) => {
    if (!idea.trim()) return;
    setNadhirIdea(idea); // Queue the idea for the next message
    setIsNadhirModalOpen(false);
    alert(`Idea Injected for Al-Nadhir: "${idea}". It will be used with your next message.`);
  }, []);

  const handleResumeDebate = useCallback(async () => {
    if (isLoading || !apiKey) return;
    const lastTurn = sessionState.history[sessionState.history.length - 1];
    if (!lastTurn) return;

    await appOrchestrator.resumeDebate(lastTurn, apiKey, nadhirIdea);
    setNadhirIdea(undefined); // Consume the idea
  }, [sessionState, isLoading, apiKey, nadhirIdea]);

  const lastTurn = sessionState.history.length > 0 ? sessionState.history[sessionState.history.length - 1] : null;

  if (!apiKey) {
    return <ApiKeyModal isOpen={isApiKeyModalOpen} onSave={handleApiKeySave} />;
  }

  return (
    <div className="min-h-screen p-4 lg:p-8 flex flex-col">
       <SarcasticObserver messages={messages} lastTurn={lastTurn} apiKey={apiKey} />
       <header className="text-center mb-6 relative">
        <h1 className="text-3xl lg:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
          Gemini Deliberative Council
        </h1>
        <p className="text-slate-400 mt-2">
          Witness the AI's internal debate in real-time.
        </p>
        <div className="absolute top-0 right-0">
            <button 
                onClick={() => setIsSettingsModalOpen(true)}
                className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-3 rounded-md text-sm transition-colors duration-200"
                title="Settings"
            >
                Settings
            </button>
        </div>
      </header>
      <main className={`flex-grow grid grid-cols-1 ${!isChatFullscreen && 'lg:grid-cols-2'} gap-6 max-w-7xl mx-auto w-full h-[calc(100vh-150px)]`}>
        <ChatPanel 
          messages={messages}
          userInput={userInput}
          onUserInput={setUserInput}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          isChatFullscreen={isChatFullscreen}
          onToggleFullscreen={setIsChatFullscreen}
        />
        {!isChatFullscreen && <DeliberationCouncil 
          state={muzakarahState} 
          userQuery={lastTurn?.userQuery || null} 
          onOpenNadhirModal={() => setIsNadhirModalOpen(true)}
          onResumeDebate={handleResumeDebate}
        />}
      </main>
      
      <NadhirInjectionModal 
        isOpen={isNadhirModalOpen}
        onClose={() => setIsNadhirModalOpen(false)}
        onInject={handleInjectIdea}
        isLoading={isLoading}
      />
      
      <SettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onManageApiKey={() => {
            setIsSettingsModalOpen(false);
            setIsApiKeyModalOpen(true);
        }}
        onClearApiKey={handleClearApiKey}
      />
    </div>
  );
}

export default App;
