import { reasoningProvider } from './reasoningProvider';
import { Al_Imam_Dispatcher } from './dispatcher';
import {
  ChatMessage,
  MuzakarahState,
  DeliberationTurn,
  Persona,
  ParticipantStatus,
  MizanInstruction,
  SessionTurn,
} from '../types';

/**
 * A custom error class for handling specific failures within the debate flow,
 * as recommended by the architectural review. This allows for more granular
 * error handling and potential recovery logic.
 */
export class DebateError extends Error {
    constructor(
        message: string,
        public readonly persona?: Persona,
        public readonly turn?: number,
        public readonly recoverable: boolean = false
    ) {
        super(message);
        this.name = 'DebateError';
    }
}

/**
 * Defines a contract for the UI updater functions that the debate logic needs.
 * This decouples the core logic from React's state hooks, making it more portable and testable.
 */
export interface UIUpdaters {
    updateParticipantState: (persona: Persona, status: ParticipantStatus, statement?: string) => void;
    addTurnToTranscript: (turn: DeliberationTurn) => void;
}

function arraysEqual(a: Persona[], b: Persona[]): boolean {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((val, index) => val === sortedB[index]);
}

/**
 * The core logic of the debate loop, extracted from the former God-Object Orchestrator.
 * This function is designed to be more self-contained and testable.
 * @param userInput The user's initial query.
 * @param ui A collection of functions to update the UI state.
 * @returns A promise resolving with the final generated turn and chat message.
 */
export async function runMuzakarah(
    userInput: string, 
    ui: UIUpdaters,
): Promise<{ finalTurn: Omit<SessionTurn, 'turnId'>, finalMessage: ChatMessage }> {
    const MAX_DEBATE_ROUNDS = 15;
    let currentTranscript: DeliberationTurn[] = [];
    let round = 0;
    let debateStatus: 'deliberating' | 'concluded' = 'deliberating';
    let lastMizanDecision: { action: string; target_personas: Persona[] } | null = null;
    
    // Helper to call the correct reasoning provider based on the persona.
    const runPersonaLogic = async (persona: Persona, userQuery: string, context: string, transcript: DeliberationTurn[], instruction: string, loadout: string): Promise<string> => {
        switch (persona) {
          case 'Al-Khatib':
            return reasoningProvider.runKhatib(userQuery, context, transcript, instruction, loadout);
          case 'Al-Faqih':
            return reasoningProvider.runFaqih(userQuery, context, transcript, instruction, loadout);
          case 'Al-Hypothesis':
            return reasoningProvider.runHypothesis(userQuery, context, transcript, instruction, loadout);
          default:
            console.warn(`DebateManager attempted to run unhandled persona: ${persona}`);
            return Promise.resolve('');
        }
    };
    
    // --- DISPATCHER & CONTEXT RETRIEVAL ---
    const selectedLoadout = Al_Imam_Dispatcher(userInput);
    const imamIntroTurn = { turn: 0, speaker: 'Al-Imam' as Persona, statement: `Berdasarkan analisis pertanyaan, Majelis akan bersidang menggunakan: **${selectedLoadout}**.\nMemulakan pengumpulan maklumat...`, isIntervention: true };
    currentTranscript.push(imamIntroTurn);
    ui.addTurnToTranscript(imamIntroTurn);
    const { context, sources } = await reasoningProvider.getContext(userInput);
    const sourcesText = sources.length > 0 ? `\n\n--- Sumber Rujukan ---\n${sources.map((source, index) => `[${index + 1}] ${source.title}\n   ${source.uri}`).join('\n\n')}` : '';
    const imamFullStatement = `${context}${sourcesText}`;
    const imamContextTurn = { turn: 1, speaker: 'Al-Imam' as Persona, statement: imamFullStatement, isIntervention: false };
    currentTranscript.push(imamContextTurn);
    ui.addTurnToTranscript(imamContextTurn);

    // --- DYNAMIC DELIBERATION LOOP ---
    const turnsSinceLastSpoke = new Map<Persona, number>([['Al-Khatib', 0], ['Al-Faqih', 0], ['Al-Hypothesis', 0]]);
    const debaters: Persona[] = ['Al-Khatib', 'Al-Faqih', 'Al-Hypothesis'];

    while (debateStatus === 'deliberating' && round < MAX_DEBATE_ROUNDS) {
        debaters.forEach(d => turnsSinceLastSpoke.set(d, (turnsSinceLastSpoke.get(d) || 0) + 1));
        
        let mizanDecision: MizanInstruction | null = null;
        
        // --- Chaos Protocol Enforcement ---
        const longestSilentDebater = [...turnsSinceLastSpoke.entries()].sort((a, b) => b[1] - a[1])[0];
        if (longestSilentDebater && longestSilentDebater[1] > 3) {
            const chaosInstruction = `Anda telah berdiam diri terlalu lama. Pihak Majlis mewajibkan anda memberi maklum balas terhadap kenyataan terakhir dalam perbincangan ini.`;
            mizanDecision = { action: 'REFINE_ARGUMENT', target_personas: [longestSilentDebater[0]], instruction: chaosInstruction };
            const interventionStatement = `(Intervensi Sistem: Memaksa giliran untuk ${longestSilentDebater[0]} bagi memastikan penyertaan.)\n${chaosInstruction}`;
            const mizanTurn = { turn: currentTranscript.length, speaker: 'Al-Mizan' as Persona, statement: interventionStatement, isIntervention: true, parsedStatement: mizanDecision };
            currentTranscript.push(mizanTurn);
            ui.addTurnToTranscript(mizanTurn);
            ui.updateParticipantState('Al-Mizan', 'speaking', interventionStatement);
            lastMizanDecision = null;
        } else {
            ui.updateParticipantState('Al-Mizan', 'thinking');
            let decision = await reasoningProvider.runMizan(userInput, currentTranscript);

            if (lastMizanDecision && decision && decision.action === lastMizanDecision.action && arraysEqual(decision.target_personas, lastMizanDecision.target_personas)) {
                decision = await reasoningProvider.runMizan(userInput, currentTranscript, "PERINGATAN: Arahan anda sama seperti pusingan sebelumnya. Sila berikan arahan strategik yang BERBEZA.");
            }
            if (!decision) throw new DebateError("Al-Mizan failed to moderate the debate.", 'Al-Mizan', round);
            mizanDecision = decision;

            lastMizanDecision = { action: mizanDecision.action, target_personas: [...mizanDecision.target_personas] };
            const mizanTurn = { turn: currentTranscript.length, speaker: 'Al-Mizan' as Persona, statement: mizanDecision.instruction, isIntervention: true, parsedStatement: mizanDecision };
            currentTranscript.push(mizanTurn);
            ui.addTurnToTranscript(mizanTurn);
            ui.updateParticipantState('Al-Mizan', 'speaking', mizanDecision.instruction);
        }

        await new Promise(r => setTimeout(r, 500));
        ui.updateParticipantState('Al-Mizan', 'governing');

        if (!mizanDecision) throw new DebateError("Mizan decision was not formed correctly.", 'Al-Mizan', round);
        const { action, target_personas, instruction } = mizanDecision;

        if (action === 'SUMMARIZE_AND_CONCLUDE') {
            debateStatus = 'concluded';
            continue;
        }

        const executeAndLogTurn = async (persona: Persona, currentInstruction: string) => {
             ui.updateParticipantState(persona, 'thinking');
             const response = await runPersonaLogic(persona, userInput, context, currentTranscript, currentInstruction, selectedLoadout);
             const newTurn = { turn: currentTranscript.length, speaker: persona, statement: response };
             currentTranscript.push(newTurn);
             ui.addTurnToTranscript(newTurn);
             ui.updateParticipantState(persona, 'speaking', response);
             await new Promise(r => setTimeout(r, 500));
             ui.updateParticipantState(persona, 'waiting');
        };

        if (action === 'MANDATE_SYNTHESIS' && target_personas.length >= 2) {
            const [personaA, personaB] = target_personas as [Persona, Persona];
            ui.updateParticipantState(personaA, 'thinking', 'Collaborating...');
            ui.updateParticipantState(personaB, 'thinking', 'Collaborating...');
            const synthesisResponse = await reasoningProvider.runSynthesis(userInput, context, currentTranscript, [personaA, personaB], instruction);
            const newTurn = { turn: currentTranscript.length, speaker: `${personaA} & ${personaB}`, statement: synthesisResponse, isIntervention: true };
            currentTranscript.push(newTurn);
            ui.addTurnToTranscript(newTurn);
            ui.updateParticipantState(personaA, 'waiting', `Contributed to synthesis.`);
            ui.updateParticipantState(personaB, 'waiting', `Contributed to synthesis.`);
        } else {
            for (const persona of target_personas) {
                await executeAndLogTurn(persona as Persona, instruction);
            }
        }
        
        target_personas.forEach(p => turnsSinceLastSpoke.has(p as Persona) && turnsSinceLastSpoke.set(p as Persona, 0));
        round++;
    }

    // --- FINAL SYNTHESIS & MESSAGE ---
    ui.updateParticipantState('Al-Mudawwin', 'thinking', "Menganalisis transkrip...");
    const finalResponseText = await reasoningProvider.runMudawwin(userInput, currentTranscript);
    ui.updateParticipantState('Al-Mudawwin', 'speaking', "Jawaban akhir telah disusun.");
    
    const finalMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        text: finalResponseText,
        sender: 'bot',
        metadata: { sources },
        isChallengeable: false, 
        isRevision: false,
    };
    
    const finalMuzakarahState: MuzakarahState = {
        status: 'concluded',
        participants: {
            'Al-Khatib': { status: 'waiting', statement: currentTranscript.filter(t => t.speaker === 'Al-Khatib').pop()?.statement || '' },
            'Al-Faqih': { status: 'waiting', statement: currentTranscript.filter(t => t.speaker === 'Al-Faqih').pop()?.statement || '' },
            'Al-Hypothesis': { status: 'waiting', statement: currentTranscript.filter(t => t.speaker === 'Al-Hypothesis').pop()?.statement || '' },
            'Al-Mizan': { status: 'governing', statement: currentTranscript.filter(t => t.speaker === 'Al-Mizan').pop()?.statement || 'Debate concluded.' },
            'Al-Mudawwin': { status: 'speaking', statement: finalResponseText },
        },
        deliberationTranscript: currentTranscript
    };
    
    const finalTurn: Omit<SessionTurn, 'turnId'> = {
        userQuery: userInput,
        ragContext: context,
        ragSources: sources,
        muzakarahState: finalMuzakarahState,
        finalResponse: finalMessage
    };

    return { finalTurn, finalMessage };
}
