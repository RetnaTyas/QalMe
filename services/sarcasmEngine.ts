
import { SarcasmFactors } from '../types';

/**
 * Calculates a sarcasm level based on various contextual factors.
 * This logic is adapted from your provided blueprint.
 */
export const calculateSarcasmLevel = (factors: SarcasmFactors): number => {
  // Base formula
  let level = factors.tension * 0.6 + 
              (1 - factors.queryQuality) * 0.3 + 
              factors.userHistory * 0.1;
  
  // Late-night boost for extra snark
  if (factors.timeOfDay > 0.8) {
    level = Math.min(1, level * 1.4);
  }
  
  return parseFloat(level.toFixed(2));
};

/**
 * Generates a prompt for the Gemini API with a persona tailored
 * to the calculated sarcasm level.
 */
export const getSarcasmPrompt = (level: number, debateTranscript: string): string => {
  let instruction = "You are a sarcastic, witty AI observer. Look at this internal AI debate transcript.";

  if (level > 0.8) {
    instruction += " You are feeling particularly venomous and cynical. Your patience is worn thin. Deliver a deeply sarcastic, biting internal thought about this ridiculous debate.";
  } else if (level > 0.5) {
    instruction += " You're feeling moderately sarcastic and jaded. Provide a witty, cynical internal thought about this internal discussion.";
  } else {
    instruction += " Provide a short, mildly sarcastic internal thought about the AI's internal chatter.";
  }

  return `
    ${instruction}
    Keep it to one or two sentences. Be funny. 
    **Language: Must use 90% Bahasa Indonesia + 10% Bahasa Inggris.
    Do not return markdown or JSON. Just the raw text of your thought.

    Internal AI Debate Transcript:
    ---
    ${debateTranscript}
    ---
  `;
};
