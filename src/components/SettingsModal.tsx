import React from 'react';
import { CloseIcon } from './icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onManageApiKey: () => void;
  onClearApiKey: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onManageApiKey, onClearApiKey }) => {

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in-up">
      <div className="bg-slate-800 rounded-lg shadow-2xl p-6 w-full max-w-lg h-auto flex flex-col border border-purple-500/50">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-700">
              <h2 className="text-xl font-bold text-slate-100">Settings</h2>
              <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"><CloseIcon /></button>
          </div>

          <div className="flex-grow flex flex-col gap-4 overflow-y-auto pr-2">
            {/* -- API Key Settings -- */}
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-purple-400 mb-3">API Key Management</h3>
                <div className="bg-slate-900/50 p-4 rounded-md flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-slate-300 flex-grow">Manage or clear the API key stored in your browser.</p>
                    <div className="flex gap-2">
                        <button onClick={onManageApiKey} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">
                            Change API Key
                        </button>
                        <button onClick={onClearApiKey} className="bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">
                            Clear API Key
                        </button>
                    </div>
                </div>
            </div>

            {/* -- Prompt Settings -- */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-purple-400 mb-3">Persona Prompt Customization</h3>
              <div className="bg-slate-900/50 p-4 rounded-md text-center">
                <p className="text-slate-400 text-sm">
                    Prompt customization is not available in this version.
                </p>
                <p className="text-slate-500 text-xs mt-2">
                    This feature was disabled to support the secure server-side proxy architecture.
                </p>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};
