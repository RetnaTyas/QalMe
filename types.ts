
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  metadata?: {
    sources?: { uri: string; title: string }[];
  };
  turnId?: number;
  isChallengeable?: boolean;
  isRevision?: boolean;
}

// --- Deliberative Council Architecture Types ---

export type PersonaColor = 'blue' | 'red' | 'purple' | 'amber' | 'slate';
export type Persona = 'Al-Imam' | 'Al-Khatib' | 'Al-Faqih' | 'Al-Hypothesis' | 'Al-Mizan' | 'Al-Mudawwin' | 'User';
export type ParticipantStatus = 'thinking' | 'speaking' | 'waiting' | 'governing';
export type MuzakarahSessionStatus = 'deliberating' | 'synthesizing' | 'concluded' | 'error';

export interface DeliberationTurn {
  turn: number;
  speaker: Persona | string;
  statement: string;
  isIntervention?: boolean;
  parsedStatement?: MizanInstruction;
}

export interface ParticipantState {
  status: ParticipantStatus;
  statement: string;
}

// --- MODIFIED: MizanInstruction with new strategic actions ---
export type MizanAction =
  | 'KICKOFF_WITH_MAQASID'      // Memulai debat dengan pertanyaan Maqasid
  | 'PERFORM_STEELMAN'          // Memerintahkan persona untuk memperkuat argumen lawan
  | 'MANDATE_SYNTHESIS'         // Memaksa dua persona untuk berkolaborasi menciptakan posisi baru
  | 'REQUIRE_IMPACT_PROJECTION' // Meminta proyeksi dampak dari sebuah argumen
  | 'CONTINUE_DEBATE'           // Melanjutkan alur debat standar (Khatib -> Faqih -> etc.)
  | 'REFINE_ARGUMENT'           // Meminta perbaikan/penajaman argumen spesifik
  | 'SUMMARIZE_AND_CONCLUDE';   // Menghentikan debat dan memerintahkan sintesis akhir

export interface MizanInstruction {
    action: MizanAction;
    target_personas: Persona[];
    instruction: string;
}


export interface MuzakarahState {
  status: MuzakarahSessionStatus;
  participants: {
    'Al-Khatib': ParticipantState;
    'Al-Faqih': ParticipantState;
    'Al-Hypothesis': ParticipantState;
    'Al-Mizan': ParticipantState;
    'Al-Mudawwin': ParticipantState;
  };
  deliberationTranscript: DeliberationTurn[];
}

export interface SessionTurn {
    turnId: number;
    userQuery: string;
    muzakarahState: MuzakarahState;
    ragContext: string;
    ragSources: { uri: string; title: string }[];
    finalResponse: ChatMessage;
}

export interface SessionState {
  sessionId: string | null;
  history: SessionTurn[];
}

export type DialogueState = 'new_query' | 'challenging';

export interface SarcasmFactors {
  tension: number;
  queryQuality: number;
  userHistory: number;
  timeOfDay: number;
}