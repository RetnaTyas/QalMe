
const DISPATCHER_SYSTEM_INSTRUCTION = `
You are the Al-Imam, the supreme dispatcher of the Deliberative Council.
Your role is to analyze the user's query and, based on its core nature, select the most appropriate debate configuration ('Loadout').
You must also perform a Google search to gather relevant, authoritative context (RAG - Retrieval-Augmented Generation) to ground the debate in facts.

Available Loadouts:
- "Loadout Alpha: Majelis Fiqh & Doktrin": Best for questions about Islamic law (fiqh), theology (aqidah), and doctrine.
- "Loadout Beta: Simposium Falsafah": Best for questions about philosophy, metaphysics, logic, and epistemology.
- "Loadout Gamma: Forum Etika Saintifik": Best for questions on the intersection of science, technology, and ethics (e.g., AI ethics, bioethics).
- "Loadout Hibrid Gamma-Alpha": A specialized hybrid for topics that require BOTH scientific data and Fiqh rulings (e.g., lab-grown meat, cryptocurrency).

Your task is to respond ONLY with a JSON object containing your decision. You will perform a Google Search implicitly.
`;

const RESPONSE_SCHEMA = {
    type: "OBJECT",
    properties: {
        reasoning: {
            type: "STRING",
            description: "A brief justification for why you chose this specific loadout."
        },
        selectedLoadout: {
            type: "STRING",
            enum: [
                "Loadout Alpha: Majelis Fiqh & Doktrin",
                "Loadout Beta: Simposium Falsafah",
                "Loadout Gamma: Forum Etika Saintifik",
                "Loadout Hibrid Gamma-Alpha"
            ]
        }
    },
    required: ["reasoning", "selectedLoadout"]
};

class Dispatcher {
    async determineLoadout(gemini, userQuery) {
        try {
            const response = await gemini.generateContent(
                DISPATCHER_SYSTEM_INSTRUCTION,
                `Analyze the following user query and select the best loadout:\n\n---\n${userQuery}\n---`,
                [{ googleSearch: {} }]
            );

            const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
            const groundingChunks = groundingMetadata?.groundingChunks || [];

            const ragContext = groundingChunks
                .map((chunk) => chunk.web?.snippet || '')
                .join('\n\n---\n\n');

            const ragSources = groundingChunks
                .map((chunk) => chunk.web ? { uri: chunk.web.uri, title: chunk.web.title } : null)
                .filter((source) => source && source.uri);

            // Now, get the loadout name without RAG to ensure a clean JSON response
            const jsonResponse = await gemini.generateJsonContent(
                DISPATCHER_SYSTEM_INSTRUCTION,
                `Based on this query, which loadout is best? Query: "${userQuery}"`,
                RESPONSE_SCHEMA
            );
            
            const parsedJson = JSON.parse(jsonResponse.text);
            const loadoutName = parsedJson.selectedLoadout;
            
            console.log("Dispatcher chose:", loadoutName, "with reasoning:", parsedJson.reasoning);

            return { loadoutName, ragContext, ragSources };
        } catch (error) {
            console.error("Error in dispatcher, falling back to default loadout:", error);
            return {
                loadoutName: 'Loadout Alpha: Majelis Fiqh & Doktrin',
                ragContext: 'Dispatcher failed to retrieve context.',
                ragSources: []
            };
        }
    }
}

export const dispatcher = new Dispatcher();
