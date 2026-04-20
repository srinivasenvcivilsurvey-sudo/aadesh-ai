/**
 * Aadesh AI — Legal Shield Layer 4: Manifest Builder
 *
 * Server-only module. Produces a tamper-evident audit manifest for every
 * generated order. The manifest captures every material fact about the
 * generation — input PDF hash, extracted entities, officer reasoning,
 * order content — and returns a canonical SHA-256 hash that is stored
 * alongside the order in the database.
 *
 * Layer 4 is called at the end of the generation pipeline, after the order
 * text is finalised and before the DOCX is exported.
 */

import { createHash, sign } from 'crypto';

// ── Manifest Schema ──────────────────────────────────────────────────────────

export interface AadeshManifest {
  version: 'Aadesh-Audit-1.0';
  input: {
    file_name: string;
    sha256: string;
    pages: number;
  };
  extraction: {
    fields: Record<string, unknown>;
    confidence?: Record<string, number>;
  };
  entity_lock: {
    attestation_hash: string;
    attested_by: string;
    attested_at: string;
  };
  reasoning: {
    reasoning_hash: string;
    key_issue: string;
    documents_relied: string[];
    decision_reasoning: string;
  };
  order: {
    content_hash: string;
    word_count: number;
  };
  ai: {
    model: string;
    prompt_version: string;
    tokens_in: number;
    tokens_out: number;
  };
  system: {
    app_version: string;
    region: string;
    generated_at: string;
  };
}

// ── Build Params ─────────────────────────────────────────────────────────────

export interface BuildManifestParams {
  fileName: string;
  fileSha256: string;
  pageCount: number;
  extractedFields: Record<string, unknown>;
  attestedBy: string;
  attestedAt: string;
  attestationHash: string;
  reasoningHash: string;
  keyIssue: string;
  documentsRelied: string[];
  decisionReasoning: string;
  orderText: string;
  model: string;
  promptVersion: string;
  tokensIn: number;
  tokensOut: number;
}

export interface BuildManifestResult {
  manifest: AadeshManifest;
  manifest_hash: string;
  platform_signature: string | null;
}

// ── Canonical JSON ────────────────────────────────────────────────────────────

/**
 * Produce a deterministic JSON string by sorting object keys lexicographically
 * at every nesting level. Arrays preserve element order. Primitives pass through.
 *
 * This ensures the same manifest always produces the same hash regardless of
 * the key insertion order in the JS runtime.
 */
export function canonicalJson(obj: unknown): string {
  if (obj === null || obj === undefined) {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    const items = obj.map((item) => canonicalJson(item));
    return `[${items.join(',')}]`;
  }

  if (typeof obj === 'object') {
    const record = obj as Record<string, unknown>;
    const sortedKeys = Object.keys(record).sort();
    const pairs = sortedKeys.map(
      (key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`
    );
    return `{${pairs.join(',')}}`;
  }

  // Primitive: string, number, boolean
  return JSON.stringify(obj);
}

// ── Hash Computation ──────────────────────────────────────────────────────────

/**
 * Compute SHA-256 hex digest of the canonical JSON representation of a manifest.
 */
export function computeManifestHash(manifest: AadeshManifest): string {
  return createHash('sha256').update(canonicalJson(manifest), 'utf8').digest('hex');
}

// ── Platform Signature ────────────────────────────────────────────────────────

/**
 * Optionally sign the manifest hash with the platform's RSA/EC private key.
 *
 * Phase 0: Signing is optional. If PLATFORM_SIGNING_KEY_PEM is not set, or if
 * the key format is invalid, this returns null without blocking order generation.
 *
 * When set, the key must be a PEM-encoded private key (RSA or EC). The returned
 * value is a base64 string of the RSA/EC signature over the raw hash bytes.
 */
export function signManifest(manifestHash: string): string | null {
  const privateKeyPem = process.env.PLATFORM_SIGNING_KEY_PEM;

  if (!privateKeyPem) {
    return null;
  }

  try {
    const signature = sign(
      'sha256',
      Buffer.from(manifestHash, 'hex'),
      privateKeyPem
    );
    return signature.toString('base64');
  } catch {
    // Key format mismatch or other crypto error — don't block generation
    return null;
  }
}

// ── Build Manifest ────────────────────────────────────────────────────────────

/**
 * Assemble the full AadeshManifest from pipeline params, compute its canonical
 * SHA-256 hash, and optionally sign it.
 *
 * Single entry point called by the generate API route after order text is
 * finalised and all Legal Shield layers (L1–L3.5) have completed.
 */
export function buildManifest(params: BuildManifestParams): BuildManifestResult {
  const {
    fileName,
    fileSha256,
    pageCount,
    extractedFields,
    attestedBy,
    attestedAt,
    attestationHash,
    reasoningHash,
    keyIssue,
    documentsRelied,
    decisionReasoning,
    orderText,
    model,
    promptVersion,
    tokensIn,
    tokensOut,
  } = params;

  // SHA-256 of the finalised Kannada order text
  const contentHash = createHash('sha256').update(orderText, 'utf8').digest('hex');

  // Word count — split on any whitespace, discard empty tokens
  const wordCount = orderText.split(/\s+/).filter(Boolean).length;

  const manifest: AadeshManifest = {
    version: 'Aadesh-Audit-1.0',
    input: {
      file_name: fileName,
      sha256: fileSha256,
      pages: pageCount,
    },
    extraction: {
      fields: extractedFields,
    },
    entity_lock: {
      attestation_hash: attestationHash,
      attested_by: attestedBy,
      attested_at: attestedAt,
    },
    reasoning: {
      reasoning_hash: reasoningHash,
      key_issue: keyIssue,
      documents_relied: documentsRelied,
      decision_reasoning: decisionReasoning,
    },
    order: {
      content_hash: contentHash,
      word_count: wordCount,
    },
    ai: {
      model,
      prompt_version: promptVersion,
      tokens_in: tokensIn,
      tokens_out: tokensOut,
    },
    system: {
      app_version: process.env.npm_package_version ?? '1.0.0',
      region: process.env.VPS_REGION ?? 'in-blr',
      generated_at: new Date().toISOString(),
    },
  };

  const manifestHash = computeManifestHash(manifest);
  const platformSignature = signManifest(manifestHash);

  return {
    manifest,
    manifest_hash: manifestHash,
    platform_signature: platformSignature,
  };
}
