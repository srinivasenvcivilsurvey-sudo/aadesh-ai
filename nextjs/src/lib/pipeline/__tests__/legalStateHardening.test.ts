import { describe, expect, it } from 'vitest';
import {
  computeAttestationHash,
  computeFinalManifestHash,
  computeManifestSeedHash,
  validateGenerateGate,
} from '../legalState';

const validOrder = {
  state: 'reasoned' as const,
  upload_sha256: 'a'.repeat(64),
  attestation_hash: 'b'.repeat(64),
  reasoning_hash: 'c'.repeat(64),
  locked_at: new Date().toISOString(),
  locked_name: 'Officer Name',
  attestation_nonce: 'd'.repeat(64),
  attestation_nonce_consumed: false,
};

describe('Entity Lock hardening gate', () => {
  it('direct generate without entity lock is rejected', () => {
    const gate = validateGenerateGate({ ...validOrder, state: 'uploaded', attestation_hash: null });
    expect(gate.allowed).toBe(false);
    if (!gate.allowed) expect(gate.status).toBe(409);
  });

  it('generate without reasoning is rejected', () => {
    const gate = validateGenerateGate({ ...validOrder, state: 'entity_locked', reasoning_hash: null });
    expect(gate.allowed).toBe(false);
    if (!gate.allowed) expect(gate.status).toBe(409);
  });

  it('replay of consumed attestation is rejected', () => {
    const gate = validateGenerateGate({ ...validOrder, attestation_nonce_consumed: true });
    expect(gate.allowed).toBe(false);
    if (!gate.allowed) expect(gate.status).toBe(409);
  });

  it('stale lock is rejected with 410', () => {
    const old = new Date(Date.now() - 90 * 60 * 60 * 1000).toISOString();
    const gate = validateGenerateGate({ ...validOrder, locked_at: old });
    expect(gate.allowed).toBe(false);
    if (!gate.allowed) expect(gate.status).toBe(410);
  });

  it('valid reasoned or manifest_seeded states pass', () => {
    expect(validateGenerateGate(validOrder).allowed).toBe(true);
    expect(validateGenerateGate({ ...validOrder, state: 'manifest_seeded' }).allowed).toBe(true);
  });

  it('attestation hash is bound to server nonce', () => {
    const base = {
      user_id: 'u1',
      order_id: 'o1',
      locked_name: 'Officer Name',
      locked_at: '2026-04-26T00:00:00.000Z',
      confirmed_fields: { petitioner: 'A' },
      conflict_reasons: {},
      field_timings: { petitioner: 16000 },
    };
    const h1 = computeAttestationHash({ ...base, attestation_nonce: '1'.repeat(64) });
    const h2 = computeAttestationHash({ ...base, attestation_nonce: '2'.repeat(64) });
    expect(h1).not.toBe(h2);
  });

  it('manifest seed and final manifest are deterministic and input-bound', () => {
    const seed = computeManifestSeedHash({
      user_id: 'u1',
      order_id: 'o1',
      upload_sha256: 'a'.repeat(64),
      attestation_hash: 'b'.repeat(64),
      reasoning_hash: 'c'.repeat(64),
      attestation_nonce: 'd'.repeat(64),
      prompt_version: 'V3.2.7',
    });

    const final1 = computeFinalManifestHash({
      seed_hash: seed,
      output_hash: 'e'.repeat(64),
      model: 'claude-sonnet-4-6',
      prompt_version: 'V3.2.7',
      generated_at: '2026-04-26T00:00:00.000Z',
      input_tokens: 10,
      output_tokens: 20,
    });
    const final2 = computeFinalManifestHash({
      seed_hash: seed,
      output_hash: 'f'.repeat(64),
      model: 'claude-sonnet-4-6',
      prompt_version: 'V3.2.7',
      generated_at: '2026-04-26T00:00:00.000Z',
      input_tokens: 10,
      output_tokens: 20,
    });
    expect(final1).not.toBe(final2);
  });
});
