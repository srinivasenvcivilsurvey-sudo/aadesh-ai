"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Upload,
  BrainCircuit,
  FileCheck2,
  PlayCircle,
  Lock,
  MapPin,
  Sparkles,
  Globe,
  Quote,
  Check,
  ShieldCheck,
  Landmark,
  Scale,
  FileText,
} from "lucide-react";
import { useLanguage } from "@/lib/context/LanguageContext";

// ─────────────────────────────────────────────────────────────────────────────
// Design tokens — warm cream base with saffron/navy/gold Karnataka accents,
// brown display headline (base44-inspired), dual role color coding.
// ─────────────────────────────────────────────────────────────────────────────
const COLORS = {
  // Primary brand
  saffron: "#E65100",
  saffronDark: "#BF360C",
  navy: "#1A237E",
  navyDark: "#0D1559",
  gold: "#F9A825",
  // Warm cream/peach palette
  cream: "#FFF7F0",
  peach: "#FDF1E8",
  rose: "#FBEAE0",
  // Text
  brownDisplay: "#3F1A08", // display headline
  charcoal: "#1F2937",
  // Role accents
  govBlue: "#1E3A8A",
  govBlueBg: "#DBEAFE",
  proPurple: "#5B21B6",
  proPurpleBg: "#EDE9FE",
};

// ─────────────────────────────────────────────────────────────────────────────
// Dummy data
// ─────────────────────────────────────────────────────────────────────────────
type Bilingual = { kn: string; en: string };

const HOW_STEPS: { icon: React.ElementType; title: Bilingual; desc: Bilingual }[] = [
  {
    icon: Upload,
    title: { kn: "ಅಪ್‌ಲೋಡ್ ಮಾಡಿ", en: "Upload" },
    desc: {
      kn: "ನಿಮ್ಮ ಹಿಂದಿನ 20 ಉತ್ತಮ ಆದೇಶಗಳನ್ನು PDF ಆಗಿ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",
      en: "Upload 20+ of your best finalized orders as PDFs.",
    },
  },
  {
    icon: BrainCircuit,
    title: { kn: "ತರಬೇತಿ ನೀಡಿ", en: "Train" },
    desc: {
      kn: "AI ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಕನ್ನಡ ಶೈಲಿಯನ್ನು ಕಲಿಯುತ್ತದೆ.",
      en: "AI learns your personal Sarakari Kannada style.",
    },
  },
  {
    icon: FileCheck2,
    title: { kn: "ರಚಿಸಿ", en: "Generate" },
    desc: {
      kn: "ಹೊಸ ಪ್ರಕರಣಕ್ಕೆ 2 ನಿಮಿಷಗಳಲ್ಲಿ ಆದೇಶ ಪಡೆಯಿರಿ.",
      en: "Get a new draft order in under 2 minutes.",
    },
  },
];

const ROLES: {
  key: "gov" | "pro";
  icon: React.ElementType;
  emoji: string;
  titleKn: string;
  titleEn: string;
  rolesKn: string;
  rolesEn: string;
  sampleDocsKn: string;
  sampleDocsEn: string;
  accent: string;
  accentBg: string;
}[] = [
  {
    key: "gov",
    icon: Landmark,
    emoji: "🏛️",
    titleKn: "ಸರ್ಕಾರಿ ಅಧಿಕಾರಿ",
    titleEn: "Government Officer",
    rolesKn: "DDLR · ಸಹಾಯಕ ಆಯುಕ್ತ · ತಹಶೀಲ್ದಾರ್ · DC · BBMP · BDA",
    rolesEn: "DDLR · AC · Tahsildar · DC · BBMP · BDA",
    sampleDocsKn: "ಆದೇಶಗಳು, ಪಂಚನಾಮೆಗಳು, ಪತ್ರಗಳು, ಪ್ರಮಾಣಪತ್ರಗಳು",
    sampleDocsEn: "Orders, Panchanamas, Notices, Certificates",
    accent: COLORS.govBlue,
    accentBg: COLORS.govBlueBg,
  },
  {
    key: "pro",
    icon: Scale,
    emoji: "⚖️",
    titleKn: "ಖಾಸಗಿ ವೃತ್ತಿಪರರು",
    titleEn: "Private Professional",
    rolesKn: "ವಕೀಲ · CA · ನೋಟರಿ · ಸಲಹೆಗಾರ",
    rolesEn: "Advocate · CA · Notary · Consultant",
    sampleDocsKn: "ಒಪ್ಪಂದಗಳು, ಅಫಿಡವಿಟ್‌ಗಳು, ಅರ್ಜಿಗಳು, ಅಭಿಪ್ರಾಯಗಳು",
    sampleDocsEn: "Agreements, Affidavits, Petitions, Legal Opinions",
    accent: COLORS.proPurple,
    accentBg: COLORS.proPurpleBg,
  },
];

const DEMO_CASES: {
  titleKn: string;
  titleEn: string;
  tagline: Bilingual;
  preview: string;
}[] = [
  {
    titleKn: "ಫೋಡಿ ದುರಸ್ತಿ",
    titleEn: "Phodi Durasti",
    tagline: { kn: "ಹಿಸ್ಸಾ ಪೋಡಿ ಸರಿಪಡಿಸುವಿಕೆ", en: "Sub-division correction" },
    preview:
      "ಮೇಲ್ಮನವಿದಾರರಾದ ಶ್ರೀ ಕೆ.ಎಸ್. ರುದ್ರೇಶ್ ರವರು ಕರ್ನಾಟಕ ಭೂಕಂದಾಯ ಅಧಿನಿಯಮ 1964 ರ ಕಲಂ 49(ಎ) ರ ಅಡಿಯಲ್ಲಿ ಸಲ್ಲಿಸಿರುವ ಮೇಲ್ಮನವಿಯನ್ನು ಪುರಸ್ಕರಿಸಲಾಗಿದೆ...",
  },
  {
    titleKn: "ಸ್ವಯಂ ಪ್ರೇರಿತ ಪುನರ್ ಪರಿಶೀಲನೆ",
    titleEn: "Suo Motu Review",
    tagline: { kn: "ಕಲಂ 49(2) ಅಡಿ", en: "Under Section 49(2)" },
    preview:
      "ಕರ್ನಾಟಕ ಭೂಕಂದಾಯ ಅಧಿನಿಯಮ 1964 ರ ಕಲಂ 49(2) ರಡಿ ದತ್ತವಾಗಿರುವ ಅಧಿಕಾರವನ್ನು ಉಪಯೋಗಿಸಿ, ಸ್ವಯಂ ಪ್ರೇರಿತ ಪುನರ್ ಪರಿಶೀಲನೆಯನ್ನು ಕೈಗೊಳ್ಳಲಾಗಿದೆ...",
  },
  {
    titleKn: "RTC ತಿದ್ದುಪಡಿ",
    titleEn: "RTC Correction",
    tagline: { kn: "ಪಹಣಿ ದಾಖಲೆ ತಿದ್ದುಪಡಿ", en: "Pahani record correction" },
    preview:
      "ಸ.ನಂ.163/1 ರ ಪಹಣಿ ದಾಖಲೆಯಲ್ಲಿನ ವಿಸ್ತೀರ್ಣ ವ್ಯತ್ಯಾಸವನ್ನು ಸರಿಪಡಿಸಲು, ಭೂದಾಖಲೆಗಳ ಸಹಾಯಕ ನಿರ್ದೇಶಕರಿಗೆ ಈ ಕೆಳಕಂಡಂತೆ ಆದೇಶಿಸಿದೆ...",
  },
];

const PRICING_PACKS: {
  nameKn: string;
  nameEn: string;
  orders: number;
  price: number;
  perOrder: number;
  featured?: boolean;
}[] = [
  { nameKn: "ಸ್ಟಾರ್ಟರ್", nameEn: "Starter", orders: 10, price: 420, perOrder: 42 },
  { nameKn: "ಸ್ಟ್ಯಾಂಡರ್ಡ್", nameEn: "Standard", orders: 50, price: 1750, perOrder: 35, featured: true },
  { nameKn: "ಪ್ರೊ", nameEn: "Pro", orders: 100, price: 3500, perOrder: 35 },
];

const TESTIMONIALS: {
  quoteKn: string;
  quoteEn: string;
  name: string;
  role: Bilingual;
  district: Bilingual;
}[] = [
  {
    quoteKn:
      "ಮೊದಲು ಒಂದು ಆದೇಶಕ್ಕೆ 3 ದಿನ ಬೇಕಾಗುತ್ತಿತ್ತು. ಈಗ 10 ನಿಮಿಷದಲ್ಲಿ ಮುಗಿಯುತ್ತದೆ.",
    quoteEn:
      "Earlier one order took me 3 days. Now it's done in 10 minutes — with my own style.",
    name: "ಶ್ರೀಮತಿ ಎಂ.ಎಲ್. ಕುಸುಮಾ",
    role: { kn: "ADLR ಅಧಿಕಾರಿ", en: "ADLR Officer" },
    district: { kn: "ಬೆಂಗಳೂರು ದಕ್ಷಿಣ", en: "Bengaluru South" },
  },
  {
    quoteKn:
      "ಸರ್ಕಾರಿ ಕನ್ನಡ ಪರಿಭಾಷೆ ನಿಖರ. ಯಾವುದೇ ಇಂಗ್ಲಿಷ್ ಬೆರೆಸಿಲ್ಲ. ಡ್ರಾಫ್ಟರ್ ಗಿಂತ ಉತ್ತಮ.",
    quoteEn:
      "The Sarakari Kannada is precise. Zero English mixed in. Better than a human drafter.",
    name: "ಶ್ರೀ ಬಿ. ರಾಜಶೇಖರ್",
    role: { kn: "ತಹಶೀಲ್ದಾರ್", en: "Tahsildar" },
    district: { kn: "ಮೈಸೂರು", en: "Mysuru" },
  },
  {
    quoteKn:
      "₹1,500 ಬದಲು ₹42 ಕ್ಕೆ ಒಂದು ಆದೇಶ. ಒಂದು ತಿಂಗಳಲ್ಲಿ ಸಂಬಳದಷ್ಟು ಉಳಿತಾಯ.",
    quoteEn:
      "₹42 per order instead of ₹1,500. Saved nearly a month's salary in the first month.",
    name: "ಶ್ರೀ ಕೆ. ನಾಗರಾಜ್",
    role: { kn: "ಭೂದಾಖಲೆಗಳ ಸಹಾಯಕ ನಿರ್ದೇಶಕರು", en: "ADLR" },
    district: { kn: "ಹಾಸನ", en: "Hassan" },
  },
];

const DISTRICTS: Bilingual[] = [
  { kn: "ಬೆಂಗಳೂರು ನಗರ", en: "Bengaluru Urban" },
  { kn: "ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ", en: "Bengaluru Rural" },
  { kn: "ಮೈಸೂರು", en: "Mysuru" },
  { kn: "ಹಾಸನ", en: "Hassan" },
  { kn: "ಮಂಡ್ಯ", en: "Mandya" },
  { kn: "ತುಮಕೂರು", en: "Tumakuru" },
  { kn: "ಕೋಲಾರ", en: "Kolar" },
  { kn: "ಚಿತ್ರದುರ್ಗ", en: "Chitradurga" },
  { kn: "ಶಿವಮೊಗ್ಗ", en: "Shivamogga" },
  { kn: "ದಾವಣಗೆರೆ", en: "Davanagere" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Fade-in-on-scroll hook
// ─────────────────────────────────────────────────────────────────────────────
function useFadeInOnScroll<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, visible };
}

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, visible } = useFadeInOnScroll<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 700ms ease-out ${delay}ms, transform 700ms ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Animated live counter (counts up once on mount)
// ─────────────────────────────────────────────────────────────────────────────
function LiveCounter({ target }: { target: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const duration = 1800;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return <span>{n.toLocaleString("en-IN")}</span>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock document preview with typing animation
// ─────────────────────────────────────────────────────────────────────────────
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

function MockDocument() {
  const [visibleLines, setVisibleLines] = useState(0);
  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      i = i + 1;
      if (i > MOCK_DOC_LINES.length) {
        i = 0;
      }
      setVisibleLines(i);
    }, 550);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="relative">
      {/* Document card */}
      <div
        className="relative bg-white rounded-xl shadow-2xl border p-6 sm:p-8 font-serif"
        style={{ borderColor: "#F3E5D8", minHeight: 420 }}
      >
        {/* Top ribbon */}
        <div
          className="absolute -top-3 left-6 right-6 h-2 rounded-full"
          style={{
            background: `linear-gradient(90deg, ${COLORS.saffron} 0%, ${COLORS.gold} 50%, #0B6623 100%)`,
          }}
        />
        <div className="flex items-center justify-between mb-4">
          <div
            className="text-[10px] uppercase tracking-widest font-semibold"
            style={{ color: COLORS.navy }}
          >
            Government of Karnataka
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span>Drafting…</span>
          </div>
        </div>

        <div className="space-y-2 text-[13px] leading-relaxed text-gray-800">
          {MOCK_DOC_LINES.slice(0, visibleLines).map((line, i) => (
            <div
              key={i}
              className={line === "" ? "h-2" : ""}
              style={{
                opacity: 0,
                animation: `ddlrLineIn 400ms ease-out forwards`,
              }}
            >
              {line}
            </div>
          ))}
          {visibleLines < MOCK_DOC_LINES.length && (
            <span
              className="inline-block w-2 h-4 align-middle"
              style={{ backgroundColor: COLORS.saffron, animation: "ddlrBlink 1s steps(2) infinite" }}
            />
          )}
        </div>

        {/* Seal badge */}
        <div
          className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full border-4 flex items-center justify-center shadow-lg rotate-[-8deg]"
          style={{ borderColor: COLORS.gold, backgroundColor: COLORS.cream }}
        >
          <div className="text-center leading-tight">
            <div className="text-[8px] font-bold" style={{ color: COLORS.navy }}>
              VERIFIED
            </div>
            <div className="text-[7px]" style={{ color: COLORS.saffron }}>
              ಆದೇಶ AI
            </div>
          </div>
        </div>
      </div>

      {/* Background sparkle */}
      <Sparkles
        className="absolute -top-8 -left-8 h-16 w-16 opacity-20"
        style={{ color: COLORS.gold }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { locale, toggleLocale } = useLanguage();
  const kn = locale === "kn";

  const [drafterCost, setDrafterCost] = useState(1500);
  const [ordersPerMonth, setOrdersPerMonth] = useState(30);
  const aadeshCost = 42;
  const monthlySavings = Math.max(0, (drafterCost - aadeshCost) * ordersPerMonth);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: COLORS.cream, color: COLORS.charcoal }}
    >
      {/* Keyframes */}
      <style>{`
        @keyframes ddlrLineIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        @keyframes ddlrBlink { 50% { opacity: 0; } }
        @keyframes ddlrGlow { 0%,100% { box-shadow: 0 0 0 0 rgba(230,81,0,0.35); } 50% { box-shadow: 0 0 0 14px rgba(230,81,0,0); } }
        @keyframes ddlrFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
      `}</style>

      {/* ─── NAV ─────────────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 w-full z-50 backdrop-blur-md border-b"
        style={{ backgroundColor: "rgba(255,247,240,0.85)", borderColor: "#F3E5D8" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center gap-2">
              <div
                className="h-9 w-9 rounded-lg flex items-center justify-center text-white font-bold"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.saffron}, ${COLORS.gold})`,
                }}
              >
                ಆ
              </div>
              <div className="leading-tight">
                <div className="text-lg font-bold" style={{ color: COLORS.navy }}>
                  ಆದೇಶ AI
                </div>
                <div className="text-[10px] text-gray-500 -mt-0.5">Aadesh AI</div>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link href="#how" className="hover:opacity-70">
                {kn ? "ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ" : "How It Works"}
              </Link>
              <Link href="#demo" className="hover:opacity-70">
                {kn ? "ಡೆಮೊ" : "Demo"}
              </Link>
              <Link href="#pricing" className="hover:opacity-70">
                {kn ? "ಬೆಲೆ" : "Pricing"}
              </Link>
              <Link href="#testimonials" className="hover:opacity-70">
                {kn ? "ಅಭಿಪ್ರಾಯ" : "Testimonials"}
              </Link>

              <button
                onClick={toggleLocale}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border"
                style={{ borderColor: COLORS.saffron, color: COLORS.saffron }}
                aria-label="Toggle language"
              >
                <Globe className="h-3.5 w-3.5" />
                {kn ? "EN" : "ಕನ್ನಡ"}
              </button>

              <Link
                href="/auth/register"
                className="px-4 py-2 rounded-lg text-white text-sm font-semibold shadow-md hover:opacity-90 transition"
                style={{ background: `linear-gradient(135deg, ${COLORS.saffron}, ${COLORS.saffronDark})` }}
              >
                {kn ? "ಉಚಿತವಾಗಿ ಪ್ರಾರಂಭಿಸಿ" : "Get Started Free"}
              </Link>
            </div>

            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={toggleLocale}
                className="px-2 py-1 text-xs font-semibold rounded border"
                style={{ borderColor: COLORS.saffron, color: COLORS.saffron }}
              >
                {kn ? "EN" : "ಕ"}
              </button>
              <Link
                href="/auth/register"
                className="px-3 py-1.5 rounded-md text-white text-xs font-semibold"
                style={{ backgroundColor: COLORS.saffron }}
              >
                {kn ? "ಪ್ರಯತ್ನಿಸಿ" : "Try"}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── HERO ────────────────────────────────────────────────────────── */}
      <section
        className="relative pt-28 pb-16 overflow-hidden"
        style={{
          background: `
            radial-gradient(ellipse 90% 70% at 20% 0%, rgba(249,168,37,0.22), transparent 60%),
            radial-gradient(ellipse 90% 70% at 85% 15%, rgba(230,81,0,0.10), transparent 55%),
            linear-gradient(180deg, ${COLORS.cream} 0%, ${COLORS.peach} 100%)
          `,
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center">
            {/* Made in Bengaluru pill — base44 style */}
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold mb-6"
                 style={{
                   background: `linear-gradient(135deg, ${COLORS.saffron}, ${COLORS.gold})`,
                   color: "white",
                   boxShadow: "0 4px 14px rgba(230,81,0,0.25)",
                 }}>
              <MapPin className="h-3.5 w-3.5" />
              {kn ? "ಬೆಂಗಳೂರಿನಲ್ಲಿ ನಿರ್ಮಿಸಲಾಗಿದೆ" : "Made in Bengaluru"} 🇮🇳
            </div>

            {/* Bilingual display headline — brown serif */}
            <h1
              className="font-serif font-bold tracking-tight leading-[1.02] text-5xl sm:text-6xl lg:text-7xl"
              style={{ color: COLORS.brownDisplay }}
            >
              {kn ? (
                <>
                  ಯಾವುದೇ ಔಪಚಾರಿಕ ದಾಖಲೆಯನ್ನು
                  <span className="block mt-2">
                    2 ನಿಮಿಷದಲ್ಲಿ ಬರೆಯಿರಿ.
                  </span>
                </>
              ) : (
                <>
                  Draft Any Formal Document
                  <span className="block mt-2">in 2 Minutes.</span>
                </>
              )}
            </h1>
            <div className="mt-4 text-lg sm:text-xl font-medium text-gray-500 italic">
              {kn
                ? "Draft Any Formal Document in 2 Minutes."
                : "ಯಾವುದೇ ಔಪಚಾರಿಕ ದಾಖಲೆಯನ್ನು 2 ನಿಮಿಷದಲ್ಲಿ ಬರೆಯಿರಿ."}
            </div>

            {/* Subhead */}
            <p className="mt-8 text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
              {kn
                ? "ನಿಮ್ಮ ಅತ್ಯುತ್ತಮ ದಾಖಲೆಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ. AI ನಿಮ್ಮ ನಿಖರ ಶೈಲಿಯನ್ನು ಕಲಿಯುತ್ತದೆ. ಹೊಸ ದಾಖಲೆಗಳು ಗಂಟೆಗಳಲ್ಲಿ ಅಲ್ಲ — ನಿಮಿಷಗಳಲ್ಲಿ ರಚಿತವಾಗುತ್ತವೆ."
                : "Upload your best documents. AI learns your exact style. New documents drafted in minutes — not hours."}
            </p>

            {/* Live counter + trust strip */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <span
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-white shadow-sm border"
                style={{ borderColor: "#F3E5D8", color: COLORS.brownDisplay }}
              >
                <FileText className="h-4 w-4" style={{ color: COLORS.saffron }} />
                <span className="text-gray-500">{kn ? "ಇಲ್ಲಿಯವರೆಗೆ ರಚಿಸಲಾದ ದಾಖಲೆಗಳು:" : "Documents generated so far:"}</span>
                <span className="font-extrabold" style={{ color: COLORS.saffron }}>
                  <LiveCounter target={2847} />
                </span>
              </span>
            </div>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/register"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-white font-bold text-base shadow-lg transition"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.saffron}, ${COLORS.saffronDark})`,
                  animation: "ddlrGlow 2.4s ease-in-out infinite",
                }}
              >
                {kn ? "ಉಚಿತವಾಗಿ ಪ್ರಾರಂಭಿಸಿ" : "Get Started Free"}
                <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
              </Link>
              <Link
                href="#demo"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-base border-2 transition hover:bg-white"
                style={{ borderColor: COLORS.brownDisplay, color: COLORS.brownDisplay }}
              >
                <PlayCircle className="h-5 w-5" />
                {kn ? "ಡೆಮೊ ನೋಡಿ" : "Watch Demo"}
              </Link>
            </div>

            {/* Trust strip */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" style={{ color: COLORS.saffron }} />
                {kn ? "ಎನ್‌ಕ್ರಿಪ್ಟ್ ಡೇಟಾ" : "Encrypted"}
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="h-4 w-4" style={{ color: COLORS.saffron }} />
                {kn ? "100% ಖಾಸಗಿ" : "100% Private"}
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="h-4 w-4" style={{ color: COLORS.saffron }} />
                {kn ? "576+ ದಾಖಲೆಗಳಿಂದ ತರಬೇತಿ" : "Trained on 576+ documents"}
              </div>
            </div>
          </Reveal>

          {/* Floating mock document below headline */}
          <Reveal delay={200}>
            <div className="mt-14 max-w-2xl mx-auto" style={{ animation: "ddlrFloat 6s ease-in-out infinite" }}>
              <MockDocument />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── ROLE SELECTOR ──────────────────────────────────────────────── */}
      <section
        className="py-20"
        style={{
          background: `linear-gradient(180deg, ${COLORS.peach} 0%, ${COLORS.rose} 100%)`,
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-10">
            <div
              className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500"
            >
              {kn ? "ನಾನು ಒಬ್ಬ:" : "I am a:"}
            </div>
            <h2
              className="mt-3 font-serif text-3xl sm:text-4xl font-bold"
              style={{ color: COLORS.brownDisplay }}
            >
              {kn ? "ನಿಮ್ಮ ಪಾತ್ರವನ್ನು ಆಯ್ಕೆ ಮಾಡಿ" : "Choose Your Role"}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {kn
                ? "Aadesh AI ನಿಮ್ಮ ಕೆಲಸಕ್ಕೆ ಹೊಂದಿಕೊಳ್ಳುತ್ತದೆ — ಸರ್ಕಾರಿ ಅಧಿಕಾರಿಗಳಿಗೆ ಅಥವಾ ಖಾಸಗಿ ವೃತ್ತಿಪರರಿಗೆ."
                : "Aadesh AI adapts to your workflow — whether you're in government service or private practice."}
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 gap-6">
            {ROLES.map((role, i) => {
              const Icon = role.icon;
              return (
                <Reveal key={role.key} delay={i * 120}>
                  <Link
                    href="/auth/register"
                    className="group block bg-white rounded-3xl p-8 shadow-sm border-2 transition hover:shadow-2xl hover:-translate-y-1"
                    style={{ borderColor: "rgba(0,0,0,0.04)" }}
                  >
                    <div className="text-center">
                      {/* Emoji + icon */}
                      <div
                        className="mx-auto h-16 w-16 rounded-2xl flex items-center justify-center text-3xl transition group-hover:scale-110"
                        style={{ backgroundColor: role.accentBg }}
                      >
                        <Icon className="h-8 w-8" style={{ color: role.accent }} />
                      </div>

                      {/* Title */}
                      <h3
                        className="mt-5 text-2xl font-extrabold"
                        style={{ color: role.accent }}
                      >
                        {kn ? role.titleKn : role.titleEn}
                      </h3>
                      <div className="text-xs font-semibold text-gray-400 mt-0.5">
                        {kn ? role.titleEn : role.titleKn}
                      </div>

                      {/* Roles list */}
                      <div className="mt-4 text-sm font-medium text-gray-600">
                        {kn ? role.rolesKn : role.rolesEn}
                      </div>

                      {/* Sample docs */}
                      <div
                        className="mt-4 pt-4 border-t text-xs text-gray-500"
                        style={{ borderColor: "rgba(0,0,0,0.06)" }}
                      >
                        <span className="font-semibold uppercase tracking-wider">
                          {kn ? "ಉದಾಹರಣೆ ದಾಖಲೆಗಳು" : "Sample docs"}
                        </span>
                        <div className="mt-1.5 text-gray-600">
                          {kn ? role.sampleDocsKn : role.sampleDocsEn}
                        </div>
                      </div>

                      {/* CTA pill */}
                      <div
                        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition group-hover:gap-3"
                        style={{ backgroundColor: role.accentBg, color: role.accent }}
                      >
                        {kn ? "ಆಯ್ಕೆ ಮಾಡಿ" : "Select"}
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>

          <Reveal delay={300}>
            <div className="mt-10 text-center text-sm text-gray-500">
              {kn
                ? "ಯಾವುದನ್ನಾದರೂ ಪ್ರಯತ್ನಿಸಿ — ಯಾವುದೇ ಸಮಯದಲ್ಲಿ ಬದಲಾಯಿಸಬಹುದು. ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಅಗತ್ಯವಿಲ್ಲ."
                : "Try either — switch any time. No credit card required."}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── HOW IT WORKS ────────────────────────────────────────────────── */}
      <section id="how" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-16">
            <div className="text-sm font-semibold uppercase tracking-widest" style={{ color: COLORS.saffron }}>
              {kn ? "3 ಸರಳ ಹಂತಗಳು" : "3 Simple Steps"}
            </div>
            <h2 className="mt-2 font-serif text-4xl font-bold" style={{ color: COLORS.brownDisplay }}>
              {kn ? "ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ" : "How It Works"}
            </h2>
            <p className="mt-2 text-gray-500">
              {kn ? "How It Works" : "ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ"}
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {HOW_STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <Reveal key={i} delay={i * 120}>
                  <div
                    className="relative bg-white rounded-2xl p-8 shadow-md border-2 hover:shadow-xl transition group"
                    style={{ borderColor: "#F3E5D8" }}
                  >
                    <div
                      className="absolute -top-5 left-8 h-10 w-10 rounded-full flex items-center justify-center text-white font-bold shadow-md"
                      style={{
                        background: `linear-gradient(135deg, ${COLORS.saffron}, ${COLORS.gold})`,
                      }}
                    >
                      {i + 1}
                    </div>
                    <div
                      className="h-14 w-14 rounded-xl flex items-center justify-center mb-5 mt-2 transition group-hover:scale-110"
                      style={{ backgroundColor: "rgba(26,35,126,0.08)" }}
                    >
                      <Icon className="h-7 w-7" style={{ color: COLORS.navy }} />
                    </div>
                    <h3 className="text-xl font-bold" style={{ color: COLORS.navy }}>
                      {step.title.kn}
                    </h3>
                    <div className="text-sm font-semibold text-gray-500 mb-3">
                      {step.title.en}
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {kn ? step.desc.kn : step.desc.en}
                    </p>
                    <p className="mt-1 text-xs text-gray-400 italic">
                      {kn ? step.desc.en : step.desc.kn}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── DEMO / TRY FREE ─────────────────────────────────────────────── */}
      <section
        id="demo"
        className="py-24"
        style={{
          background: `linear-gradient(180deg, ${COLORS.cream}, #FFF4E6)`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <div
              className="text-sm font-semibold uppercase tracking-widest"
              style={{ color: COLORS.saffron }}
            >
              {kn ? "ಲೈವ್ ಡೆಮೊ" : "Live Demo"}
            </div>
            <h2 className="mt-2 font-serif text-4xl font-bold" style={{ color: COLORS.brownDisplay }}>
              {kn ? "3 ಉಚಿತ ಆದೇಶಗಳನ್ನು ಪ್ರಯತ್ನಿಸಿ" : "Try 3 Free Orders"}
            </h2>
            <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
              {kn
                ? "ಒಂದು ಪ್ರಕರಣ ಪ್ರಕಾರವನ್ನು ಆಯ್ಕೆ ಮಾಡಿ — ತಕ್ಷಣ ನಮೂನೆ ಆದೇಶ ನೋಡಿ."
                : "Pick a case type — see an instant sample order preview."}
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {DEMO_CASES.map((c, i) => (
              <Reveal key={i} delay={i * 120}>
                <DemoCard
                  titleKn={c.titleKn}
                  titleEn={c.titleEn}
                  taglineKn={c.tagline.kn}
                  taglineEn={c.tagline.en}
                  preview={c.preview}
                  kn={kn}
                />
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-12 text-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-bold text-lg shadow-xl transition hover:opacity-95"
              style={{
                background: `linear-gradient(135deg, ${COLORS.saffron}, ${COLORS.saffronDark})`,
              }}
            >
              {kn ? "3 ಉಚಿತ ಆದೇಶಗಳನ್ನು ಪಡೆಯಿರಿ" : "Get 3 Free Orders"}
              <ArrowRight className="h-5 w-5" />
            </Link>
            <div className="mt-3 text-xs text-gray-500">
              {kn ? "ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಅಗತ್ಯವಿಲ್ಲ" : "No credit card required"}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── PRICING ─────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-16">
            <div
              className="text-sm font-semibold uppercase tracking-widest"
              style={{ color: COLORS.saffron }}
            >
              {kn ? "ಬೆಲೆ" : "Pricing"}
            </div>
            <h2 className="mt-2 font-serif text-4xl font-bold" style={{ color: COLORS.brownDisplay }}>
              {kn ? "ಬೇಕಾದಷ್ಟು ಮಾತ್ರ ಪಾವತಿಸಿ" : "Pay Only For What You Need"}
            </h2>
            <p className="mt-3 text-gray-600">
              {kn ? "Pay only for what you need" : "ಬೇಕಾದಷ್ಟು ಮಾತ್ರ ಪಾವತಿಸಿ"}
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PRICING_PACKS.map((pack, i) => (
              <Reveal key={pack.nameEn} delay={i * 120}>
                <div
                  className={`relative rounded-2xl p-8 transition ${
                    pack.featured
                      ? "shadow-2xl scale-105 border-4"
                      : "shadow-md border-2 bg-white hover:shadow-xl"
                  }`}
                  style={{
                    borderColor: pack.featured ? COLORS.saffron : "#F3E5D8",
                    backgroundColor: pack.featured ? "white" : undefined,
                  }}
                >
                  {pack.featured && (
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white"
                      style={{
                        background: `linear-gradient(135deg, ${COLORS.saffron}, ${COLORS.gold})`,
                      }}
                    >
                      {kn ? "ಅತ್ಯಂತ ಜನಪ್ರಿಯ" : "MOST POPULAR"}
                    </div>
                  )}
                  <h3 className="text-2xl font-bold" style={{ color: COLORS.navy }}>
                    {kn ? pack.nameKn : pack.nameEn}
                  </h3>
                  <div className="text-xs text-gray-400 font-medium">
                    {kn ? pack.nameEn : pack.nameKn}
                  </div>
                  <div className="mt-5 flex items-baseline gap-1">
                    <span
                      className="text-5xl font-extrabold"
                      style={{ color: COLORS.saffron }}
                    >
                      ₹{pack.price.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    {pack.orders} {kn ? "ಆದೇಶಗಳು" : "orders"} · ₹{pack.perOrder}
                    /{kn ? "ಆದೇಶ" : "order"}
                  </div>
                  <ul className="mt-6 space-y-3 text-sm">
                    {[
                      kn ? "ಸರಕಾರಿ ಕನ್ನಡ" : "Sarakari Kannada",
                      kn ? "DOCX + PDF ಡೌನ್‌ಲೋಡ್" : "DOCX + PDF download",
                      kn ? "13-ವಿಭಾಗ ರಚನೆ" : "13-section structure",
                      kn ? "ಉಚಿತ ನವೀಕರಣಗಳು" : "Free updates",
                    ].map((f, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <Check
                          className="h-5 w-5 flex-shrink-0"
                          style={{ color: COLORS.saffron }}
                        />
                        <span className="text-gray-700">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/auth/register"
                    className="mt-8 block text-center py-3 rounded-lg font-bold transition"
                    style={{
                      backgroundColor: pack.featured ? COLORS.saffron : "transparent",
                      color: pack.featured ? "white" : COLORS.saffron,
                      border: `2px solid ${COLORS.saffron}`,
                    }}
                  >
                    {kn ? "ಆಯ್ಕೆಮಾಡಿ" : "Choose"}
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Savings calculator */}
          <Reveal delay={200}>
            <div
              className="mt-16 max-w-3xl mx-auto rounded-2xl p-8 shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.navyDark})`,
                color: "white",
              }}
            >
              <div className="text-center mb-6">
                <div
                  className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
                  style={{ backgroundColor: COLORS.gold, color: COLORS.navyDark }}
                >
                  {kn ? "ಉಳಿತಾಯ ಕ್ಯಾಲ್ಕುಲೇಟರ್" : "Savings Calculator"}
                </div>
                <h3 className="mt-3 text-2xl font-bold">
                  {kn ? "₹75/ಆದೇಶ vs ₹1,500/ಡ್ರಾಫ್ಟರ್" : "₹75/order vs ₹1,500/drafter"}
                </h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs uppercase tracking-wide opacity-80">
                    {kn ? "ಡ್ರಾಫ್ಟರ್ ಶುಲ್ಕ (₹/ಆದೇಶ)" : "Drafter fee (₹/order)"}
                  </label>
                  <input
                    type="range"
                    min={500}
                    max={2500}
                    step={50}
                    value={drafterCost}
                    onChange={(e) => setDrafterCost(Number(e.target.value))}
                    className="mt-2 w-full accent-[#F9A825]"
                  />
                  <div className="mt-1 text-lg font-bold" style={{ color: COLORS.gold }}>
                    ₹{drafterCost.toLocaleString("en-IN")}
                  </div>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wide opacity-80">
                    {kn ? "ತಿಂಗಳಿಗೆ ಆದೇಶಗಳು" : "Orders per month"}
                  </label>
                  <input
                    type="range"
                    min={5}
                    max={100}
                    step={5}
                    value={ordersPerMonth}
                    onChange={(e) => setOrdersPerMonth(Number(e.target.value))}
                    className="mt-2 w-full accent-[#F9A825]"
                  />
                  <div className="mt-1 text-lg font-bold" style={{ color: COLORS.gold }}>
                    {ordersPerMonth}
                  </div>
                </div>
              </div>
              <div className="mt-6 text-center border-t border-white/20 pt-6">
                <div className="text-xs uppercase tracking-widest opacity-80">
                  {kn ? "ನಿಮ್ಮ ಮಾಸಿಕ ಉಳಿತಾಯ" : "Your monthly savings"}
                </div>
                <div
                  className="mt-2 text-5xl font-extrabold"
                  style={{ color: COLORS.gold }}
                >
                  ₹{monthlySavings.toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── TESTIMONIALS & TRUST ───────────────────────────────────────── */}
      <section
        id="testimonials"
        className="py-24"
        style={{ backgroundColor: "#FFF8EF" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-16">
            <div
              className="text-sm font-semibold uppercase tracking-widest"
              style={{ color: COLORS.saffron }}
            >
              {kn ? "ಅಧಿಕಾರಿಗಳ ಅಭಿಪ್ರಾಯ" : "Officer Testimonials"}
            </div>
            <h2 className="mt-2 font-serif text-4xl font-bold" style={{ color: COLORS.brownDisplay }}>
              {kn ? "ಕರ್ನಾಟಕಾದ್ಯಂತ ನಂಬಿಕೆ" : "Trusted Across Karnataka"}
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={i} delay={i * 120}>
                <div
                  className="relative bg-white rounded-2xl p-7 shadow-md border-2 h-full"
                  style={{ borderColor: "#F3E5D8" }}
                >
                  <Quote
                    className="absolute top-4 right-4 h-10 w-10 opacity-10"
                    style={{ color: COLORS.saffron }}
                  />
                  <p className="text-base font-semibold leading-relaxed" style={{ color: COLORS.navy }}>
                    &ldquo;{t.quoteKn}&rdquo;
                  </p>
                  <p className="mt-3 text-sm text-gray-600 italic leading-relaxed">
                    &ldquo;{t.quoteEn}&rdquo;
                  </p>
                  <div className="mt-6 flex items-center gap-3 pt-4 border-t" style={{ borderColor: "#F3E5D8" }}>
                    <div
                      className="h-11 w-11 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{
                        background: `linear-gradient(135deg, ${COLORS.saffron}, ${COLORS.gold})`,
                      }}
                    >
                      {t.name.split(" ").slice(-1)[0].charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-sm" style={{ color: COLORS.navy }}>
                        {t.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {kn ? t.role.kn : t.role.en} · {kn ? t.district.kn : t.district.en}
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Trust badges */}
          <Reveal>
            <div className="grid sm:grid-cols-3 gap-4 mb-16">
              {[
                { icon: MapPin, kn: "ಬೆಂಗಳೂರಿನಲ್ಲಿ ನಿರ್ಮಿಸಲಾಗಿದೆ", en: "Made in Bengaluru" },
                { icon: Lock, kn: "ಡೇಟಾ ಎನ್‌ಕ್ರಿಪ್ಟ್", en: "Data Encrypted" },
                { icon: ShieldCheck, kn: "100% ಖಾಸಗಿ", en: "100% Private" },
              ].map((b, i) => {
                const Icon = b.icon;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-4 bg-white rounded-xl p-5 shadow-sm border-2"
                    style={{ borderColor: "#F3E5D8" }}
                  >
                    <div
                      className="h-12 w-12 rounded-xl flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${COLORS.saffron}, ${COLORS.gold})`,
                      }}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold" style={{ color: COLORS.navy }}>
                        {kn ? b.kn : b.en}
                      </div>
                      <div className="text-xs text-gray-500">{kn ? b.en : b.kn}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>

          {/* District coverage */}
          <Reveal>
            <div
              className="rounded-2xl p-8 border-2"
              style={{ borderColor: "#F3E5D8", backgroundColor: "white" }}
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold" style={{ color: COLORS.navy }}>
                  {kn ? "ಕರ್ನಾಟಕ ವ್ಯಾಪ್ತಿ" : "Karnataka Coverage"}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {kn ? "10+ ಜಿಲ್ಲೆಗಳಲ್ಲಿ ಸಕ್ರಿಯ" : "Active in 10+ districts"}
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {DISTRICTS.map((d, i) => (
                  <span
                    key={i}
                    className="px-4 py-2 rounded-full text-sm font-medium border-2"
                    style={{
                      borderColor: COLORS.saffron,
                      color: COLORS.saffronDark,
                      backgroundColor: "rgba(230,81,0,0.05)",
                    }}
                  >
                    {kn ? d.kn : d.en}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────────────────── */}
      <footer
        className="py-16"
        style={{
          background: `linear-gradient(180deg, ${COLORS.navy}, ${COLORS.navyDark})`,
          color: "white",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.saffron}, ${COLORS.gold})`,
                  }}
                >
                  ಆ
                </div>
                <div>
                  <div className="text-xl font-bold">ಆದೇಶ AI</div>
                  <div className="text-xs opacity-70 -mt-0.5">Aadesh AI</div>
                </div>
              </div>
              <p className="text-sm opacity-80 leading-relaxed">
                {kn
                  ? "ಕರ್ನಾಟಕ ಭೂದಾಖಲೆ ಕಚೇರಿಗಳಿಗಾಗಿ AI ಆದೇಶ ಕರಡು."
                  : "AI order drafting for Karnataka land record offices."}
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-widest" style={{ color: COLORS.gold }}>
                {kn ? "ಉತ್ಪನ್ನ" : "Product"} / Product
              </h4>
              <ul className="space-y-2 text-sm opacity-90">
                <li><Link href="#how" className="hover:opacity-70">{kn ? "ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ" : "How It Works"}</Link></li>
                <li><Link href="#demo" className="hover:opacity-70">{kn ? "ಡೆಮೊ" : "Demo"}</Link></li>
                <li><Link href="#pricing" className="hover:opacity-70">{kn ? "ಬೆಲೆ" : "Pricing"}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-widest" style={{ color: COLORS.gold }}>
                {kn ? "ಕಾನೂನು" : "Legal"} / Legal
              </h4>
              <ul className="space-y-2 text-sm opacity-90">
                <li><Link href="/legal/privacy" className="hover:opacity-70">{kn ? "ಗೌಪ್ಯತಾ ನೀತಿ" : "Privacy Policy"}</Link></li>
                <li><Link href="/legal/terms" className="hover:opacity-70">{kn ? "ನಿಯಮಗಳು" : "Terms"}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-widest" style={{ color: COLORS.gold }}>
                {kn ? "ಸಂಪರ್ಕ" : "Contact"} / Contact
              </h4>
              <ul className="space-y-2 text-sm opacity-90">
                <li>support@aadesh.ai</li>
                <li>{kn ? "ಬೆಂಗಳೂರು, ಕರ್ನಾಟಕ" : "Bengaluru, Karnataka"}</li>
              </ul>
            </div>
          </div>

          <div
            className="mt-12 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{ borderColor: "rgba(255,255,255,0.15)" }}
          >
            <p className="text-sm opacity-80">
              &copy; {new Date().getFullYear()} ಆದೇಶ AI ·{" "}
              {kn ? "ಎಲ್ಲಾ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ" : "All rights reserved"}
            </p>
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
              style={{
                background: `linear-gradient(135deg, ${COLORS.saffron}, ${COLORS.gold})`,
                color: "white",
              }}
            >
              🇮🇳 ಕರ್ನಾಟಕದಲ್ಲಿ ನಿರ್ಮಿಸಲಾಗಿದೆ · Made in Karnataka
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Demo card with click-to-preview
// ─────────────────────────────────────────────────────────────────────────────
function DemoCard({
  titleKn,
  titleEn,
  taglineKn,
  taglineEn,
  preview,
  kn,
}: {
  titleKn: string;
  titleEn: string;
  taglineKn: string;
  taglineEn: string;
  preview: string;
  kn: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="bg-white rounded-2xl shadow-md border-2 overflow-hidden hover:shadow-xl transition group"
      style={{ borderColor: "#F3E5D8" }}
    >
      <div
        className="p-6 cursor-pointer"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold" style={{ color: COLORS.navy }}>
              {titleKn}
            </h3>
            <div className="text-sm text-gray-500 font-semibold">{titleEn}</div>
          </div>
          <div
            className="h-10 w-10 rounded-lg flex items-center justify-center transition group-hover:scale-110"
            style={{
              background: `linear-gradient(135deg, ${COLORS.saffron}, ${COLORS.gold})`,
            }}
          >
            <PlayCircle className="h-5 w-5 text-white" />
          </div>
        </div>
        <div className="mt-3 text-sm text-gray-600">
          {kn ? taglineKn : taglineEn}
        </div>
        <div className="mt-4 text-xs font-semibold" style={{ color: COLORS.saffron }}>
          {open ? (kn ? "▲ ಮುಚ್ಚಿ" : "▲ Hide preview") : (kn ? "▼ ಮಾದರಿ ನೋಡಿ" : "▼ View preview")}
        </div>
      </div>
      <div
        style={{
          maxHeight: open ? 400 : 0,
          opacity: open ? 1 : 0,
          transition: "max-height 400ms ease, opacity 300ms ease",
          overflow: "hidden",
        }}
      >
        <div
          className="p-6 text-sm leading-relaxed font-serif border-t"
          style={{
            borderColor: "#F3E5D8",
            backgroundColor: "#FFFBF3",
            color: COLORS.charcoal,
          }}
        >
          {preview}
          <div className="mt-3 text-xs italic text-gray-500">
            {kn ? "— ನಮೂನೆ ಮಾತ್ರ. ಪೂರ್ಣ ಆದೇಶಕ್ಕೆ ಸೈನ್ ಅಪ್ ಮಾಡಿ." : "— Sample only. Sign up for full order."}
          </div>
        </div>
      </div>
    </div>
  );
}
