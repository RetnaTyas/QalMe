import React from 'react';
import {
  Message as ChatMessage,
  SessionState,
  MuzakarahState,
  Turn as SessionTurn,
} from '../types';

class Orchestrator {
  private setMessages: (fn: (prev: ChatMessage[]) => ChatMessage[]) => void = () => {};
  private setMuzakarahState: (value: React.SetStateAction<MuzakarahState>) => void = () => {};
  private setIsLoading: (loading: boolean) => void = () => {};
  private setSessionState: (fn: (prev: SessionState) => SessionState) => void = () => {};

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
  
  private async postToServer(endpoint: string, body: object) {
      const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }
      return response.json();
  }

  private handleErrorState(errorMessage: string) {
    this.setMuzakarahState((prev: MuzakarahState) => ({
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
    this.setMessages((prev: ChatMessage[]) => [...prev, botMessage]);
  }

  public async handleUserMessage(userInput: string, currentSessionState: SessionState, apiKey: string, nadhirIdea?: string) {
    if (!userInput.trim()) return;
    
    this.setIsLoading(true);
    const userMessage: ChatMessage = { id: `user-${Date.now()}`, text: userInput, sender: 'user' };
    this.setMessages(prev => [...prev, userMessage]);
    
    const initialMuzakarahState: MuzakarahState = {
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
        deliberationTranscript: [{ turn: 0, speaker: 'Al-Imam', statement: `Analyzing query and gathering information...`, isIntervention: true }],
    };
    this.setMuzakarahState(initialMuzakarahState);

    try {
      // The entire debate logic is now on the server.
      // We pass the key with every request.
      const result = await this.postToServer('/api/orchestrate', {
        userInput,
        sessionState: currentSessionState,
        apiKey,
        nadhirIdea
      });
      
      const { finalResponseText, finalMuzakarahState, finalVerdict, ragSources } = result;
      this.setMuzakarahState(finalMuzakarahState);

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

      this.setMessages((prev: ChatMessage[]) => [...prev, finalBotMessage]);

      const newTurn: SessionTurn = {
          id: currentSessionState.history.length,
          userQuery: userInput,
          sarcasticResponse: '',
          sarcasmExplanation: {
              literal_meaning: '',
              intended_meaning: '',
              sarcasm_mechanisms: [],
          },
          pipeline: [],
      };

      this.setSessionState((prev: SessionState) => ({
          sessionId: prev.sessionId || `session-${Date.now()}`,
          history: [...prev.history, newTurn]
      }));

    } catch (error) {
      const message = error instanceof Error ? error.message : "An unknown error occurred during orchestration.";
      console.error("Orchestration failed:", error);
      this.handleErrorState(message);
    } finally {
      this.setIsLoading(false);
    }
  }

  public async resumeDebate(lastTurn: SessionTurn, apiKey: string, nadhirIdea?: string) {
    if (!lastTurn) {
        console.error("No valid verdict to challenge or debate is not paused.");
        return;
    }

    this.setIsLoading(true);
    this.setMuzakarahState(prev => ({ ...prev, status: 'deliberating' }));

    try {
        const result = await this.postToServer('/api/resume', {
            lastTurn,
            apiKey,
            nadhirIdea,
        });

        const { finalResponseText, finalVerdict, ragSources } = result;

        const revisedBotMessage: ChatMessage = {
            id: `bot-revised-${Date.now()}`,
            text: finalResponseText,
            sender: 'bot',
            metadata: {
                sources: ragSources,
                verdict: finalVerdict
            },
            turnId: lastTurn.id,
            isRevision: true
        };

        this.setMessages((prev: ChatMessage[]) => {
            const newMessages = [...prev];
            const msgIndex = newMessages.findIndex(m => m.turnId === lastTurn.id && m.sender === 'bot');
            if(msgIndex > -1) newMessages[msgIndex] = revisedBotMessage;
            else newMessages.push(revisedBotMessage);
            return newMessages;
        });
        
        const finalTurn: SessionTurn = {
            id: lastTurn.id,
            userQuery: lastTurn.userQuery,
            sarcasticResponse: '',
            sarcasmExplanation: {
                literal_meaning: '',
                intended_meaning: '',
                sarcasm_mechanisms: [],
            },
            pipeline: [],
        };

        this.setSessionState((prev: SessionState) => {
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

export const appOrchestrator = new Orchestrator();
