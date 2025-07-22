

export interface HakimVerdict {
  loadoutName: string; // The name of the loadout used for this debate
  finalVerdict: string; // Summary of the final decision
  evaluationMatrix: {
    mantiqIntegrity: HakimEvaluationCriteria;
    usulCompliance: HakimEvaluationCriteria;
    maqasidExcellence: HakimEvaluationCriteria;
    hypothesisResilience: HakimEvaluationCriteria;
    symbioticCoherence: HakimEvaluationCriteria;
  };
  winningArgumentSummary: string; // Which argument stood out the most
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  metadata?: {
    sources?: { uri: string; title: string }[];
    verdict?: HakimVerdict; // NEW: Verdict from Al-Hakim attached here
  };
  turnId?: number;
  isRevision?: boolean; // MODIFIED: To flag a revised answer
}

// --- Deliberative Council Architecture Types ---

// MODIFIED: Added Al-Hakim to the official list of Personas
export type Persona = 'Al-Imam' | 'Al-Khatib' | 'Al-Faqih' | 'Al-Hypothesis' | 'Al-Mizan' | 'Al-Mudawwin' | 'User' | 'Al-Nadhir' | 'Al-Hakim';
export type ParticipantStatus = 'thinking' | 'speaking' | 'waiting' | 'governing';
// MODIFIED: Introducing a new state to allow for debate resumption.
export type MuzakarahSessionStatus = 'deliberating' | 'synthesizing' | 'concluded' | 'error' | 'paused_for_verdict';

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
  | 'KICKOFF_WITH_ABSOLUTE_TRUTH' // Memulai debat dengan fondasi Hukum 'Aqli dari Al-Sanusi
  | 'PERFORM_STEELMAN'          // Memerintahkan persona untuk memperkuat argumen lawan
  | 'MANDATE_SYNTHESIS'         // Memaksa dua persona untuk berkolaborasi menciptakan posisi baru
  | 'REQUIRE_IMPACT_PROJECTION' // Meminta proyeksi dampak dari sebuah argumen
  | 'CONTINUE_DEBATE'           // Melanjutkan alur debat standar (Khatib -> Faqih -> etc.)
  | 'REFINE_ARGUMENT'           // Meminta perbaikan/penajaman argumen spesifik
  | 'SUMMARIZE_AND_CONCLUDE';   // Menghentikan debat dan memerintahkan sintesis akhir

export interface MizanInstruction {
    action: MizanAction;
    target_personas: Persona[];
    statement_for_transcript: string; // NEW: For public display
    direct_instruction: string;       // NEW: Clean command for the next AI
}

// NEW: Defining the data structure for Al-Hakim's decision
export interface HakimEvaluationCriteria {
  score: number; // Score from 0 to 1
  justification: string;
}

// MODIFIED: Incorporating Al-Hakim into the Council's state
export interface MuzakarahState {
  status: MuzakarahSessionStatus;
  participants: {
    'Al-Khatib': ParticipantState;
    'Al-Faqih': ParticipantState;
    'Al-Hypothesis': ParticipantState;
    'Al-Mizan': ParticipantState;
    'Al-Mudawwin': ParticipantState;
    'Al-Nadhir': ParticipantState;
    'Al-Hakim': ParticipantState; // NEWLY ADDED
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

export interface SarcasmFactors {
  tension: number;
  queryQuality: number;
  userHistory: number;
  timeOfDay: number;
}