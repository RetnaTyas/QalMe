const API_KEY_STORAGE_KEY = 'gemini_deliberative_council_api_key';

class ApiKeyManager {
  public set(apiKey: string): void {
    try {
      localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
    } catch (error) {
      console.error("Could not save API key to local storage:", error);
    }
  }

  public get(): string | null {
    try {
      return localStorage.getItem(API_KEY_STORAGE_KEY);
    } catch (error) {
      console.error("Could not retrieve API key from local storage:", error);
      return null;
    }
  }

  public clear(): void {
    try {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
    } catch (error) {
      console.error("Could not clear API key from local storage:", error);
    }
  }
}

export const apiKeyManager = new ApiKeyManager();
