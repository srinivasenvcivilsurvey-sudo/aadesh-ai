"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, Upload, BrainCircuit, FileCheck2, Lock, MapPin,
  Sparkles, Check, ShieldCheck, Landmark, Scale, ChevronDown, Globe,
} from "lucide-react";
import { useLanguage } from "@/lib/context/LanguageContext";
import { createSPAClient } from "@/lib/supabase/client";

// ── Design tokens from AADESH_DESIGN.md ──────────────────────────────────────
const C = {
  saffron: "#E97B3B",
  saffronDark: "#BF360C",
  navy: "#1A237E",
  navyDark: "#0D1559",
  cream: "#FFF7F0",
  peach: "#FDF1E8",
  warmWhite: "#FFFCFA",
  charcoal: "#1F2937",
  midGray: "#6B7280",
  lightGray: "#F3F4F6",
  borderWarm: "#F3E5D8",
  successGreen: "#1D9E75",
  govBlue: "#1E3A8A",
  govBlueBg: "#DBEAFE",
  proPurple: "#5B21B6",
  proPurpleBg: "#EDE9FE",
  saffronBadgeBg: "#FAEEDA",
  saffronBadgeText: "#854F0B",
  greenBg: "#E1F5EE",
  greenText: "#0F6E56",
  redBg: "#FCEBEB",
  redText: "#991B1B",
  gold: "#F9A825",
  brownDisplay: "#3F1A08",
};

// ── Mock document lines for typing animation ─────────────────────────────────
const MOCK_DOC_LINES = [
  "ಜಿಲ್ಲಾಧಿಕಾರಿಗಳ ಕಚೇರಿ, ಬೆಂಗಳೂರು ನಗರ ಜಿಲ್ಲೆ",
  "",
  "ಸಂ: ಜಿ.ತಾಂ.ಸ/ಭೂ.ಉ.ನಿ/ಅಪೀಲು:17/2026",
  "ದಿನಾಂಕ: 11-04-2026",
  "",
  "ಉಪಸ್ಥಿತರು:",
  "ಶ್ರೀಮತಿ ಪಿ.ಎಸ್. ಕುಸುಮಲತಾ, ಎಂ.ಎ, ಕೆ.ಜಿ.ಎಸ್.",
  "",
  "ಪ್ರಸ್ತಾವನೆ:—",
  "ಮೇಲ್ಮನವಿದಾರರಾದ ಶ್ರೀ ಕೆ.ಎಸ್. ರುದ್ರೇಶ್ ರವರು ಕರ್ನಾಟಕ",
  "ಭೂಕಂದಾಯ ಅಧಿನಿಯಮ 1964 ರ ಕಲಂ 49(ಎ) ರ ಅಡಿಯಲ್ಲಿ...",
];

// ── Typewriter hero words ─────────────────────────────────────────────────────
const TYPEWRITER_EN = [
  "Formal Document",
  "Land Record Order",
  "Appeal Order",
  "Revenue Notice",
  "Mutation Order",
];

const TYPEWRITER_KN = [
  "ಔಪಚಾರಿಕ ದಾಖಲೆ",
  "ಭೂ ದಾಖಲೆ ಆದೇಶ",
  "ಮೇಲ್ಮನವಿ ಆದೇಶ",
  "ಕಂದಾಯ ನೋಟಿಸ್",
  "ಮ್ಯುಟೇಶನ್ ಆದೇಶ",
];

function graphemes(text: string): string[] {
  try {
    const seg = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    return [...seg.segment(text)].map((s) => s.segment);
  } catch {
    return Array.from(text);
  }
}

function TypewriterWord({ locale }: { locale: string }) {
  const words = locale === "kn" ? TYPEWRITER_KN : TYPEWRITER_EN;
  const [wordIndex, setWordIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState<"typing" | "deleting">("typing");

  const chars = useMemo(() => graphemes(words[wordIndex]), [words, wordIndex]);

  useEffect(() => {
    if (phase === "typing") {
      if (count < chars.length) {
        const id = setTimeout(() => setCount((c) => c + 1), 80);
        return () => clearTimeout(id);
      }
      // Fully typed — pause then delete
      const id = setTimeout(() => setPhase("deleting"), 1800);
      return () => clearTimeout(id);
    }
    // Deleting
    if (count > 0) {
      const id = setTimeout(() => setCount((c) => c - 1), 45);
      return () => clearTimeout(id);
    }
    // Fully deleted — next word
    setWordIndex((i) => (i + 1) % words.length);
    setPhase("typing");
  }, [count, phase, chars.length, words.length]);

  return (
    <span style={{ color: C.saffron }}>
      {chars.slice(0, count).join("")}
      <span style={{
        display: "inline-block",
        width: 3,
        height: "0.82em",
        background: C.saffron,
        marginLeft: 2,
        verticalAlign: "middle",
        animation: "ddlrBlink 1s steps(2) infinite",
      }} />
    </span>
  );
}

// ── Floating MockDocument with typing animation ──────────────────────────────
function MockDocument() {
  const [visibleLines, setVisibleLines] = useState(0);
  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      i = i + 1;
      if (i > MOCK_DOC_LINES.length) i = 0;
      setVisibleLines(i);
    }, 550);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <div style={{
        position: "relative", background: "white", borderRadius: 16, border: `0.5px solid ${C.borderWarm}`,
        padding: "24px 32px", minHeight: 380, fontFamily: "'Noto Serif Kannada', 'Noto Serif', serif",
        boxShadow: "rgba(233,123,59,0.08) 0px 8px 32px, rgba(0,0,0,0.06) 0px 2px 8px, rgba(0,0,0,0.02) 0px 0px 1px",
      }}>
        {/* Tricolor ribbon */}
        <div style={{
          position: "absolute", top: -6, left: 24, right: 24, height: 4, borderRadius: 4,
          background: `linear-gradient(90deg, ${C.saffron} 0%, ${C.gold} 50%, #138808 100%)`,
        }} />
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, fontWeight: 600, color: C.navy }}>
            Government of Karnataka
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: "#9CA3AF" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#EF4444", animation: "ddlrPulse 1.5s ease-in-out infinite" }} />
            Drafting...
          </div>
        </div>
        {/* Typing lines */}
        <div style={{ fontSize: 13, lineHeight: 1.85, color: C.charcoal }}>
          {MOCK_DOC_LINES.slice(0, visibleLines).map((line, i) => (
            <div key={i} style={{
              minHeight: line === "" ? 8 : "auto",
              animation: "ddlrLineIn 400ms ease-out forwards",
            }}>{line}</div>
          ))}
          {visibleLines < MOCK_DOC_LINES.length && (
            <span style={{ display: "inline-block", width: 2, height: 16, background: C.saffron, animation: "ddlrBlink 1s steps(2) infinite", verticalAlign: "middle" }} />
          )}
        </div>
        {/* Gold seal */}
        <div style={{
          position: "absolute", bottom: -20, right: -20, width: 72, height: 72,
          borderRadius: "50%", border: `3px solid ${C.gold}`, background: C.cream,
          display: "flex", alignItems: "center", justifyContent: "center",
          transform: "rotate(-8deg)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          animation: "ddlrSealPop 600ms ease-out",
        }}>
          <div style={{ textAlign: "center", lineHeight: 1.2 }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: C.navy }}>VERIFIED</div>
            <div style={{ fontSize: 7, color: C.saffron, fontWeight: 500 }}>ಆದೇಶ AI</div>
          </div>
        </div>
      </div>
      {/* Background sparkle */}
      <Sparkles style={{ position: "absolute", top: -28, left: -28, width: 56, height: 56, color: C.gold, opacity: 0.2 }} />
    </div>
  );
}

// ── Fade-in on scroll ────────────────────────────────────────────────────────
function useFadeIn<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    // Immediately show elements already in viewport — fixes blank sections
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) { setVisible(true); io.unobserve(e.target); } }); },
      { threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, visible };
}

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useFadeIn<HTMLDivElement>();
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(24px)",
      transition: `opacity 700ms ease-out ${delay}ms, transform 700ms ease-out ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

// ── Bilingual text helper ────────────────────────────────────────────────────
function Bi({ en, kn, locale }: { en: React.ReactNode; kn: React.ReactNode; locale: string }) {
  return locale === "kn" ? <>{kn}</> : <>{en}</>;
}

// ── Office typing animation panel ────────────────────────────────────────────
function OfficePanel({ office, orderType, lines, color, stagger }: {
  office: string; orderType: string; lines: string[]; color: string; stagger: number;
}) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [done, setDone] = useState(false);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const t = (fn: () => void, ms: number) => { const id = setTimeout(() => { if (!cancelled) fn(); }, ms); timers.push(id); return id; };
    t(() => {
      let i = 0;
      const iv = setInterval(() => {
        if (cancelled) { clearInterval(iv); return; }
        i++;
        setVisibleLines(i);
        if (i >= lines.length) {
          clearInterval(iv);
          t(() => setDone(true), 600);
          t(() => { setVisibleLines(0); setDone(false); setCycle(c => c + 1); }, 4000);
        }
      }, 440);
      timers.push(iv as unknown as ReturnType<typeof setTimeout>);
    }, stagger);
    return () => { cancelled = true; timers.forEach(clearTimeout); };
  }, [cycle, lines.length, stagger]);

  return (
    <div style={{ background: C.warmWhite, border: `0.5px solid ${C.borderWarm}`, borderRadius: 12, overflow: "hidden", minHeight: 200 }}>
      {/* Tricolor ribbon */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${C.saffron} 0%, #FFFFFF 50%, #138808 100%)` }} />
      {/* Header */}
      <div style={{ background: color, padding: "10px 14px" }}>
        <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 9, textTransform: "uppercase", letterSpacing: 1, fontWeight: 500 }}>{office}</div>
        <div style={{ color: "white", fontSize: 11, fontWeight: 500, marginTop: 2 }}>{orderType}</div>
      </div>
      {/* Body */}
      <div style={{ padding: "12px 14px", minHeight: 100, fontFamily: "'Noto Sans Kannada', sans-serif", fontSize: 12, lineHeight: 1.8, color: C.charcoal }}>
        {lines.slice(0, visibleLines).map((line, i) => (
          <div key={i} style={{ animation: "ddlrLineIn 440ms ease-out", marginBottom: 2 }}>{line}</div>
        ))}
        {!done && visibleLines < lines.length && (
          <span style={{ display: "inline-block", width: 2, height: 14, background: color, animation: "ddlrBlink 1s steps(2) infinite", verticalAlign: "middle" }} />
        )}
        {done && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, animation: "ddlrSealPop 400ms ease-out" }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: C.successGreen, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Check size={12} color="white" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: 11, color: C.successGreen, fontWeight: 500 }}>Complete</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── FAQ accordion ────────────────────────────────────────────────────────────
function FAQItem({ q, qKn, a, aKn, locale }: { q: string; qKn: string; a: string; aKn: string; locale: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: `1px solid rgba(0,0,0,0.08)`, borderRadius: 12, overflow: "hidden", background: "white", transition: "box-shadow 300ms ease" }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "none", border: "none", cursor: "pointer", textAlign: "left",
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: C.charcoal }}>{locale === "kn" ? qKn : q}</div>
          <div style={{ fontSize: 11, color: C.midGray, marginTop: 2, fontFamily: "'Noto Sans Kannada', sans-serif" }}>{locale === "kn" ? q : qKn}</div>
        </div>
        <ChevronDown size={18} color={C.midGray} style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 300ms ease-out", flexShrink: 0, marginLeft: 12 }} />
      </button>
      {open && (
        <div style={{ padding: "0 20px 16px", fontSize: 13, lineHeight: 1.7, color: C.midGray }}>
          {locale === "kn" ? aKn : a}
        </div>
      )}
    </div>
  );
}

// ── Government office cards ──────────────────────────────────────────────────
const GOV_OFFICES = [
  { en: "DC / AC Office", kn: "ಜಿಲ್ಲಾಧಿಕಾರಿ / ಸಹಾಯಕ ಆಯುಕ್ತರ ಕಛೇರಿ", docs: "Revenue orders, appeal orders, land acquisition" },
  { en: "Tahsildar Office", kn: "ತಹಶೀಲ್ದಾರ್ ಕಛೇರಿ", docs: "Mutation orders, RTC corrections, encroachment removal" },
  { en: "DDLR / ADLR Office", kn: "ಭೂದಾಖಲೆ ಕಛೇರಿ", docs: "Phodi durasti appeals, suo motu orders, OD cases" },
  { en: "BBMP / BDA / PDO", kn: "ನಗರ ಸ್ಥಳೀಯ ಸಂಸ್ಥೆ / ಪಂಚಾಯತ್", docs: "Khata orders, property tax notices" },
  { en: "Sub-Registrar / RTO", kn: "ನೋಂದಣಿ / ಸಾರಿಗೆ ಕಛೇರಿ", docs: "Registration orders, refusal notices" },
  { en: "Any other office", kn: "ಇತರ ಯಾವುದೇ ಕಛೇರಿ", docs: "Forest, Labour, Zilla Panchayat, Health...", accent: true },
];

const PRO_OFFICES = [
  { en: "Advocate / Law firm", kn: "ವಕೀಲರ ಕಛೇರಿ", docs: "Legal notices, petitions, court applications" },
  { en: "Chartered Accountant", kn: "ಚಾರ್ಟರ್ಡ್ ಅಕೌಂಟೆಂಟ್", docs: "Audit letters, compliance notices, IT responses" },
  { en: "Company Secretary", kn: "ಕಂಪನಿ ಸೆಕ್ರೆಟರಿ", docs: "Board resolutions, statutory notices" },
  { en: "Notary / Consultant", kn: "ನೊಟರಿ / ಸಲಹೆಗಾರರು", docs: "Affidavits, declarations, power of attorney" },
  { en: "Property professional", kn: "ಆಸ್ತಿ ವ್ಯವಹಾರ", docs: "Title opinions, encumbrance reports" },
  { en: "Any other profession", kn: "ಇತರ ಯಾವುದೇ ವೃತ್ತಿ", docs: "Any field with repeating formal documents", accent: true },
];

// ── Main component ───────────────────────────────────────────────────────────
export default function LandingPage() {
  const { locale, toggleLocale } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [orderCount, setOrderCount] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"gov" | "pro">("gov");
  const [drafterCost, setDrafterCost] = useState(1500);
  const [ordersPerMonth, setOrdersPerMonth] = useState(30);
  const aadeshCostPerOrder = 50;
  const monthlySavings = Math.max(0, (drafterCost - aadeshCostPerOrder) * ordersPerMonth);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    async function fetchCount() {
      try {
        const supabase = createSPAClient();
        const { count } = await supabase.from("orders").select("*", { count: "exact", head: true });
        setOrderCount(count ?? 0);
      } catch { setOrderCount(0); }
    }
    fetchCount();
  }, []);

  if (!mounted) return <div style={{ minHeight: "100vh", background: C.cream }} />;

  const l = locale === "kn";
  const offices = activeTab === "gov" ? GOV_OFFICES : PRO_OFFICES;

  return (
    <div style={{ background: C.cream, minHeight: "100vh", fontFamily: "'Inter', 'Noto Sans', sans-serif" }}>
      {/* ── NAV ────────────────────────────────────────────────────────────── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50, background: "rgba(255,247,240,0.9)",
        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        borderBottom: `0.5px solid ${C.borderWarm}`, padding: "12px 20px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 1280, margin: "0 auto" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
            background: `linear-gradient(135deg, ${C.saffron}, ${C.gold})`, color: "white", fontWeight: 700, fontSize: 16,
            fontFamily: "'Noto Sans Kannada', sans-serif",
          }}>ಆ</div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.navy, fontFamily: "'Noto Sans Kannada', sans-serif" }}>ಆದೇಶ AI</div>
            <div style={{ fontSize: 9, color: C.midGray, marginTop: -1 }}>Aadesh AI</div>
          </div>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <a href="#how" className="hidden md:inline" style={{ fontSize: 14, color: C.charcoal, textDecoration: "none", fontWeight: 500 }}>
            {l ? "ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ" : "How It Works"}
          </a>
          <a href="#pricing" className="hidden md:inline" style={{ fontSize: 14, color: C.charcoal, textDecoration: "none", fontWeight: 500 }}>
            {l ? "ಬೆಲೆ" : "Pricing"}
          </a>
          <button onClick={toggleLocale} style={{
            display: "flex", alignItems: "center", gap: 6, padding: "6px 16px",
            borderRadius: 20, border: `1.5px solid ${C.saffron}`, background: "none",
            fontSize: 14, cursor: "pointer", color: C.saffron, fontWeight: 600,
          }}>
            <Globe size={14} />
            {l ? "EN" : "ಕನ್ನಡ"}
          </button>
          <Link href="/auth/register" style={{
            background: `linear-gradient(135deg, ${C.saffron}, ${C.saffronDark})`, color: "white", padding: "8px 20px",
            borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none",
            boxShadow: "0 4px 14px rgba(233,123,59,0.3)",
          }}>
            <Bi en="Get Started Free" kn="ಉಚಿತವಾಗಿ ಪ್ರಾರಂಭಿಸಿ" locale={locale} />
          </Link>
        </div>
        </div>
      </nav>

      {/* ── SECTION 1: HERO ────────────────────────────────────────────────── */}
      <section style={{
        padding: "7rem 2rem 3rem", textAlign: "center", overflow: "hidden",
        background: `radial-gradient(ellipse 90% 70% at 20% 0%, rgba(249,168,37,0.22), transparent 60%),
                     radial-gradient(ellipse 90% 70% at 85% 15%, rgba(233,123,59,0.10), transparent 55%),
                     linear-gradient(180deg, ${C.cream} 0%, ${C.peach} 100%)`,
      }}>
        <div style={{ maxWidth: 1152, margin: "0 auto" }}>
        {/* Made in Bengaluru badge */}
        <Reveal>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 16px",
            borderRadius: 20, background: `linear-gradient(135deg, ${C.saffron}, ${C.gold})`,
            color: "white", fontSize: 12, fontWeight: 600, marginBottom: 24,
            boxShadow: "0 4px 14px rgba(233,123,59,0.25)",
          }}>
            <MapPin size={14} /> Made in Bengaluru
          </div>
        </Reveal>

        {/* Headline — large serif style */}
        <Reveal delay={100}>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl" style={{
            fontWeight: 700, color: C.brownDisplay, lineHeight: 1.02, marginBottom: 12,
            fontFamily: "'Noto Serif Kannada', 'Noto Serif', serif", letterSpacing: -1,
          }}>
            {locale === "kn" ? (
              <>
                <span style={{ display: "block" }}>ಯಾವುದೇ</span>
                {/* FIX: whiteSpace nowrap prevents word-length changes from reflowing layout */}
                <span style={{ display: "block", whiteSpace: "nowrap" }}>
                  <TypewriterWord key="kn" locale="kn" />
                </span>
                <span style={{ display: "block" }}>2 ನಿಮಿಷದಲ್ಲಿ ಬರೆಯಿರಿ.</span>
              </>
            ) : (
              <>
                <span style={{ display: "block" }}>Draft Any</span>
                {/* FIX: whiteSpace nowrap prevents word-length changes from reflowing layout */}
                <span style={{ display: "block", whiteSpace: "nowrap" }}>
                  <TypewriterWord key="en" locale="en" />
                </span>
                <span style={{ display: "block" }}>in 2 Minutes.</span>
              </>
            )}
          </h1>
          <p style={{ fontSize: 22, color: C.midGray, fontStyle: "italic", fontFamily: "'Noto Sans Kannada', sans-serif", marginTop: 12 }}>
            <Bi
              en="Your AI drafter. Learns your style. Works in 2 minutes."
              kn="ನಿಮ್ಮ AI ಬರಹಗಾರ. ನಿಮ್ಮ ಶೈಲಿ ಕಲಿತು 2 ನಿಮಿಷದಲ್ಲಿ ದಾಖಲೆ ತಯಾರಿಸುತ್ತದೆ."
              locale={locale === "kn" ? "en" : "kn"}
            />
          </p>
        </Reveal>

        {/* Subtext */}
        <Reveal delay={200}>
          <p style={{ fontSize: 18, color: "#4B5563", lineHeight: 1.6, maxWidth: 700, margin: "28px auto 0" }}>
            <Bi
              en="You pay Rs 1,000-2,000 per document to a human drafter. Upload your best documents once — AI learns your exact style. Draft perfectly for Rs 42-100 per order. No subscription."
              kn="ಮಾನವ ಡ್ರಾಫ್ಟರ್‌ಗೆ ಪ್ರತಿ ದಾಖಲೆಗೆ Rs 1,000-2,000 ಕೊಡುತ್ತೀರಿ. ನಿಮ್ಮ ಅತ್ಯುತ್ತಮ ದಾಖಲೆಗಳನ್ನು ಒಮ್ಮೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ — AI ನಿಮ್ಮ ಶೈಲಿ ಕಲಿಯುತ್ತದೆ. Rs 42-100 ಗೆ ಪರಿಪೂರ್ಣ ಕರಡು. ಚಂದಾ ಇಲ್ಲ."
              locale={locale}
            />
          </p>
        </Reveal>

        {/* Stats row */}
        <Reveal delay={300}>
          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 36, flexWrap: "wrap" }}>
            {[
              { val: "97%", en: "cheaper", kn: "ಅಗ್ಗ" },
              { val: "2 min", en: "per document", kn: "ಪ್ರತಿ ದಾಖಲೆ" },
              { val: "3", en: "free orders", kn: "ಉಚಿತ ಆದೇಶ" },
            ].map((s, i) => (
              <div key={i} style={{
                textAlign: "center", background: "white", borderRadius: 12,
                padding: "14px 24px", border: `0.5px solid ${C.borderWarm}`,
                boxShadow: "rgba(0,0,0,0.03) 0px 2px 8px",
              }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: C.saffron, letterSpacing: -0.5 }}>{s.val}</div>
                <div style={{ fontSize: 12, color: C.midGray, marginTop: 2 }}><Bi en={s.en} kn={s.kn} locale={locale} /></div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* CTA — single primary */}
        <Reveal delay={400}>
          <div style={{ marginTop: 36, display: "flex", justifyContent: "center" }}>
            <Link href="/auth/register" style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              background: `linear-gradient(135deg, ${C.saffron}, ${C.saffronDark})`,
              color: "white", padding: "18px 48px",
              borderRadius: 12, fontSize: 17, fontWeight: 700, textDecoration: "none",
              boxShadow: "0 6px 20px rgba(233,123,59,0.35)",
            }}>
              Try 3 free orders — ಉಚಿತವಾಗಿ ಪ್ರಯತ್ನಿಸಿ →
            </Link>
          </div>
        </Reveal>

        {/* Trust strip */}
        <Reveal delay={450}>
          <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 24, fontSize: 14, color: C.midGray }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <ShieldCheck size={15} color={C.saffron} /> <Bi en="Encrypted" kn="ಎನ್‌ಕ್ರಿಪ್ಟ್" locale={locale} />
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <Lock size={15} color={C.saffron} /> <Bi en="100% Private" kn="100% ಖಾಸಗಿ" locale={locale} />
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <Check size={15} color={C.saffron} /> <Bi en="India servers" kn="ಭಾರತ ಸರ್ವರ್" locale={locale} />
            </span>
          </div>
        </Reveal>

        {/* Live pill */}
        <Reveal delay={500}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6, marginTop: 16,
            padding: "4px 14px", borderRadius: 20, background: "white",
            border: `0.5px solid ${C.borderWarm}`, fontSize: 12, color: C.midGray,
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.successGreen, animation: "ddlrPulse 2s ease-in-out infinite" }} />
            {orderCount !== null && orderCount >= 50
              ? <Bi en={`${orderCount.toLocaleString("en-IN")} documents generated`} kn={`${orderCount.toLocaleString("en-IN")} ದಾಖಲೆಗಳು ರಚಿಸಲಾಗಿದೆ`} locale={locale} />
              : <Bi en="Used by officers and professionals across Karnataka" kn="ಕರ್ನಾಟಕದಾದ್ಯಂತ ಅಧಿಕಾರಿಗಳು ಮತ್ತು ವೃತ್ತಿಪರರು ಬಳಸುತ್ತಿದ್ದಾರೆ" locale={locale} />
            }
          </div>
        </Reveal>
        </div>

        {/* Floating MockDocument below hero */}
        <Reveal delay={600}>
          <div style={{ maxWidth: 560, margin: "48px auto 0", animation: "ddlrFloat 6s ease-in-out infinite" }}>
            <MockDocument />
          </div>
        </Reveal>
      </section>

      {/* ── SECTION 2: WHO IT IS FOR ───────────────────────────────────────── */}
      <section style={{ padding: "5rem 1.5rem", background: C.peach }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <Reveal>
            <div style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 3, color: C.saffron, marginBottom: 8, textAlign: "center" }}>
              <Bi en="Who is this for" kn="ಇದು ಯಾರಿಗಾಗಿ" locale={locale} />
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 600, color: C.charcoal, textAlign: "center", marginBottom: 4 }}>
              <Bi en="If you draft formal documents, this is for you." kn="ನೀವು ಔಪಚಾರಿಕ ದಾಖಲೆಗಳನ್ನು ಬರೆಯುತ್ತಿದ್ದರೆ — ಇದು ನಿಮಗಾಗಿ." locale={locale} />
            </h2>
            <p style={{ fontSize: 12, color: C.midGray, textAlign: "center", fontFamily: "'Noto Sans Kannada', sans-serif" }}>
              <Bi en="ನೀವು ಔಪಚಾರಿಕ ದಾಖಲೆಗಳನ್ನು ಬರೆಯುತ್ತಿದ್ದರೆ — ಇದು ನಿಮಗಾಗಿ." kn="If you draft formal documents, this is for you." locale={locale} />
            </p>
          </Reveal>

          {/* Universal box */}
          <Reveal delay={100}>
            <div style={{ background: C.cream, borderRadius: 12, padding: "20px 24px", margin: "24px 0", border: `1px solid rgba(0,0,0,0.06)` }}>
              <p style={{ fontSize: 13, color: C.charcoal, lineHeight: 1.7, marginBottom: 6 }}>
                <Bi
                  en="It does not matter which office you work in. Upload any formal documents you have finalized before. AI reads them, learns your exact style, and generates new documents mimicking exactly how you write."
                  kn="ನೀವು ಯಾವ ಕಛೇರಿಯಲ್ಲಿ ಕೆಲಸ ಮಾಡುತ್ತೀರಿ ಎಂಬುದು ಮುಖ್ಯವಲ್ಲ. ನಿಮ್ಮ ಹಳೆಯ ದಾಖಲೆಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ — AI ನಿಮ್ಮಂತೆಯೇ ಬರೆಯುತ್ತದೆ."
                  locale={locale}
                />
              </p>
              <p style={{ fontSize: 11, color: C.midGray, lineHeight: 1.6, fontStyle: "italic", fontFamily: "'Noto Sans Kannada', sans-serif" }}>
                <Bi
                  en="ನೀವು ಯಾವ ಕಛೇರಿಯಲ್ಲಿ ಕೆಲಸ ಮಾಡುತ್ತೀರಿ ಎಂಬುದು ಮುಖ್ಯವಲ್ಲ. ನಿಮ್ಮ ಹಳೆಯ ದಾಖಲೆಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ — AI ನಿಮ್ಮಂತೆಯೇ ಬರೆಯುತ್ತದೆ."
                  kn="It does not matter which office you work in. Upload any documents you have finalized. AI reads them, learns your exact style, and generates new documents mimicking how you write."
                  locale={locale}
                />
              </p>
            </div>
          </Reveal>

          {/* Tab toggle */}
          <Reveal delay={200}>
            <div style={{ display: "flex", gap: 0, borderRadius: 8, overflow: "hidden", border: `0.5px solid ${C.lightGray}`, marginBottom: 20 }}>
              {(["gov", "pro"] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  flex: 1, padding: "10px 0", fontSize: 13, fontWeight: 500, cursor: "pointer", border: "none",
                  background: activeTab === tab ? (tab === "gov" ? C.govBlueBg : C.proPurpleBg) : "white",
                  color: activeTab === tab ? (tab === "gov" ? C.govBlue : C.proPurple) : C.midGray,
                }}>
                  {tab === "gov"
                    ? <><Landmark size={14} style={{ display: "inline", verticalAlign: -2, marginRight: 6 }} /><Bi en="Government offices" kn="ಸರ್ಕಾರಿ ಕಛೇರಿಗಳು" locale={locale} /></>
                    : <><Scale size={14} style={{ display: "inline", verticalAlign: -2, marginRight: 6 }} /><Bi en="Private professionals" kn="ಖಾಸಗಿ ವೃತ್ತಿಪರರು" locale={locale} /></>
                  }
                </button>
              ))}
            </div>
          </Reveal>

          {/* Office grid — responsive */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
            {offices.map((o, i) => (
              <Reveal key={i} delay={i * 80}>
                <div style={{
                  background: "white", borderRadius: 16, padding: "20px 22px",
                  border: `1px solid ${o.accent ? C.saffron : "rgba(0,0,0,0.06)"}`,
                  transition: "box-shadow 300ms ease, transform 300ms ease",
                  ...(o.accent ? { background: C.saffronBadgeBg } : {}),
                }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: C.charcoal }}>{o.en}</div>
                  <div style={{ fontSize: 12, color: C.midGray, fontFamily: "'Noto Sans Kannada', sans-serif", marginTop: 3 }}>{o.kn}</div>
                  <div style={{ fontSize: 13, color: C.midGray, marginTop: 8, lineHeight: 1.5 }}>{o.docs}</div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Note */}
          <Reveal delay={500}>
            <p style={{ fontSize: 12, color: C.midGray, textAlign: "center", marginTop: 16, lineHeight: 1.6 }}>
              <Bi
                en="Your office not in this list? It does not matter. Upload your own documents — AI learns any style from any office."
                kn="ನಿಮ್ಮ ಕಛೇರಿ ಇಲ್ಲಿ ಇಲ್ಲವೇ? ಚಿಂತಿಸಬೇಡಿ. ನಿಮ್ಮ ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ — AI ಕಲಿಯುತ್ತದೆ."
                locale={locale}
              />
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── SECTION 3: DIFFERENT FROM CHATGPT ──────────────────────────────── */}
      <section style={{ padding: "5rem 1.5rem", background: C.cream }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <Reveal>
            <h2 style={{ fontSize: 28, fontWeight: 600, color: C.charcoal, textAlign: "center", marginBottom: 4 }}>
              <Bi en="Different from ChatGPT" kn="ChatGPT ಗಿಂತ ಭಿನ್ನ" locale={locale} />
            </h2>
            <p style={{ fontSize: 12, color: C.midGray, textAlign: "center", marginBottom: 20, fontFamily: "'Noto Sans Kannada', sans-serif" }}>
              <Bi en="ChatGPT ಗಿಂತ ಭಿನ್ನ" kn="Different from ChatGPT" locale={locale} />
            </p>
          </Reveal>
          <Reveal delay={100}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
              {/* ChatGPT column */}
              <div style={{ background: C.redBg, borderRadius: 16, padding: "24px 22px" }}>
                <div style={{ fontSize: 17, fontWeight: 600, color: C.redText, marginBottom: 16 }}>ChatGPT / generic AI</div>
                {["Writes in generic style", "Does not know your office format", "Gets Kannada structure wrong", "You rewrite it completely", "Same generic output every time"].map((p, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 10, fontSize: 14, color: C.redText, lineHeight: 1.5 }}>
                    <span style={{ fontSize: 16 }}>-</span><span>{p}</span>
                  </div>
                ))}
              </div>
              {/* Aadesh AI column */}
              <div style={{ background: C.greenBg, borderRadius: 16, padding: "24px 22px" }}>
                <div style={{ fontSize: 17, fontWeight: 600, color: C.greenText, marginBottom: 16 }}>Aadesh AI</div>
                {["Reads YOUR past documents", "Learns YOUR exact format and words", "Generates in your voice, your style", "Minimal editing needed", "Gets better the more you use it"].map((p, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 10, fontSize: 14, color: C.greenText, lineHeight: 1.5 }}>
                    <Check size={14} style={{ flexShrink: 0, marginTop: 1 }} /><span>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── SECTION 4: MULTI-OFFICE ANIMATION DEMO ─────────────────────────── */}
      <section style={{ padding: "5rem 1.5rem", background: C.peach }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <Reveal>
            <h2 style={{ fontSize: 28, fontWeight: 600, color: C.charcoal, textAlign: "center", marginBottom: 24 }}>
              <Bi en="Same AI. Any office. Any document." kn="ಒಂದೇ AI. ಯಾವ ಕಛೇರಿಯಾದರೂ. ಯಾವ ದಾಖಲೆಯಾದರೂ." locale={locale} />
            </h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <OfficePanel office="ಜಿ.ಭೂ.ದಾ.ಉ.ನಿ — ಬೆಂಗಳೂರು ದಕ್ಷಿಣ" orderType="ಫೋಡಿ ದುರಸ್ತಿ ಮೇಲ್ಮನವಿ" color={C.navy}
              lines={["ಸಂ: DDLR/BLR-S/2026/1847", "ಮೇಲ್ಮನವಿ ಪುರಸ್ಕರಿಸಲಾಗಿದ್ದು,", "ಸ.ನಂ.45/3 ಫೋಡಿ ದುರಸ್ತಿಗೆ ಆದೇಶ."]} stagger={0} />
            <OfficePanel office="ಸಹಾಯಕ ಆಯುಕ್ತರ ಕಛೇರಿ — ಬೆಂಗಳೂರು" orderType="ಕಲಂ 56 ಪುನರ್ ಪರಿಶೀಲನಾ ಆದೇಶ" color="#1B5E20"
              lines={["ಸಂ: AC/BLR-S/RP/2026/183", "ತಹಶೀಲ್ದಾರ್ ಆದೇಶ ರದ್ದುಗೊಳಿಸಿ,", "ಹೊಸ ಆದೇಶ ಹೊರಡಿಸಲಾಗಿದೆ."]} stagger={600} />
            <OfficePanel office="ಜಿಲ್ಲಾಧಿಕಾರಿ ಕಛೇರಿ — ಬೆಂಗಳೂರು ನಗರ" orderType="ಭೂ ಮೇಲ್ಮನವಿ ಆದೇಶ" color="#B71C1C"
              lines={["ಸಂ: DC/BLR-U/REV/2026/441", "ಮೇಲ್ಮನವಿ ಭಾಗಶಃ ಮಂಜೂರು.", "ಭೂ ಮರು ಸಮೀಕ್ಷೆಗೆ ಆದೇಶ."]} stagger={1200} />
            <OfficePanel office="DDLR — ಕ.ಉ.ನ್ಯಾಯಾಲಯ WP ಉತ್ತರ" orderType="ಪ್ಯಾರಾ ಲೀಗಲ್ ರಿಮಾರ್ಕ್ಸ್" color="#E65100"
              lines={["WP ಸಂ: 12847/2026", "ಸರ್ಕಾರದ ನಿಲುವು ಸ್ಪಷ್ಟ.", "WP ವಜಾ ಮಾಡಿಕೊಳ್ಳಲು ಪ್ರಾರ್ಥನೆ."]} stagger={1800} />
          </div>
          <Reveal delay={200}>
            <p style={{ fontSize: 13, color: C.midGray, textAlign: "center", marginTop: 20, fontFamily: "'Noto Sans Kannada', sans-serif" }}>
              <Bi en="Upload yours — it learns your style." kn="ನಿಮ್ಮದನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ — ನಿಮ್ಮ ಶೈಲಿ ಕಲಿಯುತ್ತದೆ." locale={locale} />
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── SECTION 5: HOW IT WORKS (3-column card grid like live site) ─────── */}
      <section id="how" style={{ padding: "5rem 1.5rem", background: C.cream, scrollMarginTop: 80 }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 3, color: C.saffron, marginBottom: 8 }}>
                <Bi en="3 Simple Steps" kn="3 ಸರಳ ಹಂತಗಳು" locale={locale} />
              </div>
              <h2 style={{ fontSize: 32, fontWeight: 700, color: C.brownDisplay, fontFamily: "'Noto Serif Kannada', serif" }}>
                <Bi en="How It Works" kn="ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ" locale={locale} />
              </h2>
              <p style={{ fontSize: 13, color: C.midGray, marginTop: 4, fontFamily: "'Noto Sans Kannada', sans-serif" }}>
                <Bi en="ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ" kn="How It Works" locale={locale} />
              </p>
            </div>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {[
              { Icon: Upload, title: { en: "Upload", kn: "ಅಪ್\u200Cಲೋಡ್ ಮಾಡಿ" },
                body: { en: "Upload as few as 5 of your best finalized documents. PDF, DOCX, or TXT. AI reads them and learns your exact style. One-time setup.", kn: "ನಿಮ್ಮ ಅಂತಿಮ 5 ದಾಖಲೆಗಳನ್ನು ಅಪ್\u200Cಲೋಡ್ ಮಾಡಿ. AI ನಿಮ್ಮ ಶೈಲಿ ಕಲಿಯುತ್ತದೆ." },
                note: { en: "More documents = sounds more like you", kn: "ಹೆಚ್ಚು ದಾಖಲೆ = ನಿಮ್ಮಂತೆಯೇ" } },
              { Icon: BrainCircuit, title: { en: "AI Reads & Asks", kn: "AI ಓದಿ ಪ್ರಶ್ನೆ ಕೇಳುತ್ತದೆ" },
                body: { en: "Upload the new case PDF. AI reads it, extracts all key facts, and asks you 3-5 short clarifying questions. You answer — AI drafts in your style.", kn: "ಹೊಸ PDF ಅಪ್\u200Cಲೋಡ್ ಮಾಡಿ. AI ಓದಿ 3-5 ಪ್ರಶ್ನೆ ಕೇಳುತ್ತದೆ. ನಿಮ್ಮ ಶೈಲಿಯಲ್ಲಿ ಕರಡು ತಯಾರಿಸುತ್ತದೆ." } },
              { Icon: FileCheck2, title: { en: "Review & Download", kn: "ಪರಿಶೀಲಿಸಿ ಡೌನ್\u200Cಲೋಡ್" },
                body: { en: "AI generates the complete document. You verify every fact. Download the .docx — ready to print and sign. Your document, your signature.", kn: "AI ಸಂಪೂರ್ಣ ದಾಖಲೆ ರಚಿಸುತ್ತದೆ. ಪರಿಶೀಲಿಸಿ .docx ಡೌನ್\u200Cಲೋಡ್ — ಮುದ್ರಿಸಿ ಸಹಿ ಮಾಡಿ." } },
            ].map((step, i) => (
              <Reveal key={i} delay={i * 120}>
                <div style={{
                  position: "relative", background: "white", borderRadius: 16, padding: "32px 24px",
                  border: `1px solid ${C.borderWarm}`, boxShadow: "rgba(0,0,0,0.04) 0px 4px 18px",
                  transition: "box-shadow 300ms ease, transform 300ms ease",
                }}>
                  {/* Gradient number badge */}
                  <div style={{
                    position: "absolute", top: -16, left: 24, width: 36, height: 36, borderRadius: "50%",
                    background: `linear-gradient(135deg, ${C.saffron}, ${C.gold})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "white", fontSize: 15, fontWeight: 700, boxShadow: "0 4px 10px rgba(233,123,59,0.3)",
                  }}>{i + 1}</div>
                  {/* Icon box */}
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
                    background: "rgba(26,35,126,0.07)", marginBottom: 16, marginTop: 8,
                  }}>
                    <step.Icon size={24} color={C.navy} />
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 4 }}>
                    <Bi en={step.title.en} kn={step.title.kn} locale={locale} />
                  </h3>
                  <p style={{ fontSize: 12, color: C.midGray, fontWeight: 500, marginBottom: 10, fontFamily: "'Noto Sans Kannada', sans-serif" }}>
                    <Bi en={step.title.kn} kn={step.title.en} locale={locale} />
                  </p>
                  <p style={{ fontSize: 14, color: "#4B5563", lineHeight: 1.6 }}>
                    <Bi en={step.body.en} kn={step.body.kn} locale={locale} />
                  </p>
                  {step.note && (
                    <p style={{ fontSize: 12, color: C.successGreen, marginTop: 8, fontWeight: 500 }}>
                      <Bi en={step.note.en} kn={step.note.kn} locale={locale} />
                    </p>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 6: FAQ ─────────────────────────────────────────────────── */}
      <section style={{ padding: "5rem 1.5rem", background: C.peach }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Reveal>
            <h2 style={{ fontSize: 28, fontWeight: 600, color: C.charcoal, textAlign: "center", marginBottom: 4 }}>
              <Bi en="Common questions" kn="ಸಾಮಾನ್ಯ ಪ್ರಶ್ನೆಗಳು" locale={locale} />
            </h2>
            <p style={{ fontSize: 12, color: C.midGray, textAlign: "center", marginBottom: 24, fontFamily: "'Noto Sans Kannada', sans-serif" }}>
              <Bi en="ಸಾಮಾನ್ಯ ಪ್ರಶ್ನೆಗಳು" kn="Common questions" locale={locale} />
            </p>
          </Reveal>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Reveal delay={0}><FAQItem locale={locale}
              q="Is using AI for official documents allowed?" qKn="ಸರ್ಕಾರಿ ದಾಖಲೆಗಳಿಗೆ AI ಬಳಸುವುದು ಅನುಮತಿ ಇದೆಯೇ?"
              a="AI drafts the document. You read it, verify every fact, edit if needed, and sign it. The final order is entirely yours — authored, verified, and signed by you. AI is your drafting assistant, not the decision-maker. Same as using a human drafter, except faster and cheaper."
              aKn="AI ದಾಖಲೆಯನ್ನು ಕರಡು ಮಾಡುತ್ತದೆ. ನೀವು ಓದಿ, ಪ್ರತಿ ಅಂಶ ಪರಿಶೀಲಿಸಿ, ಅಗತ್ಯವಿದ್ದಲ್ಲಿ ತಿದ್ದಿ, ಸಹಿ ಮಾಡುತ್ತೀರಿ. ಅಂತಿಮ ಆದೇಶ ಸಂಪೂರ್ಣವಾಗಿ ನಿಮ್ಮದು. AI ನಿಮ್ಮ ಡ್ರಾಫ್ಟಿಂಗ್ ಸಹಾಯಕ, ನಿರ್ಧಾರ ತೆಗೆದುಕೊಳ್ಳುವವರಲ್ಲ."
            /></Reveal>
            <Reveal delay={80}><FAQItem locale={locale}
              q="Is my case data safe and private?" qKn="ನನ್ನ ಪ್ರಕರಣದ ಮಾಹಿತಿ ಸುರಕ್ಷಿತವೇ?"
              a="Your documents are stored privately under your account only. No other user can see your files, training data, or generated orders. Your data is never shared with other users or used to train a public model. Delete everything at any time."
              aKn="ನಿಮ್ಮ ದಾಖಲೆಗಳು ನಿಮ್ಮ ಖಾತೆಯಲ್ಲಿ ಮಾತ್ರ ಖಾಸಗಿಯಾಗಿ ಸಂಗ್ರಹವಾಗುತ್ತವೆ. ಬೇರೆ ಯಾವ ಬಳಕೆದಾರರೂ ನಿಮ್ಮ ಫೈಲ್\u200Cಗಳನ್ನು ನೋಡಲು ಸಾಧ್ಯವಿಲ್ಲ. ನಿಮ್ಮ ಡೇಟಾ ಯಾವಾಗಲೂ ಅಳಿಸಬಹುದು."
            /></Reveal>
            <Reveal delay={160}><FAQItem locale={locale}
              q="What if the AI makes a mistake?" qKn="AI ತಪ್ಪು ಮಾಡಿದರೆ ಏನಾಗುತ್ತದೆ?"
              a="You always review and verify before downloading. The app highlights every extracted fact — survey numbers, names, dates — so you can catch any error. You are in full control. The AI is your first draft, not the final word."
              aKn="ಡೌನ್\u200Cಲೋಡ್ ಮಾಡುವ ಮೊದಲು ನೀವು ಯಾವಾಗಲೂ ಪರಿಶೀಲಿಸುತ್ತೀರಿ. ಸರ್ವೆ ಸಂಖ್ಯೆ, ಹೆಸರು, ದಿನಾಂಕ — ಪ್ರತಿ ಅಂಶ ತೋರಿಸಲಾಗುತ್ತದೆ. ನೀವು ಸಂಪೂರ್ಣ ನಿಯಂತ್ರಣದಲ್ಲಿದ್ದೀರಿ."
            /></Reveal>
            <Reveal delay={240}><FAQItem locale={locale}
              q="Do I need IT approval or department permission?" qKn="IT ಅನುಮತಿ ಅಥವಾ ಇಲಾಖೆ ಒಪ್ಪಿಗೆ ಬೇಕೇ?"
              a="No. This is a personal productivity tool — like using Google Docs or a calculator. Pay from your own pocket, just like you currently pay a human drafter. No procurement process, no DC approval, no tender required."
              aKn="ಇಲ್ಲ. ಇದು Google Docs ಅಥವಾ ಕ್ಯಾಲ್ಕುಲೇಟರ್ ಬಳಸುವಂತಹ ವೈಯಕ್ತಿಕ ಉತ್ಪಾದಕತೆ ಸಾಧನ. ನಿಮ್ಮ ಜೇಬಿನಿಂದ ಪಾವತಿಸಿ. ಯಾವುದೇ ಟೆಂಡರ್, DC ಅನುಮೋದನೆ ಅಗತ್ಯವಿಲ್ಲ."
            /></Reveal>
          </div>
        </div>
      </section>

      {/* ── SECTION 7: PRICING (full cards with features like live site) ────── */}
      <section id="pricing" style={{ padding: "5rem 1.5rem", background: C.cream, scrollMarginTop: 80 }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 3, color: C.saffron, marginBottom: 8 }}>
                <Bi en="Pricing" kn="ಬೆಲೆ" locale={locale} />
              </div>
              <h2 style={{ fontSize: 32, fontWeight: 700, color: C.brownDisplay, fontFamily: "'Noto Serif Kannada', serif" }}>
                <Bi en="Pay Only For What You Need" kn="ಬೇಕಾದಷ್ಟು ಮಾತ್ರ ಪಾವತಿಸಿ" locale={locale} />
              </h2>
              <p style={{ fontSize: 13, color: C.midGray, marginTop: 4, fontFamily: "'Noto Sans Kannada', sans-serif" }}>
                <Bi en="ಬೇಕಾದಷ್ಟು ಮಾತ್ರ ಪಾವತಿಸಿ" kn="Pay Only For What You Need" locale={locale} />
              </p>
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, maxWidth: 900, margin: "0 auto" }}>
            {[
              { name: { en: "Try Free", kn: "ಉಚಿತ" }, orders: 3, price: 0, perOrder: 0, featured: false },
              { name: { en: "Pack A", kn: "ಪ್ಯಾಕ್ A" }, orders: 7, price: 999, perOrder: 142, featured: false },
              { name: { en: "Pack B", kn: "ಪ್ಯಾಕ್ B" }, orders: 18, price: 1999, perOrder: 111, featured: true },
              { name: { en: "Pack C", kn: "ಪ್ಯಾಕ್ C" }, orders: 32, price: 3499, perOrder: 109, featured: false },
              { name: { en: "Pack D", kn: "ಪ್ಯಾಕ್ D" }, orders: 55, price: 5999, perOrder: 109, featured: false },
            ].map((pack, i) => (
              <Reveal key={i} delay={i * 100}>
                <div style={{
                  position: "relative", background: "white", borderRadius: 16, padding: "32px 24px",
                  border: pack.featured ? `3px solid ${C.saffron}` : `1px solid ${C.borderWarm}`,
                  boxShadow: pack.featured ? "0 8px 30px rgba(233,123,59,0.15)" : "rgba(0,0,0,0.04) 0px 4px 18px",
                  transform: pack.featured ? "scale(1.03)" : "none",
                }}>
                  {pack.featured && (
                    <div style={{
                      position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                      background: `linear-gradient(135deg, ${C.saffron}, ${C.gold})`, color: "white",
                      fontSize: 11, fontWeight: 700, padding: "3px 14px", borderRadius: 20,
                    }}>
                      <Bi en="MOST POPULAR" kn="ಅತ್ಯಂತ ಜನಪ್ರಿಯ" locale={locale} />
                    </div>
                  )}
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: C.navy }}>
                    <Bi en={pack.name.en} kn={pack.name.kn} locale={locale} />
                  </h3>
                  <div style={{ fontSize: 11, color: C.midGray, fontWeight: 500 }}>
                    <Bi en={pack.name.kn} kn={pack.name.en} locale={locale} />
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <span style={{ fontSize: 40, fontWeight: 800, color: C.saffron }}>
                      {pack.price === 0 ? <Bi en="FREE" kn="ಉಚಿತ" locale={locale} /> : <>&#8377;{pack.price.toLocaleString("en-IN")}</>}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: C.midGray, marginTop: 4 }}>
                    {pack.orders} <Bi en="orders" kn="ಆದೇಶಗಳು" locale={locale} />
                    {pack.perOrder > 0 && <> · &#8377;{pack.perOrder}/<Bi en="order" kn="ಆದೇಶ" locale={locale} /></>}
                  </div>
                  {/* Feature list */}
                  <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      l ? "ಸರಕಾರಿ ಕನ್ನಡ" : "Sarakari Kannada",
                      l ? "DOCX + PDF ಡೌನ್\u200Cಲೋಡ್" : "DOCX + PDF download",
                      l ? "AI ಶೈಲಿ ಕಲಿಕೆ" : "AI style learning",
                      l ? "ಉಚಿತ ನವೀಕರಣಗಳು" : "Free updates",
                    ].map((f, j) => (
                      <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                        <Check size={16} color={C.saffron} style={{ flexShrink: 0 }} />
                        <span style={{ color: "#4B5563" }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/auth/register" style={{
                    display: "block", textAlign: "center", marginTop: 24, padding: "12px 0", borderRadius: 8,
                    fontWeight: 700, fontSize: 14, textDecoration: "none",
                    background: pack.featured ? C.saffron : "transparent",
                    color: pack.featured ? "white" : C.saffron,
                    border: `2px solid ${C.saffron}`,
                  }}>
                    <Bi en="Choose" kn="ಆಯ್ಕೆಮಾಡಿ" locale={locale} />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={400}>
            <p style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: C.midGray, fontFamily: "'Noto Sans Kannada', sans-serif" }}>
              UPI ಮೂಲಕ ಪಾವತಿ · ಕ್ರೆಡಿಟ್‌ಗಳು ಮುಕ್ತಾಯವಾಗದು &nbsp;/&nbsp; Pay via UPI · No lock-in · Credits never expire
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── SECTION 7b: SAVINGS CALCULATOR ───────────────────────────────── */}
      <section style={{ padding: "5rem 1.5rem", background: C.cream }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <Reveal>
            <div style={{
              background: `linear-gradient(135deg, ${C.navy}, ${C.navyDark})`,
              borderRadius: 24, padding: "48px 40px",
              boxShadow: "0 20px 60px rgba(26,35,126,0.25)",
            }}>
              <div style={{ textAlign: "center", marginBottom: 36 }}>
                <div style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 3, color: C.gold, marginBottom: 8 }}>
                  <Bi en="Savings Calculator" kn="ಉಳಿತಾಯ ಲೆಕ್ಕಾಚಾರ" locale={locale} />
                </div>
                <h2 style={{ fontSize: 28, fontWeight: 700, color: "white", fontFamily: "'Noto Serif Kannada', serif" }}>
                  <Bi en="How Much Will You Save?" kn="ನೀವು ಎಷ್ಟು ಉಳಿಸುತ್ತೀರಿ?" locale={locale} />
                </h2>
              </div>

              {/* Sliders */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32, marginBottom: 40 }}>
                {/* Drafter cost slider */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <label style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>
                      <Bi en="Drafter fee per document" kn="ಪ್ರತಿ ದಾಖಲೆಗೆ ಡ್ರಾಫ್ಟರ್ ಶುಲ್ಕ" locale={locale} />
                    </label>
                    <span style={{ fontSize: 16, fontWeight: 700, color: C.gold }}>₹{drafterCost.toLocaleString("en-IN")}</span>
                  </div>
                  <input
                    type="range" min={500} max={2500} step={50} value={drafterCost}
                    onChange={(e) => setDrafterCost(Number(e.target.value))}
                    style={{ width: "100%", accentColor: C.gold, cursor: "pointer" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                    <span>₹500</span><span>₹2,500</span>
                  </div>
                </div>

                {/* Orders per month slider */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <label style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>
                      <Bi en="Orders per month" kn="ತಿಂಗಳಿಗೆ ಆದೇಶಗಳು" locale={locale} />
                    </label>
                    <span style={{ fontSize: 16, fontWeight: 700, color: C.gold }}>{ordersPerMonth}</span>
                  </div>
                  <input
                    type="range" min={5} max={100} step={5} value={ordersPerMonth}
                    onChange={(e) => setOrdersPerMonth(Number(e.target.value))}
                    style={{ width: "100%", accentColor: C.gold, cursor: "pointer" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                    <span>5</span><span>100</span>
                  </div>
                </div>
              </div>

              {/* Result */}
              <div style={{ textAlign: "center", padding: "28px 0", borderTop: "1px solid rgba(255,255,255,0.12)", borderBottom: "1px solid rgba(255,255,255,0.12)", marginBottom: 28 }}>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>
                  <Bi en="Your estimated monthly savings" kn="ನಿಮ್ಮ ಅಂದಾಜು ಮಾಸಿಕ ಉಳಿತಾಯ" locale={locale} />
                </div>
                <div style={{ fontSize: 64, fontWeight: 800, color: C.gold, lineHeight: 1, letterSpacing: -2 }}>
                  ₹{monthlySavings.toLocaleString("en-IN")}
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 8 }}>
                  <Bi
                    en={`You pay ₹${drafterCost.toLocaleString("en-IN")} × ${ordersPerMonth} = ₹${(drafterCost * ordersPerMonth).toLocaleString("en-IN")} now. With Aadesh AI: ₹${(aadeshCostPerOrder * ordersPerMonth).toLocaleString("en-IN")}.`}
                    kn={`ಈಗ ₹${drafterCost.toLocaleString("en-IN")} × ${ordersPerMonth} = ₹${(drafterCost * ordersPerMonth).toLocaleString("en-IN")}. ಆದೇಶ AI ಜೊತೆ: ₹${(aadeshCostPerOrder * ordersPerMonth).toLocaleString("en-IN")}.`}
                    locale={locale}
                  />
                </div>
              </div>

              <div style={{ textAlign: "center" }}>
                <Link href="/auth/register" style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: `linear-gradient(135deg, ${C.saffron}, ${C.gold})`,
                  color: "white", padding: "14px 36px",
                  borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: "none",
                  boxShadow: "0 4px 18px rgba(233,123,59,0.4)",
                }}>
                  <Bi en="Start Saving — 3 Free Orders" kn="ಉಳಿಸಲು ಪ್ರಾರಂಭಿಸಿ — 3 ಉಚಿತ ಆದೇಶ" locale={locale} />
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── SECTION 8: FINAL CTA ───────────────────────────────────────────── */}
      <section style={{ padding: "5rem 1.5rem", background: C.peach }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <Reveal>
            <div style={{ background: C.saffronBadgeBg, borderRadius: 20, padding: "52px 40px", border: `1px solid rgba(0,0,0,0.04)` }}>
              <Sparkles size={32} color={C.saffron} style={{ margin: "0 auto 16px" }} />
              <h2 style={{ fontSize: 28, fontWeight: 700, color: C.brownDisplay, fontFamily: "'Noto Serif Kannada', serif" }}>
                <Bi en="Start with 3 free orders" kn="3 ಉಚಿತ ಆದೇಶಗಳೊಂದಿಗೆ ಪ್ರಾರಂಭಿಸಿ" locale={locale} />
              </h2>
              <p style={{ fontSize: 15, color: C.midGray, lineHeight: 1.7, maxWidth: 480, margin: "12px auto 28px" }}>
                <Bi
                  en="Sign in with Google. Upload your documents. Start drafting in 30 minutes. Private, secure — your data is yours alone."
                  kn="Google ಮೂಲಕ ಸೈನ್ ಇನ್ ಮಾಡಿ. ನಿಮ್ಮ ದಾಖಲೆಗಳನ್ನು ಅಪ್\u200Cಲೋಡ್ ಮಾಡಿ. 30 ನಿಮಿಷದಲ್ಲಿ ಕರಡು ಪ್ರಾರಂಭಿಸಿ."
                  locale={locale}
                />
              </p>
              <Link href="/auth/register" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: `linear-gradient(135deg, ${C.saffron}, ${C.saffronDark})`,
                color: "white", padding: "16px 40px",
                borderRadius: 12, fontSize: 16, fontWeight: 700, textDecoration: "none",
                boxShadow: "0 4px 18px rgba(233,123,59,0.35)",
              }}>
                <Bi en="Get 3 Free Orders" kn="3 ಉಚಿತ ಆದೇಶ ಪಡೆಯಿರಿ" locale={locale} />
                <ArrowRight size={20} />
              </Link>
              <div style={{ marginTop: 10, fontSize: 12, color: C.midGray }}>
                <Bi en="No credit card required" kn="ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಅಗತ್ಯವಿಲ್ಲ" locale={locale} />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── SECTION 9: NAVY GRADIENT FOOTER (like live site) ───────────────── */}
      <footer style={{
        padding: "60px 24px 40px", color: "white",
        background: `linear-gradient(180deg, ${C.navy}, ${C.navyDark})`,
      }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 40 }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                background: `linear-gradient(135deg, ${C.saffron}, ${C.gold})`, color: "white", fontWeight: 700, fontSize: 16,
                fontFamily: "'Noto Sans Kannada', sans-serif",
              }}>ಆ</div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>ಆದೇಶ AI</div>
                <div style={{ fontSize: 10, opacity: 0.7, marginTop: -2 }}>Aadesh AI</div>
              </div>
            </div>
            <p style={{ fontSize: 13, opacity: 0.8, lineHeight: 1.6 }}>
              <Bi en="AI document drafting for government officers and professionals." kn="ಸರ್ಕಾರಿ ಅಧಿಕಾರಿಗಳು ಮತ್ತು ವೃತ್ತಿಪರರಿಗೆ AI ದಾಖಲೆ ಕರಡು." locale={locale} />
            </p>
          </div>
          {/* Product links */}
          <div>
            <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: C.gold, marginBottom: 16 }}>
              <Bi en="Product" kn="ಉತ್ಪನ್ನ" locale={locale} />
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, opacity: 0.9 }}>
              <a href="#how" style={{ color: "white", textDecoration: "none" }}><Bi en="How It Works" kn="ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ" locale={locale} /></a>
              <a href="#pricing" style={{ color: "white", textDecoration: "none" }}><Bi en="Pricing" kn="ಬೆಲೆ" locale={locale} /></a>
              <Link href="/auth/register" style={{ color: "white", textDecoration: "none" }}><Bi en="Get Started" kn="ಪ್ರಾರಂಭಿಸಿ" locale={locale} /></Link>
            </div>
          </div>
          {/* Legal */}
          <div>
            <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: C.gold, marginBottom: 16 }}>
              <Bi en="Legal" kn="ಕಾನೂನು" locale={locale} />
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, opacity: 0.9 }}>
              <Link href="/legal/privacy-policy" style={{ color: "white", textDecoration: "none" }}><Bi en="Privacy Policy" kn="ಗೌಪ್ಯತಾ ನೀತಿ" locale={locale} /></Link>
              <Link href="/legal/terms-of-service" style={{ color: "white", textDecoration: "none" }}><Bi en="Terms" kn="ನಿಯಮಗಳು" locale={locale} /></Link>
            </div>
          </div>
          {/* Contact */}
          <div>
            <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: C.gold, marginBottom: 16 }}>
              <Bi en="Contact" kn="ಸಂಪರ್ಕ" locale={locale} />
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, opacity: 0.9 }}>
              <span>support@aadesh-ai.in</span>
              <span><Bi en="Bengaluru, Karnataka" kn="ಬೆಂಗಳೂರು, ಕರ್ನಾಟಕ" locale={locale} /></span>
            </div>
          </div>
        </div>
        {/* Bottom bar */}
        <div style={{ maxWidth: 1000, margin: "32px auto 0", paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.15)", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <p style={{ fontSize: 12, opacity: 0.8 }}>&copy; 2026 ಆದೇಶ AI · <Bi en="All rights reserved" kn="ಎಲ್ಲಾ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ" locale={locale} /></p>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 16px", borderRadius: 20, fontSize: 12, fontWeight: 600,
            background: `linear-gradient(135deg, ${C.saffron}, ${C.gold})`, color: "white",
          }}>
            Made in Karnataka
          </div>
        </div>
      </footer>
    </div>
  );
}
