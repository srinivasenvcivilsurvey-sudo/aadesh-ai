/**
 * Aadesh AI — Legal Shield Layer 6: Public Verification Portal
 *
 * Route: /verify?m=<manifest_hash>
 *
 * Server component — no "use client". No auth required. Public endpoint.
 * Allows anyone (court, advocate, RTI applicant) to verify that a given
 * Aadesh-generated order was produced by the platform and has not been tampered.
 *
 * robots.txt: This page should remain crawlable (do not add to disallow list).
 * Search engine indexing of verification URLs helps establish chain of custody.
 */

import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

// ── In-memory rate limiter: 30 req / IP / hour ───────────────────────────────
// Single PM2 process on VPS — no Redis needed for Phase 0.

interface IpWindow {
  count: number;
  resetAt: number;
}

const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour in ms

const ipStore = new Map<string, IpWindow>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const window = ipStore.get(ip);

  if (!window || now >= window.resetAt) {
    ipStore.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }

  if (window.count >= RATE_LIMIT) {
    return false;
  }

  ipStore.set(ip, { count: window.count + 1, resetAt: window.resetAt });
  return true;
}

// ── IST date formatter ────────────────────────────────────────────────────────

function formatIst(isoString: string): string {
  try {
    const date = new Date(isoString);
    const istOffsetMs = 5.5 * 60 * 60 * 1000; // UTC+5:30
    const ist = new Date(date.getTime() + istOffsetMs);
    const dd = String(ist.getUTCDate()).padStart(2, '0');
    const mm = String(ist.getUTCMonth() + 1).padStart(2, '0');
    const yyyy = ist.getUTCFullYear();
    const hh = String(ist.getUTCHours()).padStart(2, '0');
    const min = String(ist.getUTCMinutes()).padStart(2, '0');
    return `${dd}-${mm}-${yyyy} ${hh}:${min} IST`;
  } catch {
    return isoString;
  }
}

// ── DB row type ───────────────────────────────────────────────────────────────

interface OrderRow {
  id: string;
  created_at: string;
  model_used: string;
  prompt_version: string;
  manifest_hash: string;
  attestation_hash: string | null;
  reasoning_hash: string | null;
  input_pdf_sha256: string | null;
  platform_signature: string | null;
  consistency_check_passed: boolean | null;
}

// ── Page props (Next.js 15 App Router — searchParams is a Promise) ────────────

interface VerifyPageProps {
  searchParams: Promise<{ m?: string }>;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const params = await searchParams;
  const manifestHash = params.m ?? '';

  // ── Rate limiting ─────────────────────────────────────────────────────────

  const headersList = await headers();
  const ip =
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headersList.get('x-real-ip') ??
    'unknown';

  if (!checkRateLimit(ip)) {
    return (
      <Layout>
        <ErrorPanel message="Rate limit exceeded. Please try again later." />
      </Layout>
    );
  }

  // ── Validate manifest hash (must be exactly 64 hex chars) ─────────────────

  const HEX_64 = /^[0-9a-f]{64}$/i;

  if (!manifestHash || !HEX_64.test(manifestHash)) {
    return (
      <Layout>
        <ErrorPanel message="Invalid verification link. Please check the URL and try again." />
      </Layout>
    );
  }

  // ── Supabase config guard ─────────────────────────────────────────────────

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return (
      <Layout>
        <ErrorPanel message="Verification service is not configured. Please contact the platform administrator." />
      </Layout>
    );
  }

  // ── DB lookup — service role bypasses RLS; read-only query ───────────────

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data, error } = await supabase
    .from('orders')
    .select(
      'id, created_at, model_used, prompt_version, manifest_hash, attestation_hash, reasoning_hash, input_pdf_sha256, platform_signature, consistency_check_passed'
    )
    .eq('manifest_hash', manifestHash)
    .maybeSingle();

  if (error) {
    return (
      <Layout>
        <ErrorPanel message="Verification lookup failed. Please try again shortly." />
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <ErrorPanel message="Manifest not found. This document may be forged or the verification link is incorrect." />
      </Layout>
    );
  }

  const row = data as OrderRow;

  // ── Verified panel ────────────────────────────────────────────────────────

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        {/* Verified badge */}
        <div className="flex items-center gap-3 mb-8">
          <span className="flex items-center gap-2 bg-green-100 text-green-800 text-sm font-semibold px-4 py-2 rounded-full border border-green-300">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Verified
          </span>
          <span className="text-slate-500 text-sm">
            This order is on record in the Aadesh AI platform.
          </span>
        </div>

        {/* Details card */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm divide-y divide-slate-100">
          <Section label="Generated at">
            <span className="font-mono text-slate-800">{formatIst(row.created_at)}</span>
          </Section>

          <Section label="AI Model">
            <span className="text-slate-800">{row.model_used}</span>
            <span className="ml-3 text-slate-400 text-sm">Prompt {row.prompt_version}</span>
          </Section>

          <Section label="Consistency check">
            {row.consistency_check_passed === true ? (
              <Badge color="green">Passed</Badge>
            ) : row.consistency_check_passed === false ? (
              <Badge color="red">Failed</Badge>
            ) : (
              <Badge color="slate">Not run</Badge>
            )}
          </Section>

          <Section label="Platform signature">
            {row.platform_signature ? (
              <Badge color="green">Signed</Badge>
            ) : (
              <Badge color="slate">Unsigned (Phase 0)</Badge>
            )}
          </Section>

          {/* All hashes — full 64 chars, monospace, no truncation */}
          <HashRow label="Manifest hash (SHA-256)" value={row.manifest_hash} />

          {row.attestation_hash && (
            <HashRow label="Entity attestation hash — L3" value={row.attestation_hash} />
          )}

          {row.reasoning_hash && (
            <HashRow label="Officer reasoning hash — L3.5" value={row.reasoning_hash} />
          )}

          {row.input_pdf_sha256 && (
            <HashRow label="Input PDF SHA-256" value={row.input_pdf_sha256} />
          )}

          <Section label="Order ID">
            <span className="font-mono text-xs text-slate-500 break-all">{row.id}</span>
          </Section>
        </div>

        {/* Explanatory note */}
        <p className="mt-6 text-xs text-slate-400 leading-relaxed">
          Hashes are SHA-256 fingerprints computed at the moment of generation.
          Any change to the order after generation will produce a different hash.
          The manifest hash is stored permanently and cannot be modified.
        </p>
      </div>
    </Layout>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Aadesh AI — Order Verification
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            ಆದೇಶ AI ದಾಖಲೆ ಪರಿಶೀಲನೆ
          </p>
        </div>

        {children}

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-slate-200 text-center">
          <p
            className="text-xs text-slate-400 leading-relaxed"
            style={{ fontFamily: "'Noto Sans Kannada', sans-serif" }}
          >
            ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ಸಹಾಯದಿಂದ ಕರಡು — ಅಧಿಕಾರಿಯಿಂದ ಪರಿಶೀಲಿಸಿ ಅಂತಿಮಗೊಳಿಸಲಾಗಿದೆ
          </p>
          <p className="mt-1 text-xs text-slate-400">
            AI-assisted draft — verified and finalised by officer
          </p>
        </footer>
      </div>
    </main>
  );
}

function ErrorPanel({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-3xl mx-auto">
      <div className="flex items-start gap-3">
        <svg
          className="w-5 h-5 text-red-500 mt-0.5 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
          />
        </svg>
        <p className="text-sm text-red-700">{message}</p>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
      <span className="text-xs font-medium text-slate-400 uppercase tracking-wide w-52 shrink-0">
        {label}
      </span>
      <span className="flex items-center flex-wrap gap-2">{children}</span>
    </div>
  );
}

function HashRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-6 py-4 flex flex-col gap-1.5">
      <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
        {label}
      </span>
      {/* Full 64-char hash, monospace, no truncation, select-all for easy copy */}
      <span className="font-mono text-xs text-slate-700 break-all bg-slate-50 border border-slate-100 rounded px-3 py-2 select-all leading-relaxed">
        {value}
      </span>
    </div>
  );
}

function Badge({
  color,
  children,
}: {
  color: 'green' | 'red' | 'slate';
  children: React.ReactNode;
}) {
  const styles: Record<'green' | 'red' | 'slate', string> = {
    green: 'bg-green-100 text-green-700 border-green-200',
    red: 'bg-red-100 text-red-700 border-red-200',
    slate: 'bg-slate-100 text-slate-500 border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full border ${styles[color]}`}
    >
      {children}
    </span>
  );
}
