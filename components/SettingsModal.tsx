import React, { useState, useEffect, useMemo } from 'react';
import { promptManager } from '../services/promptManager';
import { CloseIcon } from './icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onManageApiKey: () => void;
  onClearApiKey: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onManageApiKey, onClearApiKey }) => {
  const [activePrompts, setActivePrompts] = useState(() => promptManager.getActivePrompts());
  const loadouts = useMemo(() => Object.keys(activePrompts).filter(k => !k.startsWith('Special:')), [activePrompts]);
  
  const [selectedLoadout, setSelectedLoadout] = useState(loadouts[0]);
  
  const personas = useMemo(() => Object.keys(activePrompts[selectedLoadout] || {}), [activePrompts, selectedLoadout]);
  const [selectedPersona, setSelectedPersona] = useState(personas[0]);
  
  const [systemInstruction, setSystemInstruction] = useState('');
  const [mainPrompt, setMainPrompt] = useState('');

  useEffect(() => {
    if (isOpen) {
        // Refresh prompts when modal opens
        setActivePrompts(promptManager.getActivePrompts());
    }
  }, [isOpen]);

  useEffect(() => {
      const personasForLoadout = Object.keys(activePrompts[selectedLoadout] || {});
      if (!personasForLoadout.includes(selectedPersona)) {
          setSelectedPersona(personasForLoadout[0] || '');
      }
  }, [selectedLoadout, activePrompts, selectedPersona]);

  useEffect(() => {
    if (selectedLoadout && selectedPersona) {
      const personaConfig = activePrompts[selectedLoadout]?.[selectedPersona];
      if (personaConfig) {
          setSystemInstruction(personaConfig.systemInstruction || '');
          setMainPrompt(personaConfig.prompt || '');
      } else {
          setSystemInstruction('');
          setMainPrompt('');
      }
    }
  }, [selectedLoadout, selectedPersona, activePrompts]);

  if (!isOpen) return null;
  
  const handleSave = () => {
      promptManager.saveCustomPrompt(selectedLoadout, selectedPersona, 'systemInstruction', systemInstruction);
      promptManager.saveCustomPrompt(selectedLoadout, selectedPersona, 'prompt', mainPrompt);
      alert('Settings saved! Your changes will apply to new deliberations.');
      setActivePrompts(promptManager.getActivePrompts()); // Refresh state
  }
  
  const handleReset = () => {
      if(confirm('Are you sure you want to reset ALL custom prompts to their default values?')) {
          promptManager.resetToDefaults();
          alert('All prompts have been reset. Your changes will apply to new deliberations.');
          setActivePrompts(promptManager.getActivePrompts()); 
          // Re-trigger useEffects to load the new default prompts into the textareas
          const newPrompts = promptManager.getActivePrompts();
          const firstLoadout = Object.keys(newPrompts).filter(k => !k.startsWith('Special:'))[0];
          const firstPersona = Object.keys(newPrompts[firstLoadout])[0];
          setSelectedLoadout(firstLoadout);
          setSelectedPersona(firstPersona);
      }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in-up">
      <div className="bg-slate-800 rounded-lg shadow-2xl p-6 w-full max-w-4xl h-[90vh] flex flex-col border border-purple-500/50">
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
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="flex-1">
                      <label htmlFor="loadout-select" className="block text-sm font-medium text-slate-400 mb-1">Loadout</label>
                      <select id="loadout-select" value={selectedLoadout} onChange={e => setSelectedLoadout(e.target.value)} className="w-full bg-slate-700 p-2 rounded-md text-slate-200 border border-slate-600 focus:ring-2 focus:ring-purple-500 focus:outline-none">
                          {loadouts.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                  </div>
                  <div className="flex-1">
                    <label htmlFor="persona-select" className="block text-sm font-medium text-slate-400 mb-1">Persona</label>
                    <select id="persona-select" value={selectedPersona} onChange={e => setSelectedPersona(e.target.value)} className="w-full bg-slate-700 p-2 rounded-md text-slate-200 border border-slate-600 focus:ring-2 focus:ring-purple-500 focus:outline-none" disabled={!personas.length}>
                        {personas.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
              </div>
              <div>
                <label htmlFor="system-instruction-textarea" className="block text-sm font-semibold text-slate-300 mb-2">System Instruction</label>
                <textarea id="system-instruction-textarea" value={systemInstruction} onChange={e => setSystemInstruction(e.target.value)} className="w-full bg-slate-900 p-3 rounded-md h-40 resize-none border border-slate-600 focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono text-xs"/>
              </div>
              <div className="mt-4">
                <label htmlFor="main-prompt-textarea" className="block text-sm font-semibold text-slate-300 mb-2">Main Prompt</label>
                <textarea id="main-prompt-textarea" value={mainPrompt} onChange={e => setMainPrompt(e.target.value)} className="w-full bg-slate-900 p-3 rounded-md h-56 resize-none border border-slate-600 focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono text-xs"/>
              </div>
              <div className="mt-4 flex justify-between">
                  <button onClick={handleReset} className="bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">Reset Prompts</button>
                  <button onClick={handleSave} className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">Save Prompt Changes</button>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};