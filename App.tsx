import React, { useState, useCallback, useEffect } from 'react';
import { ChatPanel } from './components/ChatPanel';
import { DeliberationCouncil } from './components/ReasoningPipeline';
import { SarcasticObserver } from './components/SarcasticObserver';
import { ChatMessage, SessionState, DialogueState, SessionTurn, MuzakarahState } from './types';
import appOrchestrator from './services/orchestrator';

const getInitialMuzakarahState = (): MuzakarahState => ({
  status: 'concluded',
  participants: {
      'Al-Khatib': { status: 'waiting', statement: '' },
      'Al-Faqih': { status: 'waiting', statement: '' },
      'Al-Hypothesis': { status: 'waiting', statement: '' },
      'Al-Mizan': { status: 'governing', statement: '' },
      'Al-Mudawwin': { status: 'waiting', statement: '' },
  },
  deliberationTranscript: [],
});

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [muzakarahState, setMuzakarahState] = useState<MuzakarahState>(getInitialMuzakarahState());
  const [isChatFullscreen, setIsChatFullscreen] = useState(false);
  const [sessionState, setSessionState] = useState<SessionState>({ sessionId: null, history: [] });
  const [dialogueState, setDialogueState] = useState<DialogueState>('new_query');

  // Register the UI updaters with the orchestrator on initial render
  useEffect(() => {
    appOrchestrator.registerUIUpdaters({
      setMessages,
      setMuzakarahState,
      setIsLoading,
      setSessionState,
      setDialogueState,
    });
  }, []); // No dependencies needed, as the orchestrator is a stable singleton.

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const currentInput = userInput;
    if (!currentInput.trim()) return;
    setUserInput(''); // Clear input immediately
    // Pass the current session state to the handler, making the orchestrator less stateful.
    await appOrchestrator.handleUserMessage(currentInput, sessionState);
  }, [userInput, sessionState]); // sessionState is now a dependency.

  const handleChallengeClick = useCallback((turnId: number) => {
    // This is currently disabled in the new architecture, but the hook remains.
    appOrchestrator.setChallenge(turnId);
  }, []);

  const lastTurn = sessionState.history.length > 0 ? sessionState.history[sessionState.history.length - 1] : null;

  return (
    <div className="min-h-screen bg-slate-900 p-4 lg:p-8 flex flex-col">
       <SarcasticObserver messages={messages} lastTurn={lastTurn} />
       <header className="text-center mb-6">
        <h1 className="text-3xl lg:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
          Gemini Deliberative Council
        </h1>
        <p className="text-slate-400 mt-2">
          Witness the AI's internal debate in real-time.
        </p>
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
          dialogueState={dialogueState}
          onChallenge={handleChallengeClick}
        />
        {!isChatFullscreen && <DeliberationCouncil state={muzakarahState} userQuery={lastTurn?.userQuery || null} />}
      </main>
    </div>
  );
}

export default App;
