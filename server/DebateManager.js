import { reasoningProvider } from './reasoningProvider.js';

export class DebateManager {
    constructor(options) {
        this.gemini = options.geminiService;
        this.prompts = options.prompts;
        this.specialPrompts = options.specialPrompts;
        
        // No UI updater in server-side version
        // this.updateUI = options.updateUI; 
        
        this.state = options.initialState || this.getInitialState();
        this.initialQuery = options.initialQuery;
        this.ragContext = options.ragContext;
        this.loadoutName = options.loadoutName;
    }

    getInitialState() {
        return {
            status: 'deliberating',
            participants: {
                'Al-Khatib': { status: 'waiting', statement: '' },
                'Al-Faqih': { status: 'waiting', statement: '' },
                'Al-Hypothesis': { status: 'waiting', statement: '' },
                'Al-Nadhir': { status: 'waiting', statement: '' },
                'Al-Mizan': { status: 'governing', statement: '' },
                'Al-Mudawwin': { status: 'waiting', statement: '' },
                'Al-Hakim': { status: 'waiting', statement: '' },
            },
            deliberationTranscript: [],
        };
    }

    updateParticipantState(persona, statement, status) {
        if (this.state.participants[persona]) {
            this.state.participants[persona] = { statement, status };
        }
    }
    
    addTurnToTranscript(speaker, statement, isIntervention = false, parsedStatement) {
        this.state.deliberationTranscript.push({
            turn: this.state.deliberationTranscript.length,
            speaker,
            statement,
            isIntervention,
            parsedStatement
        });
    }

    async runTurn(speaker, instruction, contextOverride) {
        this.updateParticipantState(speaker, '', 'thinking');
        
        const personaPrompt = this.prompts[speaker.toLowerCase()] || this.specialPrompts[speaker.toLowerCase()];
        if (!personaPrompt) {
            // Handle special cases like 'Al-Faqih' during a challenge
            if (speaker === 'Al-Faqih' && this.prompts['Al-Faqih']) {
                 // Do nothing, prompt is passed directly
            } else {
                throw new Error(`Prompt for persona ${speaker} not found!`);
            }
        }
        
        const systemInstruction = personaPrompt ? personaPrompt.systemInstruction : this.prompts.systemInstruction;
        const promptTemplate = personaPrompt ? personaPrompt.prompt : this.prompts.prompt;

        const fullTranscript = this.state.deliberationTranscript.map(t => `${t.speaker}: ${t.statement}`).join('\n\n');
        
        const statement = await reasoningProvider.generateStatement({
            gemini: this.gemini,
            systemInstruction: systemInstruction,
            prompt: promptTemplate,
            persona: speaker,
            instruction,
            transcript: fullTranscript,
            context: contextOverride || this.ragContext
        });

        this.updateParticipantState(speaker, statement, 'speaking');
        this.addTurnToTranscript(speaker, statement);
        
        Object.keys(this.state.participants).forEach(p => {
             if (p !== speaker && this.state.participants[p].status !== 'governing') {
                 this.updateParticipantState(p, this.state.participants[p].statement, 'waiting');
             }
        });
        
        return statement;
    }
    
    async runMizanTurn(instruction) {
        const persona = 'Al-Mizan';
        this.updateParticipantState(persona, '', 'thinking');
        
        const fullTranscript = this.state.deliberationTranscript.map(t => `${t.speaker}: ${t.statement}`).join('\n\n');

        const parsedInstruction = await reasoningProvider.generateMizanInstruction({
            gemini: this.gemini,
            transcript: fullTranscript,
            context: this.ragContext,
            userQuery: this.initialQuery
        });
        
        this.updateParticipantState(persona, parsedInstruction.statement_for_transcript, 'governing');
        this.addTurnToTranscript(persona, parsedInstruction.statement_for_transcript, true, parsedInstruction);
        return parsedInstruction;
    }

    async runDebate(injectedNadhirIdea) {
        let currentInstruction = {
            action: 'KICKOFF_WITH_ABSOLUTE_TRUTH',
            target_personas: ['Al-Khatib'],
            direct_instruction: `Start the debate based on the user's query: "${this.initialQuery}"`,
            statement_for_transcript: `Kickstarting debate for query: "${this.initialQuery}"`
        };
        this.addTurnToTranscript('Al-Imam', currentInstruction.statement_for_transcript, true);

        for (let i = 0; i < 5; i++) {
            
            if (i > 0) {
                await this.runTurn('Al-Nadhir', `Analyze the last 3 turns and provide a counter-argument.`, injectedNadhirIdea);
                if (injectedNadhirIdea) injectedNadhirIdea = undefined;
            }
            
            currentInstruction = await this.runMizanTurn('Moderate the next turn.');

            if (currentInstruction.action === 'SUMMARIZE_AND_CONCLUDE') {
                break;
            }
            
            const targetPersona = currentInstruction.target_personas[0];
            await this.runTurn(targetPersona, currentInstruction.direct_instruction);
        }

        this.state.status = 'synthesizing';
        
        this.updateParticipantState('Al-Mudawwin', '', 'thinking');
        const finalResponseText = await reasoningProvider.generateFinalSummary({
            gemini: this.gemini,
            transcript: this.state.deliberationTranscript.map(t => `${t.speaker}: ${t.statement}`).join('\n\n'),
            userQuery: this.initialQuery
        });
        this.updateParticipantState('Al-Mudawwin', finalResponseText, 'speaking');
        this.addTurnToTranscript('Al-Mudawwin', `Final Summary: ${finalResponseText}`);

        const finalVerdict = await this.getHakimVerdict();
        
        const avgScore = Object.values(finalVerdict.evaluationMatrix).reduce((sum, item) => sum + item.score, 0) / 5;
        if (avgScore < 0.65) {
            this.state.status = 'paused_for_verdict';
            this.updateParticipantState('Al-Hakim', 'The verdict is contentious. The debate is paused, awaiting a challenge.', 'governing');
        } else {
            this.state.status = 'concluded';
             this.updateParticipantState('Al-Hakim', finalVerdict.finalVerdict, 'speaking');
        }
        
        return { finalResponseText, finalMuzakarahState: this.state, finalVerdict };
    }

    async getHakimVerdict() {
        this.updateParticipantState('Al-Hakim', '', 'thinking');
        const hakimPrompt = this.specialPrompts.hakim;
        const transcript = this.state.deliberationTranscript.map(t => `${t.speaker}: ${t.statement}`).join('\n\n');

        const verdictJsonString = await reasoningProvider.generateHakimVerdict({
            gemini: this.gemini,
            systemInstruction: hakimPrompt.systemInstruction,
            prompt: hakimPrompt.prompt,
            transcript: transcript
        });
        
        try {
            const verdictData = JSON.parse(verdictJsonString);
            const verdict = {
                ...verdictData,
                loadoutName: this.loadoutName,
            };
            this.updateParticipantState('Al-Hakim', verdict.finalVerdict, 'speaking');
            this.addTurnToTranscript('Al-Hakim', `Verdict delivered. See the final response for details.`);
            return verdict;
        } catch (e) {
            console.error("Failed to parse Al-Hakim's verdict:", e);
            throw new Error("Al-Hakim returned an invalid JSON verdict.");
        }
    }

    async resumeDebateFromChallenge(previousVerdict, injectedNadhirIdea) {
        if (!previousVerdict) throw new Error("Cannot resume without a previous verdict.");

        this.state.status = 'deliberating';
        this.addTurnToTranscript("Al-Imam", "Debate resumed based on a challenge to Al-Hakim's verdict.", true);
        
        this.prompts['Al-Faqih'].prompt = this.prompts['Al-Faqih'].prompt.replace('{hakimVerdictJson}', JSON.stringify(previousVerdict, null, 2));

        await this.runTurn('Al-Faqih', `Here is the verdict to challenge. Formulate your methodological critique.`);

        await this.runTurn('Al-Khatib', 'The Faqih has challenged the previous verdict. Defend or revise your original winning argument.');

        return this.runDebate(injectedNadhirIdea);
    }
}
