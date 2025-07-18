
import { geminiService } from './geminiService';
import { DeliberationTurn, MizanInstruction, Persona } from '../types';

/**
 * An abstraction layer for the reasoning AI models.
 * This allows swapping the underlying AI service (e.g., Gemini) without
 * changing the core application logic that calls it.
 */
export const reasoningProvider = {
  /**
   * Al-Imam: Generates initial context using a search-augmented tool.
   * @param prompt The user's initial query.
   * @returns A promise that resolves to the retrieved context and sources.
   */
  getContext: async (prompt: string): Promise<{ context: string; sources: { uri: string; title: string }[] }> => {
    const ragResponse = await geminiService.generateWithGoogleSearch(prompt);
    const groundingMetadata = ragResponse.candidates?.[0]?.groundingMetadata;
    const sources =
      groundingMetadata?.groundingChunks
        ?.filter(chunk => chunk.web?.uri)
        .map(chunk => ({ uri: chunk.web!.uri!, title: chunk.web!.title || chunk.web!.uri!, })) ?? [];
    const context = ragResponse.text;
    return { context, sources };
  },

  /**
   * Al-Khatib: Generates or refines an argument.
   */
  runKhatib: async (userQuery: string, context: string, transcript: DeliberationTurn[], instruction: string, loadout: string): Promise<string> => {
    return geminiService.runAlKhatib(userQuery, context, transcript, instruction, loadout);
  },

  /**
   * Al-Faqih: Critiques an argument.
   */
  runFaqih: async (userQuery: string, context: string, transcript: DeliberationTurn[], instruction: string, loadout: string): Promise<string> => {
    return geminiService.runAlFaqih(userQuery, context, transcript, instruction, loadout);
  },
  
  /**
   * Al-Hypothesis: Generates a deviant perspective.
   */
  runHypothesis: async (userQuery: string, context: string, transcript: DeliberationTurn[], instruction: string, loadout: string): Promise<string> => {
      return geminiService.runAlHypothesis(userQuery, context, transcript, instruction, loadout);
  },

  /**
   * Al-Mizan: Moderates the debate.
   */
  runMizan: async (userQuery: string, transcript: DeliberationTurn[], additionalInstruction?: string): Promise<MizanInstruction | null> => {
    return geminiService.runAlMizan(userQuery, transcript, additionalInstruction);
  },

  /**
   * Al-Mudawwin: Creates a neutral summary of the debate.
   */
  runMudawwin: async (userQuery: string, transcript: DeliberationTurn[]): Promise<string> => {
    return geminiService.runAlMudawwin(userQuery, transcript);
  },

  /**
   * NEW: A collaborative synthesis function.
   */
  runSynthesis: async (userQuery: string, context: string, transcript: DeliberationTurn[], personas: Persona[], instruction: string): Promise<string> => {
      return geminiService.runCollaborativeSynthesis(userQuery, transcript, personas, instruction);
  },
};
