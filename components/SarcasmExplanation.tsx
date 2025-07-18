import React from 'react';
import { SarcasmFactors } from '../types';
import { FireIcon } from './icons';

const MetricBar = ({ label, value, colorClass }: { label: string, value: number, colorClass: string }) => (
  <div className="flex items-center text-xs mb-1">
    <span className="w-32 font-semibold text-slate-600 shrink-0">{label}:</span>
    <div className="flex-grow bg-slate-200 rounded-full h-2.5 mx-2">
      <div 
        className={`${colorClass} h-2.5 rounded-full animate-progress-bar`}
        style={{ width: `${Math.round(value * 100)}%` }}
      />
    </div>
    <span className="w-8 font-mono text-slate-500 text-right">{`${Math.round(value * 100)}%`}</span>
  </div>
);

export const SarcasmExplanation = ({ factors }: { factors: SarcasmFactors | null }) => {
  if (!factors) return null;

  const reasons: string[] = [];
  if (1 - factors.queryQuality > 0.7) reasons.push("Query quality was... questionable.");
  if (factors.tension > 0.7) reasons.push("Detected high ambiguity; my circuits were tense.");
  if (factors.userHistory > 0.6) reasons.push("There's a history of low-effort questions.");
  if (factors.timeOfDay > 0.8) reasons.push("It's late. My patience wears thin after dark.");
  if (reasons.length === 0) reasons.push("Just felt a little snarky, that's all.");

  return (
    <div className="absolute top-full left-0 mt-3 w-72 bg-white text-slate-800 rounded-lg shadow-2xl p-3 animate-fade-in-up border-2 border-amber-400 z-10"
      role="dialog"
      aria-labelledby="sarcasm-explanation-heading"
    >
      <div className="absolute left-4 -top-2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-amber-400"></div>
      <div className="flex items-center mb-3">
        <FireIcon className="w-6 h-6 text-amber-500 mr-2" />
        <h3 id="sarcasm-explanation-heading" className="font-bold text-amber-700">Why So Sarcastic?</h3>
      </div>
      <div className="mb-3">
        <p className="text-xs text-slate-600 italic mb-2">My sarcasm level is dictated by several factors:</p>
        <MetricBar label="Query Ambiguity" value={factors.tension} colorClass="bg-red-500" />
        <MetricBar label="Low Query Quality" value={1 - factors.queryQuality} colorClass="bg-yellow-500" />
        <MetricBar label="Low-Effort History" value={factors.userHistory} colorClass="bg-orange-500" />
        <MetricBar label="Late Night Factor" value={factors.timeOfDay} colorClass="bg-purple-500" />
      </div>
       <div className="border-t border-slate-200 pt-2">
         <h4 className="text-xs font-bold text-slate-700 mb-1">Diagnosis:</h4>
         <ul className="list-disc list-inside space-y-1 pl-1">
            {reasons.map((r, i) => <li key={i} className="text-xs text-slate-700">{r}</li>)}
         </ul>
       </div>
    </div>
  );
};
