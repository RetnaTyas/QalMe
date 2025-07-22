import React from 'react';
import {
  ChatMessage,
  SessionState,
  MuzakarahState,
  SessionTurn,
  HakimVerdict,
  MizanInstruction,
} from '../types';
import { GeminiService } from './geminiService';
import { dispatcher } from './dispatcher';
import { DebateManager } from './DebateManager';
import { promptManager } from './promptManager';

class Orchestrator {
  private setMessages: (fn: (prev: ChatMessage[]) => ChatMessage[]) => void = () => {};
  private setMuzakarahState: (value: React.SetStateAction<MuzakarahState>) => void = () => {};
  private setIsLoading: (loading: boolean) => void = () => {};
  private setSessionState: (fn: (prev: SessionState) => SessionState) => void = () => {};
  
  private geminiService: GeminiService | null = null;
  private nadhirIdeaQueue: string[] = [];
  
  public initialize(apiKey: string) {
    this.geminiService = new GeminiService();
    this.geminiService.initialize(apiKey);
  }

  public registerUIUpdaters(setters: {
    setMessages: (fn: (prev: ChatMessage[]) => ChatMessage[]) => void;
    setMuzakarahState: (value: React.SetStateAction<MuzakarahState>) => void;
    setIsLoading: (loading: boolean) => void;
    setSessionState: (fn: (prev: SessionState) => SessionState) => void;
  }) {
    this.setMessages = setters.setMessages;
    this.setMuzakarahState = setters.setMuzakarahState;
    this.setIsLoading = setters.setIsLoading;
    this.setSessionState = setters.setSessionState;
  }
  
  public injectIdeaForNadhir(idea: string) {
    if (idea.trim()) {
        this.nadhirIdeaQueue.push(idea);
        // In a real app, a toast notification would be shown here.
        alert(`Idea Injected for Al-Nadhir: "${idea}"`);
    }
  }

  private getInitialMuzakarahState(): MuzakarahState {
      return {
          status: 'deliberating',
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
      };
  }
  
  private dequeueNadhirIdea = (): string | undefined => {
    return this.nadhirIdeaQueue.shift();
  }

  private handleErrorState(errorMessage: string) {
    this.setMuzakarahState(prev => ({
        ...prev,
        status: 'error',
        deliberationTranscript: [...prev.deliberationTranscript, {
          turn: prev.deliberationTranscript.length,
          speaker: 'System',
          statement: `Error: ${errorMessage}`,
          isIntervention: true,
        }]
    }));
    const botMessage: ChatMessage = {
      id: `bot-error-${Date.now()}`,
      text: `I apologize, but the Deliberative Council encountered an error: ${errorMessage}`,
      sender: 'bot',
    };
    this.setMessages(prev => [...prev, botMessage]);
  }

  public async handleUserMessage(userInput: string, currentSessionState: SessionState) {
    if (!userInput.trim() || !this.geminiService) return;
    
    this.setIsLoading(true);
    const userMessage: ChatMessage = { id: `user-${Date.now()}`, text: userInput, sender: 'user' };
    this.setMessages(prev => [...prev, userMessage]);
    
    const initialMuzakarahState = this.getInitialMuzakarahState();
    const imamIntroTurn = { turn: 0, speaker: 'Al-Imam' as const, statement: `Menganalisis pertanyaan dan mengumpulkan maklumat...`, isIntervention: true };
    initialMuzakarahState.deliberationTranscript = [imamIntroTurn];
    this.setMuzakarahState(initialMuzakarahState);

    try {
      const { loadoutName, ragContext, ragSources } = await dispatcher.determineLoadout(this.geminiService, userInput);
      this.setMuzakarahState(prev => ({ ...prev, deliberationTranscript: [...prev.deliberationTranscript, {turn: 1, speaker: 'Al-Imam', statement: `Loadout terpilih: ${loadoutName}. Memulakan perdebatan...`, isIntervention: true}]}));

      const prompts = promptManager.getActivePrompts();
      const loadoutPrompts = prompts[loadoutName];
      const specialPrompts = {
          nadhir: prompts['Special: Nadhir']['Al-Nadhir'],
          hakim: prompts['Special: Hakim']['Al-Hakim'],
      };

      const debateManager = new DebateManager({
          geminiService: this.geminiService,
          prompts: loadoutPrompts,
          specialPrompts: specialPrompts,
          updateUI: (state: MuzakarahState) => this.setMuzakarahState(state),
          initialState: initialMuzakarahState,
          initialQuery: userInput,
          ragContext: ragContext,
          loadoutName: loadoutName,
      });

      const injectedIdea = this.dequeueNadhirIdea();
      const { finalResponseText, finalMuzakarahState, finalVerdict } = await debateManager.runDebate(injectedIdea);

      const finalBotMessage: ChatMessage = {
          id: `bot-${Date.now()}`,
          text: finalResponseText,
          sender: 'bot',
          metadata: {
              sources: ragSources,
              verdict: finalVerdict
          },
          turnId: currentSessionState.history.length
      };

      this.setMessages(prev => [...prev, finalBotMessage]);

      const finalTurn: Omit<SessionTurn, 'turnId'> = {
          userQuery: userInput,
          muzakarahState: finalMuzakarahState,
          ragContext: ragContext,
          ragSources: ragSources,
          finalResponse: finalBotMessage
      };

      this.setSessionState(prev => ({
          sessionId: prev.sessionId || `session-${Date.now()}`,
          history: [...prev.history, { ...finalTurn, turnId: prev.history.length }]
      }));

    } catch (error) {
      const message = error instanceof Error ? error.message : "An unknown error occurred during orchestration.";
      console.error("Orchestration failed:", error);
      this.handleErrorState(message);
    } finally {
      this.setIsLoading(false);
    }
  }

  public async resumeDebate(currentSessionState: SessionState) {
    const lastTurn = currentSessionState.history[currentSessionState.history.length - 1];
    if (!lastTurn || lastTurn.muzakarahState.status !== 'paused_for_verdict' || !this.geminiService) {
        console.error("No valid verdict to challenge or debate is not paused.");
        return;
    }

    this.setIsLoading(true);
    this.setMuzakarahState(prev => ({ ...prev, status: 'deliberating' }));

    try {
        const prompts = promptManager.getActivePrompts();
        const challengePrompt = prompts['Special: Faqih Challenge']['Al-Faqih'];
        const loadoutName = lastTurn.finalResponse.metadata?.verdict?.loadoutName || 'Loadout Alpha: Majelis Fiqh & Doktrin';

        const debateManager = new DebateManager({
            geminiService: this.geminiService,
            prompts: { // We need to reconstruct this from the last turn.
              'Al-Khatib': (prompts[loadoutName] as any)?.['Al-Khatib'],
              'Al-Faqih': challengePrompt, // The crucial override!
              'Al-Hypothesis': (prompts[loadoutName] as any)?.['Al-Hypothesis'],
            },
            specialPrompts: {
                nadhir: prompts['Special: Nadhir']['Al-Nadhir'],
                hakim: prompts['Special: Hakim']['Al-Hakim'],
            },
            updateUI: (state: MuzakarahState) => this.setMuzakarahState(state),
            initialState: lastTurn.muzakarahState,
            initialQuery: lastTurn.userQuery,
            ragContext: lastTurn.ragContext,
            loadoutName: loadoutName,
        });

        const injectedIdea = this.dequeueNadhirIdea();
        const { finalResponseText, finalMuzakarahState, finalVerdict } = await debateManager.resumeDebateFromChallenge(
            lastTurn.finalResponse.metadata?.verdict,
            injectedIdea
        );
        
        const revisedBotMessage: ChatMessage = {
            id: `bot-revised-${Date.now()}`,
            text: finalResponseText,
            sender: 'bot',
            metadata: {
                sources: lastTurn.ragSources,
                verdict: finalVerdict
            },
            turnId: lastTurn.turnId,
            isRevision: true
        };

        // Replace the last message (the one with the verdict) with the new, revised message.
        this.setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = revisedBotMessage;
            return newMessages;
        });
        
        // Replace the last turn in history with the new, fully concluded turn.
        const finalTurn: SessionTurn = {
            turnId: lastTurn.turnId,
            userQuery: lastTurn.userQuery,
            muzakarahState: finalMuzakarahState,
            ragContext: lastTurn.ragContext,
            ragSources: lastTurn.ragSources,
            finalResponse: revisedBotMessage
        };

        this.setSessionState(prev => {
            const newHistory = [...prev.history];
            newHistory[newHistory.length - 1] = finalTurn;
            return { ...prev, history: newHistory };
        });

    } catch (error) {
       const message = error instanceof Error ? error.message : "An unknown error occurred during debate resumption.";
       console.error("Failed to resume debate:", error);
       this.handleErrorState(message);
    } finally {
      this.setIsLoading(false);
    }
  }
}

const appOrchestrator = new Orchestrator();
export default appOrchestrator;