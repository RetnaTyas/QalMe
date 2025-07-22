import { defaultPrompts } from './personaLoadouts.js';

class PromptManager {
  constructor() {
    this.defaultPrompts = defaultPrompts;
  }

  // In the server-side version, we only ever use the default prompts.
  // Customization would require a database or other persistent storage.
  getActivePrompts() {
    return this.defaultPrompts;
  }
}

export const promptManager = new PromptManager();
