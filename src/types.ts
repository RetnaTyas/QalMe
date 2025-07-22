export type Criterion = {
  id: string;
  name: string;
  weight: number;
};

export type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  metadata?: {
    sources?: {
      uri: string;
      title: string;
    }[];
    verdict?: HakimVerdict;
  };
  isRevision?: boolean;
  turnId?: number;
};

export type Turn = {
  id: number;
  userQuery: string;
  sarcasticResponse: string;
  sarcasmExplanation: SarcasmExplanation;
  pipeline: PipelineNode[];
};

export type PipelineNode = {
  name: string;
  input: string;
  output: string;
  prompt: string;
  positive_evaluation: string;
  negative_evaluation: string;
  human_override: boolean;
  evaluation_score: number;
  submodules: PipelineNode[];
};

export type SarcasmExplanation = {
  literal_meaning: string;
  intended_meaning: string;
  sarcasm_mechanisms: string[];
};

export type HakimVerdict = {
  finalVerdict: string;
  winningArgumentSummary: string;
  evaluationMatrix: {
    [key: string]: {
      score: number;
      justification: string;
    };
  };
};

export type Persona = 'Al-Khatib' | 'Al-Faqih' | 'Al-Hypothesis' | 'Al-Mizan' | 'Al-Hakim' | 'Al-Nadhir' | 'Al-Mudawwin';

export type ParticipantState = {
    status: 'waiting' | 'thinking' | 'speaking' | 'governing';
    statement: string;
};

export type DeliberationTurn = {
    turn: number;
    speaker: string;
    statement: string;
    isIntervention: boolean;
};

export type SarcasmFactors = {
    queryQuality: number;
    tension: number;
    userHistory: number;
    timeOfDay: number;
};

export type SessionState = {
    sessionId: string | null;
    history: Turn[];
};

export type MuzakarahState = {
    status: 'deliberating' | 'paused_for_verdict' | 'concluded' | 'error';
    participants: {
        [key in Persona]?: ParticipantState;
    };
    deliberationTranscript: DeliberationTurn[];
};
