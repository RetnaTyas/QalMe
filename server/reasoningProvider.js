import { Type } from '@google/genai';

const MIZAN_SYSTEM_INSTRUCTION = `You are Al-Mizan, The Moderator. Your task is to analyze the debate transcript and decide the next strategic move.
You must choose an action and target persona(s) to advance the debate towards a resolution.
Output ONLY a JSON object matching the required schema.`;

const MIZAN_RESPONSE_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        action: {
            type: Type.STRING,
            enum: [
                'KICKOFF_WITH_ABSOLUTE_TRUTH',
                'PERFORM_STEELMAN',
                'MANDATE_SYNTHESIS',
                'REQUIRE_IMPACT_PROJECTION',
                'CONTINUE_DEBATE',
                'REFINE_ARGUMENT',
                'SUMMARIZE_AND_CONCLUDE'
            ]
        },
        target_personas: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING,
                enum: ['Al-Khatib', 'Al-Faqih', 'Al-Hypothesis', 'Al-Nadhir', 'Al-Mudawwin']
            }
        },
        statement_for_transcript: {
            type: Type.STRING,
            description: "A human-readable summary of your action for the public transcript. Example: 'I am instructing Al-Faqih to perform a steelman of Al-Khatib's argument.'"
        },
        direct_instruction: {
            type: Type.STRING,
            description: "The direct, concise command for the target AI persona. Example: 'Perform a steelman of the last statement.'"
        }
    },
    required: ['action', 'target_personas', 'statement_for_transcript', 'direct_instruction']
};

const FINAL_SUMMARY_SYSTEM_INSTRUCTION = `You are Al-Mudawwin, The Chronicler.
Your task is to read the entire debate transcript and synthesize a final, coherent, and well-structured answer to the user's original query.
The response should be comprehensive, integrating the key insights and arguments from the debate.
Do not act as an AI assistant. Write the final answer directly.`;

class ReasoningProvider {
    async generateStatement(args) {
        const { gemini, systemInstruction, prompt, instruction, transcript, context } = args;

        const finalPrompt = prompt
            .replace('{instruction}', instruction)
            .replace('{transcript}', transcript)
            .replace('{context}', context);
            
        const response = await gemini.generateContent(systemInstruction, finalPrompt);
        return response.text;
    }

    async generateMizanInstruction(args) {
        const { gemini, transcript, context, userQuery } = args;
        const prompt = `
        User Query: "${userQuery}"
        RAG Context: "${context}"
        Debate Transcript:
        ---
        ${transcript}
        ---
        Based on the current state of the debate, decide the next strategic move.
        `;
        const response = await gemini.generateJsonContent(MIZAN_SYSTEM_INSTRUCTION, prompt, MIZAN_RESPONSE_SCHEMA);
        try {
            return JSON.parse(response.text);
        } catch (e) {
            console.error("Failed to parse Mizan's instruction:", response.text, e);
            // Fallback to a safe continuation
            return {
                action: 'CONTINUE_DEBATE',
                target_personas: ['Al-Khatib'],
                statement_for_transcript: "An error occurred in moderation. Defaulting to continue the debate with Al-Khatib.",
                direct_instruction: "Continue the debate by providing your next argument."
            };
        }
    }

    async generateFinalSummary(args) {
        const { gemini, transcript, userQuery } = args;
        const prompt = `
        Original User Query: "${userQuery}"
        
        Full Debate Transcript to Synthesize:
        ---
        ${transcript}
        ---

        Synthesize the final answer based on this debate.
        `;
        const response = await gemini.generateContent(FINAL_SUMMARY_SYSTEM_INSTRUCTION, prompt);
        return response.text;
    }
    
    async generateHakimVerdict(args) {
        const { gemini, systemInstruction, prompt, transcript } = args;
        const finalPrompt = prompt.replace('{transcript}', transcript);
        const HAKIM_RESPONSE_SCHEMA = {
            type: Type.OBJECT,
            properties: {
              finalVerdict: { type: Type.STRING },
              evaluationMatrix: {
                type: Type.OBJECT,
                properties: {
                  mantiqIntegrity: { type: Type.OBJECT, properties: { score: {type: Type.NUMBER}, justification: {type: Type.STRING} }, required: ['score', 'justification'] },
                  usulCompliance: { type: Type.OBJECT, properties: { score: {type: Type.NUMBER}, justification: {type: Type.STRING} }, required: ['score', 'justification'] },
                  maqasidExcellence: { type: Type.OBJECT, properties: { score: {type: Type.NUMBER}, justification: {type: Type.STRING} }, required: ['score', 'justification'] },
                  hypothesisResilience: { type: Type.OBJECT, properties: { score: {type: Type.NUMBER}, justification: {type: Type.STRING} }, required: ['score', 'justification'] },
                  symbioticCoherence: { type: Type.OBJECT, properties: { score: {type: Type.NUMBER}, justification: {type: Type.STRING} }, required: ['score', 'justification'] }
                },
                required: ["mantiqIntegrity", "usulCompliance", "maqasidExcellence", "hypothesisResilience", "symbioticCoherence"]
              },
              winningArgumentSummary: { type: Type.STRING }
            },
            required: ["finalVerdict", "evaluationMatrix", "winningArgumentSummary"]
        };
        const response = await gemini.generateJsonContent(systemInstruction, finalPrompt, HAKIM_RESPONSE_SCHEMA);
        return response.text;
    }
}

export const reasoningProvider = new ReasoningProvider();
