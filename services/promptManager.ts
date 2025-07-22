import { defaultPrompts } from './personaLoadouts';

const STORAGE_KEY = 'user_custom_prompts';

class PromptManager {
  private defaultPrompts: any;
  private customPrompts: any;

  constructor() {
    this.defaultPrompts = defaultPrompts;
    this.customPrompts = this.loadFromStorage();
  }

  private loadFromStorage(): any {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error("Failed to load custom prompts from localStorage", error);
      return {};
    }
  }

  // Helper function for deep merging objects
  private mergeDeep(target: any, source: any) {
    const output = { ...target };
    if (this.isObject(target) && this.isObject(source)) {
        Object.keys(source).forEach(key => {
            if (this.isObject(source[key])) {
                if (!(key in target)) {
                    Object.assign(output, { [key]: source[key] });
                } else {
                    output[key] = this.mergeDeep(target[key], source[key]);
                }
            } else {
                Object.assign(output, { [key]: source[key] });
            }
        });
    }
    return output;
  }
  
  private isObject(item: any) {
    return (item && typeof item === 'object' && !Array.isArray(item));
  }


  // Memberikan prompt yang aktif (custom jika ada, jika tidak, default)
  public getActivePrompts(): any {
    // Deep merge a copy of defaults with customs to ensure all personas are present
    const defaultsCopy = JSON.parse(JSON.stringify(this.defaultPrompts));
    return this.mergeDeep(defaultsCopy, this.customPrompts);
  }

  // Mendapatkan hanya prompt yang di-custom oleh user
  public getCustomPrompts(): any {
      return this.customPrompts;
  }

  // Menyimpan perubahan prompt
  public saveCustomPrompt(loadout: string, persona: string, type: 'systemInstruction' | 'prompt', value: string) {
    if (!this.customPrompts[loadout]) {
      this.customPrompts[loadout] = {};
    }
    if (!this.customPrompts[loadout][persona]) {
      this.customPrompts[loadout][persona] = {};
    }
    this.customPrompts[loadout][persona][type] = value;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.customPrompts));
  }

  // Menghapus semua kustomisasi dan kembali ke default
  public resetToDefaults() {
    this.customPrompts = {};
    localStorage.removeItem(STORAGE_KEY);
  }
}

export const promptManager = new PromptManager();
