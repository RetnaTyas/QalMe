import React, { useState } from 'react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onSave: (apiKey: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onSave }) => {
  const [key, setKey] = useState('');

  if (!isOpen) {
    return null;
  }
  
  const handleSaveClick = () => {
    if (key.trim()) {
        onSave(key.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-95 flex items-center justify-center z-[100] p-4 animate-fade-in-up">
      <div className="bg-slate-800 rounded-lg shadow-2xl p-8 w-full max-w-md border border-purple-500/50 text-center">
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Welcome</h2>
        <p className="text-slate-400 mb-6">
          Please enter your Google AI Studio API key to begin. Your key is stored only in your browser's local storage.
        </p>

        <div className="flex flex-col gap-4">
            <input
              type="password"
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="Enter your API key here"
              className="w-full bg-slate-700 border rounded-md p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all duration-200 resize-y border-slate-600 focus:ring-purple-500 text-center"
            />
            <button
                onClick={handleSaveClick}
                disabled={!key.trim()}
                className="bg-purple-600 hover:bg-purple-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-md transition-colors"
            >
                Save and Start
            </button>
        </div>
        <p className="text-xs text-slate-500 mt-4">
            You can get your API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Google AI Studio</a>.
        </p>
      </div>
    </div>
  );
};
