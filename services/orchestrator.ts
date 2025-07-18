import { runMuzakarah, DebateError, UIUpdaters } from './DebateManager';
import {
  ChatMessage,
  SessionState,
  DialogueState,
  MuzakarahState,
  DeliberationTurn,
  Persona,
  ParticipantStatus,
} from '../types';

/**
 * The Orchestrator acts as a Backend-for-Frontend (BFF).
 * It has been refactored to be a leaner controller that delegates complex logic,
 * primarily handling the interface between the UI and the core debate logic.
 */
class Orchestrator {
  private setMessages: (fn: (prev: ChatMessage[]) => ChatMessage[]) => void = () => {};
  private setMuzakarahState: (fn: (prev: MuzakarahState) => MuzakarahState) => void = () => {};
  private setIsLoading: (loading: boolean) => void = () => {};
  private setSessionState: (fn: (prev: SessionState) => SessionState) => void = () => {};
  private setDialogueState: (state: DialogueState) => void = () => {};

  public registerUIUpdaters(setters: {
    setMessages: (fn: (prev: ChatMessage[]) => ChatMessage[]) => void;
    setMuzakarahState: (fn: (prev: MuzakarahState) => MuzakarahState) => void;
    setIsLoading: (loading: boolean) => void;
    setSessionState: (fn: (prev: SessionState) => SessionState) => void;
    setDialogueState: (state: DialogueState) => void;
  }) {
    this.setMessages = setters.setMessages;
    this.setMuzakarahState = setters.setMuzakarahState;
    this.setIsLoading = setters.setIsLoading;
    this.setSessionState = setters.setSessionState;
    this.setDialogueState = setters.setDialogueState;
  }
  
  public setChallenge(turnId: number) {
      console.warn("Challenge functionality has been temporarily disabled for the new architecture.", turnId);
      this.setDialogueState('new_query');
  }

  private getInitialMuzakarahState(): MuzakarahState {
      const initialParticipantState = { status: 'waiting' as ParticipantStatus, statement: '' };
      return {
          status: 'deliberating',
          participants: {
              'Al-Khatib': { ...initialParticipantState },
              'Al-Faqih': { ...initialParticipantState },
              'Al-Hypothesis': { ...initialParticipantState },
              'Al-Mizan': { status: 'governing', statement: '' },
              'Al-Mudawwin': { ...initialParticipantState },
          },
          deliberationTranscript: [],
      };
  }
  
  // These helpers are passed to the DebateManager to give it controlled access to UI state setters.
  private updateParticipantState = (persona: Persona, status: ParticipantStatus, statement: string = '') => {
      if (persona === 'User' || persona === 'Al-Imam') return;
      this.setMuzakarahState(prev => ({
          ...prev,
          participants: {
              ...prev.participants,
              [persona]: { status, statement },
          }
      }));
  }
  
  private addTurnToTranscript = (turn: DeliberationTurn) => {
      this.setMuzakarahState(prev => ({
          ...prev,
          deliberationTranscript: [...prev.deliberationTranscript, turn]
      }));
  }

  public async handleUserMessage(userInput: string, currentSessionState: SessionState) {
    if (!userInput.trim()) return;
    this.setIsLoading(true);

    const userMessage: ChatMessage = { id: `user-${Date.now()}`, text: userInput, sender: 'user' };
    this.setMessages(prev => [...prev, userMessage]);
    this.setMuzakarahState(() => this.getInitialMuzakarahState());

    try {
        const uiUpdaters: UIUpdaters = {
            addTurnToTranscript: this.addTurnToTranscript,
            updateParticipantState: this.updateParticipantState,
        };
        
        const { finalTurn, finalMessage } = await runMuzakarah(userInput, uiUpdaters);

        this.setMessages(prev => [...prev, finalMessage]);
        
        const newSessionId = currentSessionState.sessionId || `session-${Date.now()}`;
        this.setSessionState(prev => ({
            sessionId: newSessionId,
            history: [...prev.history, { ...finalTurn, turnId: prev.history.length }]
        }));
        
        this.setMuzakarahState(prev => ({ ...prev, status: 'concluded' }));

    } catch (error) {
      const message = error instanceof DebateError 
        ? `Debate Error (${error.persona || 'System'}): ${error.message}`
        : error instanceof Error 
            ? error.message 
            : "An unknown error occurred.";
      this.handleErrorState(message);
    } finally {
      this.setIsLoading(false);
      this.setDialogueState('new_query');
    }
  }

  private handleErrorState(errorMessage: string) {
    this.setMuzakarahState(prev => ({
        ...prev,
        status: 'error'
    }));
    const botMessage: ChatMessage = {
      id: `bot-error-${Date.now()}`,
      text: `I apologize, but the Deliberative Council encountered an error: ${errorMessage}`,
      sender: 'bot',
    };
    this.setMessages(prev => [...prev, botMessage]);
  }
}

const appOrchestrator = new Orchestrator();
export default appOrchestrator;
