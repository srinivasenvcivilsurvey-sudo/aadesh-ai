/**
 * Aadesh AI â€” Generation Pipeline Types
 * Shared across all pipeline steps (client + server)
 */

// â”€â”€ Pipeline Step State Machine â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type PipelineStep =
  | 'upload'       // File upload + validation
  | 'reading'      // Claude Vision reading the case file
  | 'questions'    // Officer answering clarifying questions
  | 'generating'   // AI generating the order (SSE stream)
  | 'preview'      // Officer reviewing + editing
  | 'downloading'; // DOCX export + download

// â”€â”€ Case Summary (returned by Vision Reader) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface CaseSummary {
  caseType: string;
  parties: {
    petitioner: string;
    respondent: string;
  };
  keyFacts: string[];
  reliefSought: string;
}

// â”€â”€ Officer Answers (collected in QuestionsStep) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type OrderOutcome = 'Allowed' | 'Dismissed' | 'Remanded';

export type SelectedModel = 'sarvam' | 'anthropic' | 'openrouter';

export interface OfficerAnswers {
  outcome: OrderOutcome;
  officerName: string;
  orderDate: string;          // ISO date string: YYYY-MM-DD
  relatedCases?: string;      // optional free text
  aiQuestionAnswer: string;   // answer to first AI-generated question (backward compat)
  aiQuestionAnswers?: string[];  // all AI question answers (indices 0-4)
  selectedModel?: SelectedModel; // AI provider chosen by officer (default: sarvam)
}

// â”€â”€ Guardrail Result (from Audit Engine) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface GuardrailResult {
  sectionCompleteness: boolean | null;
  kannadaPurity: boolean | null;
  factPreservation: boolean | null;
  wordCount: boolean | null;
  score: number;              // 0â€“4, one point per passing check
  failures: string[];
}

// â”€â”€ Pipeline Error â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type PipelineErrorCode =
  | 'VALIDATION_ERROR'
  | 'VISION_ERROR'
  | 'GENERATION_ERROR'
  | 'AUDIT_ERROR'
  | 'EXPORT_ERROR'
  | 'CREDIT_ERROR'
  | 'RATE_LIMIT'
  | 'TIMEOUT'
  | 'NETWORK_ERROR';

export interface PipelineError {
  code: PipelineErrorCode;
  message: string;       // English
  messageKn: string;     // Kannada
  retryable: boolean;
}

// â”€â”€ Built Prompt (assembled by Prompt Builder) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface AnthropicCacheControl {
  type: 'ephemeral';
}

export interface AnthropicContentBlock {
  type: 'text';
  text: string;
  cache_control?: AnthropicCacheControl;
}

export interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: AnthropicContentBlock[];
}

export interface BuiltPrompt {
  messages: AnthropicMessage[];
  estimatedTokens: number;
}

// â”€â”€ Pipeline State (held in PipelineContainer useReducer) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface PipelineState {
  step: PipelineStep;
  caseType: string | null;
  caseSummary: CaseSummary | null;
  aiQuestions: string[];
  officerAnswers: OfficerAnswers | null;
  generatedText: string;
  editedText: string;
  guardrailScore: number | null;
  orderId: string | null;
  error: PipelineError | null;
  retryCount: number;
  credits: number;
  // Session tracking for cache miss detection
  sessionOrderCount: number;
  // v9.2: token tracking from generate done event
  modelUsed: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  promptVersion: string;
}

// â”€â”€ Pipeline Actions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type PipelineAction =
  | { type: 'SET_STEP'; step: PipelineStep }
  | { type: 'SET_CASE_SUMMARY'; caseSummary: CaseSummary; aiQuestions: string[]; caseType: string }
  | { type: 'SET_ANSWERS'; answers: OfficerAnswers }
  | { type: 'APPEND_STREAM'; chunk: string }
  | { type: 'SET_GENERATED_TEXT'; text: string; guardrailScore: number; modelUsed?: string; inputTokens?: number | null; outputTokens?: number | null }
  | { type: 'SET_EDITED_TEXT'; text: string }
  | { type: 'SET_ERROR'; error: PipelineError }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_CREDITS'; credits: number }
  | { type: 'INCREMENT_RETRY' }
  | { type: 'RESET_RETRY' }
  | { type: 'SET_ORDER_ID'; orderId: string };
  // INCREMENT_SESSION_ORDER_COUNT removed — SET_GENERATED_TEXT already increments sessionOrderCount

// â”€â”€ Validate API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type AllowedFileType = 'pdf' | 'docx' | 'jpg' | 'png';

export interface ValidateResponse {
  valid: boolean;
  pageCount: number;
  fileType: AllowedFileType;
  error?: string;
}

// â”€â”€ Vision Read API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface VisionReadResponse {
  caseSummary: CaseSummary;
  questions: string[];
  caseType: string;
}

// â”€â”€ Export DOCX API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface ExportDocxRequest {
  finalText: string;
  caseType: string;
  caseNumber: string;
  orderDate: string;
  officerName: string;
  userId: string;
  guardrailScore: number;
  modelUsed: string;
  // v9.2 additions
  promptVersion?: string;
  inputTokens?: number | null;
  outputTokens?: number | null;
  acknowledgementAt?: string | null;
}

export interface ExportDocxResponse {
  downloadUrl: string;
  orderId: string;
  fileName: string;
}

