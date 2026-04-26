import { createHash, randomBytes, timingSafeEqual } from 'crypto';

export const LEGAL_SCHEMA_VERSION = 'v1.0';
export const DEFAULT_LEGAL_LOCK_TTL_HOURS = 72;

export type LegalOrderState =
  | 'draft'
  | 'uploaded'
  | 'entity_locked'
  | 'reasoned'
  | 'manifest_seeded'
  | 'generating'
  | 'generation_failed'
  | 'generated'
  | 'signed'
  | 'verified';

export function canonicalJson(obj: unknown): string {
  if (obj === null || obj === undefined) return JSON.stringify(obj);
  if (Array.isArray(obj)) return `[${obj.map(canonicalJson).join(',')}]`;
  if (typeof obj === 'object') {
    const record = obj as Record<string, unknown>;
    return `{${Object.keys(record).sort().map((key) => (
      `${JSON.stringify(key)}:${canonicalJson(record[key])}`
    )).join(',')}}`;
  }
  return JSON.stringify(obj);
}

export function sha256Hex(input: string | Buffer): string {
  return createHash('sha256').update(input).digest('hex');
}

export function timingSafeHexEqual(a: string, b: string): boolean {
  if (!/^[0-9a-f]+$/i.test(a) || !/^[0-9a-f]+$/i.test(b)) return false;
  const aa = Buffer.from(a, 'hex');
  const bb = Buffer.from(b, 'hex');
  if (aa.length !== bb.length) {
    timingSafeEqual(aa, aa);
    return false;
  }
  return timingSafeEqual(aa, bb);
}

export function newAttestationNonce(): string {
  return randomBytes(32).toString('hex');
}

export interface AttestationHashInput {
  user_id: string;
  order_id: string;
  locked_name: string;
  locked_at: string;
  attestation_nonce: string;
  confirmed_fields: Record<string, string>;
  conflict_reasons: Record<string, string>;
  field_timings: Record<string, number>;
  schema_version?: string;
}

export function computeAttestationHash(input: AttestationHashInput): string {
  return sha256Hex(canonicalJson({
    user_id: input.user_id,
    order_id: input.order_id,
    locked_name: input.locked_name,
    locked_at: input.locked_at,
    attestation_nonce: input.attestation_nonce,
    confirmed_fields: input.confirmed_fields,
    conflict_reasons: input.conflict_reasons,
    field_timings: input.field_timings,
    schema_version: input.schema_version ?? LEGAL_SCHEMA_VERSION,
  }));
}

export interface ReasoningHashInput {
  user_id: string;
  order_id: string;
  attestation_hash: string;
  key_issue: string;
  documents_relied: string[];
  decision_reasoning: string;
  schema_version?: string;
}

export function computeReasoningHash(input: ReasoningHashInput): string {
  return sha256Hex(canonicalJson({
    user_id: input.user_id,
    order_id: input.order_id,
    attestation_hash: input.attestation_hash,
    key_issue: input.key_issue,
    documents_relied: input.documents_relied,
    decision_reasoning: input.decision_reasoning,
    schema_version: input.schema_version ?? LEGAL_SCHEMA_VERSION,
  }));
}

export interface ManifestSeedInput {
  user_id: string;
  order_id: string;
  upload_sha256: string;
  attestation_hash: string;
  reasoning_hash: string;
  attestation_nonce: string;
  prompt_version: string;
  schema_version?: string;
}

export function computeManifestSeedHash(input: ManifestSeedInput): string {
  return sha256Hex(canonicalJson({
    user_id: input.user_id,
    order_id: input.order_id,
    upload_sha256: input.upload_sha256,
    attestation_hash: input.attestation_hash,
    reasoning_hash: input.reasoning_hash,
    attestation_nonce: input.attestation_nonce,
    prompt_version: input.prompt_version,
    schema_version: input.schema_version ?? LEGAL_SCHEMA_VERSION,
  }));
}

export interface FinalManifestInput {
  seed_hash: string;
  output_hash: string;
  model: string;
  prompt_version: string;
  generated_at: string;
  input_tokens: number;
  output_tokens: number;
  schema_version?: string;
}

export function computeFinalManifestHash(input: FinalManifestInput): string {
  return sha256Hex(canonicalJson({
    seed_hash: input.seed_hash,
    output_hash: input.output_hash,
    model: input.model,
    prompt_version: input.prompt_version,
    generated_at: input.generated_at,
    input_tokens: input.input_tokens,
    output_tokens: input.output_tokens,
    schema_version: input.schema_version ?? LEGAL_SCHEMA_VERSION,
  }));
}

export function legalLockTtlMs(): number {
  const raw = Number(process.env.ENTITY_LOCK_TTL_HOURS ?? DEFAULT_LEGAL_LOCK_TTL_HOURS);
  const hours = Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_LEGAL_LOCK_TTL_HOURS;
  return hours * 60 * 60 * 1000;
}

export function isLockExpired(lockedAt: string | Date, now = Date.now()): boolean {
  const ts = lockedAt instanceof Date ? lockedAt.getTime() : new Date(lockedAt).getTime();
  if (!Number.isFinite(ts)) return true;
  return now - ts > legalLockTtlMs();
}

export interface GenerateGateInput {
  state: LegalOrderState;
  upload_sha256?: string | null;
  attestation_hash?: string | null;
  reasoning_hash?: string | null;
  locked_at?: string | Date | null;
  locked_name?: string | null;
  attestation_nonce?: string | null;
  attestation_nonce_consumed?: boolean | null;
}

export function validateGenerateGate(order: GenerateGateInput): { allowed: true } | { allowed: false; status: number; reason: string } {
  if (!['reasoned', 'manifest_seeded'].includes(order.state)) {
    return { allowed: false, status: 409, reason: `expected state=reasoned or manifest_seeded, got ${order.state}` };
  }
  if (!order.upload_sha256 || !order.attestation_hash || !order.reasoning_hash || !order.locked_at || !order.locked_name || !order.attestation_nonce) {
    return { allowed: false, status: 409, reason: 'missing prerequisite legal hash or identity field' };
  }
  if (order.attestation_nonce_consumed) {
    return { allowed: false, status: 409, reason: 'attestation nonce already consumed' };
  }
  if (isLockExpired(order.locked_at)) {
    return { allowed: false, status: 410, reason: 'Entity Lock expired. Please verify entities again.' };
  }
  return { allowed: true };
}
