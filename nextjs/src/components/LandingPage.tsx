"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  FileCheck2,
  FileText,
  Fingerprint,
  Globe,
  Landmark,
  Lock,
  PenLine,
  Scale,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { useLanguage } from "@/lib/context/LanguageContext";

const C = {
  saffron: "#E97B3B",
  saffronDark: "#BF360C",
  navy: "#17215F",
  navyDark: "#0D143F",
  cream: "#FFF7F0",
  peach: "#FBE7D8",
  warmWhite: "#FFFCFA",
  gold: "#F9A825",
  green: "#138808",
  charcoal: "#1F2937",
  midGray: "#667085",
  borderWarm: "#F0D8C7",
};

type Copy = { en: string; kn: string };
type Locale = "en" | "kn";

function text(copy: Copy, locale: Locale) {
  return locale === "kn" ? copy.kn : copy.en;
}

function Bi({ en, kn }: Copy) {
  const { locale } = useLanguage();
  return <>{locale === "kn" ? kn : en}</>;
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <div className="aadesh-reveal" style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function LogoMark() {
  return (
    <div className="logoMark" aria-hidden="true">
      ಆ
    </div>
  );
}

function FAQItem({ q, a }: { q: Copy; a: Copy }) {
  const { locale } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <div className="faqItem">
      <button type="button" className="faqButton" onClick={() => setOpen((value) => !value)}>
        <span>{text(q, locale)}</span>
        <ChevronDown size={18} className={open ? "faqChevron open" : "faqChevron"} />
      </button>
      {open && <p className="faqAnswer">{text(a, locale)}</p>}
    </div>
  );
}

const pipelineSteps = [
  { icon: Upload, en: "PDF uploaded", kn: "PDF ಅಪ್ಲೋಡ್", noteEn: "Input hash created", noteKn: "input hash ಸೃಷ್ಟಿ" },
  { icon: Lock, en: "Entity Lock", kn: "Entity Lock", noteEn: "Facts verified", noteKn: "ವಿವರ ಪರಿಶೀಲನೆ" },
  { icon: PenLine, en: "Officer Reasoning", kn: "ಅಧಿಕಾರಿ ವಿವೇಚನೆ", noteEn: "Human note saved", noteKn: "ಮಾನವ note ಉಳಿಸಲಾಗಿದೆ" },
  { icon: FileText, en: "Draft", kn: "ಕರಡು", noteEn: "Kannada DOCX ready", noteKn: "ಕನ್ನಡ DOCX ಸಿದ್ಧ" },
  { icon: Fingerprint, en: "Assistance Report", kn: "Assistance Report", noteEn: "Manifest hash ready", noteKn: "manifest hash ಸಿದ್ಧ" },
];

const todayRows: Copy[] = [
  { en: "Read 50-60 pages manually", kn: "50-60 ಪುಟಗಳನ್ನು ಕೈಯಾರೆ ಓದಬೇಕು" },
  { en: "Ask senior/private drafter", kn: "ಹಿರಿಯರು/ಖಾಸಗಿ ಕರಡುಗಾರರ ಮೇಲೆ ಅವಲಂಬನೆ" },
  { en: "Pay ₹1,000-₹2,000/order", kn: "ಪ್ರತಿ ಆದೇಶಕ್ಕೆ ₹1,000-₹2,000 ವೆಚ್ಚ" },
  { en: "Depend on typist", kn: "typist ಮೇಲೆ ಅವಲಂಬನೆ" },
  { en: "No audit proof", kn: "audit proof ಇಲ್ಲ" },
];

const aadeshRows: Copy[] = [
  { en: "Upload case PDF", kn: "ಪ್ರಕರಣದ PDF ಅಪ್ಲೋಡ್ ಮಾಡಿ" },
  { en: "AI prepares structured draft", kn: "AI structured draft ತಯಾರಿಸುತ್ತದೆ" },
  { en: "₹250-₹333 effective pilot cost", kn: "₹250-₹333 ಪರಿಣಾಮಕಾರಿ ಪೈಲಟ್ ವೆಚ್ಚ" },
  { en: "Download editable DOCX", kn: "editable DOCX ಡೌನ್‌ಲೋಡ್" },
  { en: "Assistance Report + hash trail", kn: "Assistance Report + hash trail" },
];

const assistantBullets: Copy[] = [
  { en: "Aadesh AI does not decide the case.", kn: "ಆದೇಶ AI ಪ್ರಕರಣದ ತೀರ್ಮಾನ ಮಾಡುವುದಿಲ್ಲ." },
  { en: "Aadesh AI does not sign the order.", kn: "ಆದೇಶ AI ಆದೇಶಕ್ಕೆ ಸಹಿ ಮಾಡುವುದಿಲ್ಲ." },
  { en: "Aadesh AI does not replace the officer.", kn: "ಆದೇಶ AI ಅಧಿಕಾರಿಯನ್ನು ಬದಲಿಸುವುದಿಲ್ಲ." },
  { en: "It prepares a draft only after human verification and reasoning.", kn: "ಮಾನವ ಪರಿಶೀಲನೆ ಮತ್ತು ಕಾರಣ ದಾಖಲಿಸಿದ ನಂತರ ಮಾತ್ರ ಕರಡು ತಯಾರಿಸುತ್ತದೆ." },
];

const workflowSteps = [
  { icon: Upload, en: "Upload PDF", kn: "PDF ಅಪ್ಲೋಡ್" },
  { icon: Lock, en: "Entity Lock", kn: "ಘಟಕ ದೃಢೀಕರಣ" },
  { icon: PenLine, en: "Officer Reasoning", kn: "ಅಧಿಕಾರಿ ವಿವೇಚನೆ" },
  { icon: FileCheck2, en: "Generate Draft", kn: "ಕರಡು ರಚನೆ" },
  { icon: Fingerprint, en: "Assistance Report", kn: "ಸಹಾಯ ವರದಿ" },
];

const proofCards = [
  {
    icon: Lock,
    title: { en: "Entity Lock", kn: "Entity Lock" },
    body: { en: "User verifies extracted names, survey numbers, place and case details.", kn: "ಹೆಸರು, ಸರ್ವೆ ಸಂಖ್ಯೆ, ಸ್ಥಳ ಮತ್ತು ಪ್ರಕರಣ ವಿವರಗಳನ್ನು ಬಳಕೆದಾರ ಪರಿಶೀಲಿಸುತ್ತಾರೆ." },
  },
  {
    icon: PenLine,
    title: { en: "Officer Reasoning", kn: "ಅಧಿಕಾರಿ ವಿವೇಚನೆ" },
    body: { en: "Human reasoning is recorded before draft generation.", kn: "ಕರಡು ರಚನೆಗೆ ಮೊದಲು ಮಾನವ ವಿವೇಚನೆ ದಾಖಲಾಗುತ್ತದೆ." },
  },
  {
    icon: FileCheck2,
    title: { en: "Assistance Report", kn: "Assistance Report" },
    body: { en: "Report shows source, verification, reasoning and model metadata.", kn: "ವರದಿ source, verification, reasoning ಮತ್ತು model metadata ತೋರಿಸುತ್ತದೆ." },
  },
  {
    icon: Fingerprint,
    title: { en: "Manifest Hash", kn: "Manifest Hash" },
    body: { en: "Hashes help prove what input, draft and report were used.", kn: "ಯಾವ input, draft ಮತ್ತು report ಬಳಸಲಾಗಿದೆ ಎಂಬುದಕ್ಕೆ hash trail ಸಹಾಯ ಮಾಡುತ್ತದೆ." },
  },
];

const pricing = [
  { name: { en: "Trial", kn: "ಟ್ರಯಲ್" }, price: { en: "Free", kn: "ಉಚಿತ" }, meta: { en: "1 order", kn: "1 ಆದೇಶ" }, per: { en: "Start safely", kn: "ಸುರಕ್ಷಿತ ಪ್ರಾರಂಭ" } },
  { name: { en: "Starter", kn: "ಸ್ಟಾರ್ಟರ್" }, price: { en: "₹999", kn: "₹999" }, meta: { en: "3 orders", kn: "3 ಆದೇಶಗಳು" }, per: { en: "₹333 per order", kn: "₹333 ಪ್ರತಿ ಆದೇಶ" } },
  { name: { en: "Regular", kn: "ರೆಗ್ಯುಲರ್" }, price: { en: "₹1,499", kn: "₹1,499" }, meta: { en: "5 orders", kn: "5 ಆದೇಶಗಳು" }, per: { en: "₹300 per order", kn: "₹300 ಪ್ರತಿ ಆದೇಶ" }, featured: true },
  { name: { en: "Pro", kn: "ಪ್ರೋ" }, price: { en: "₹2,499", kn: "₹2,499" }, meta: { en: "10 orders", kn: "10 ಆದೇಶಗಳು" }, per: { en: "₹250 per order", kn: "₹250 ಪ್ರತಿ ಆದೇಶ" } },
];

const faqs = [
  {
    q: { en: "Does AI decide the case?", kn: "AI ಪ್ರಕರಣದ ತೀರ್ಮಾನ ಮಾಡುತ್ತದೆಯೇ?" },
    a: { en: "No. Aadesh AI is a drafting assistant. The human user verifies facts, records reasoning, edits the draft and remains responsible.", kn: "ಇಲ್ಲ. ಆದೇಶ AI ಕರಡು ಸಹಾಯಕ ಮಾತ್ರ. ಮಾನವ ಬಳಕೆದಾರರು facts ಪರಿಶೀಲಿಸಿ, reasoning ದಾಖಲಿಸಿ, draft ತಿದ್ದುಪಡಿ ಮಾಡಿ ಹೊಣೆಗಾರರಾಗಿರುತ್ತಾರೆ." },
  },
  {
    q: { en: "Can I edit the draft?", kn: "ನಾನು ಕರಡು ತಿದ್ದುಪಡಿ ಮಾಡಬಹುದೇ?" },
    a: { en: "Yes. The generated order is editable before download and final use.", kn: "ಹೌದು. ರಚಿಸಲಾದ ಆದೇಶವನ್ನು download ಮತ್ತು final use ಮೊದಲು ತಿದ್ದುಪಡಿ ಮಾಡಬಹುದು." },
  },
  {
    q: { en: "What if AI extracts wrong facts?", kn: "AI ತಪ್ಪು facts ತೆಗೆದರೆ ಏನು?" },
    a: { en: "Entity Lock exists for this reason. The user must verify and correct extracted facts before generation.", kn: "ಅದರಿಗಾಗಿಯೇ Entity Lock ಇದೆ. generation ಮೊದಲು ಬಳಕೆದಾರರು facts ಪರಿಶೀಲಿಸಿ ಸರಿಪಡಿಸಬೇಕು." },
  },
  {
    q: { en: "Does it support Kannada?", kn: "ಇದು ಕನ್ನಡ ಬೆಂಬಲಿಸುತ್ತದೆಯೇ?" },
    a: { en: "Yes. Aadesh AI is built for Kannada government order drafting, especially Karnataka land-record workflows.", kn: "ಹೌದು. ಆದೇಶ AI ಕನ್ನಡ ಸರ್ಕಾರಿ ಆದೇಶ ಕರಡುಗಳಿಗೆ, ವಿಶೇಷವಾಗಿ ಕರ್ನಾಟಕ ಭೂದಾಖಲೆ workflowಗಳಿಗೆ ನಿರ್ಮಿಸಲಾಗಿದೆ." },
  },
  {
    q: { en: "Do failed generations consume credits?", kn: "ವಿಫಲವಾದ generation ಗೆ credit ಕಡಿತವಾಗುತ್ತದೆಯೇ?" },
    a: { en: "No. One completed order consumes one credit. Failed generations do not consume credits.", kn: "ಇಲ್ಲ. ಒಂದು ಪೂರ್ಣಗೊಂಡ ಆದೇಶಕ್ಕೆ ಒಂದು credit ಬಳಕೆಯಾಗುತ್ತದೆ. ವಿಫಲವಾದ generation ಗೆ credit ಕಡಿತವಾಗುವುದಿಲ್ಲ." },
  },
  {
    q: { en: "Is this only for DDLR?", kn: "ಇದು DDLR ಗಾಗಿ ಮಾತ್ರವೇ?" },
    a: { en: "The current product is focused on Karnataka land-record and DDLR-style orders. It should not be treated as a generic chatbot.", kn: "ಈ ಉತ್ಪನ್ನ ಈಗ ಕರ್ನಾಟಕ ಭೂದಾಖಲೆ ಮತ್ತು DDLR-style ಆದೇಶಗಳ ಮೇಲೆ ಕೇಂದ್ರೀಕೃತವಾಗಿದೆ. ಇದನ್ನು ಸಾಮಾನ್ಯ chatbot ಎಂದು ನೋಡಬಾರದು." },
  },
];

export default function LandingPage() {
  const { locale, toggleLocale } = useLanguage();
  const [showStickyCTA, setShowStickyCTA] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowStickyCTA(window.scrollY > 560);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="aadeshPage">
      <nav className="navShell" aria-label="Main navigation">
        <Link href="/" className="brandLink" aria-label="Aadesh AI home">
          <LogoMark />
          <span><strong>ಆದೇಶ AI</strong><small>Aadesh AI</small></span>
        </Link>
        <div className="navLinks">
          <a href="#verification"><Bi en="Verification" kn="ಪರಿಶೀಲನೆ" /></a>
          <a href="#workflow"><Bi en="Workflow" kn="ಕ್ರಮ" /></a>
          <a href="#pricing"><Bi en="Pricing" kn="ಬೆಲೆ" /></a>
        </div>
        <div className="navActions">
          <button type="button" onClick={toggleLocale} className="langButton" aria-label="Toggle language">
            <Globe size={16} />
            {locale === "kn" ? "EN" : "ಕನ್ನಡ"}
          </button>
          <Link href="/auth/login" className="loginLink"><Bi en="Login" kn="ಲಾಗಿನ್" /></Link>
          <Link href="/auth/register" className="navCTA"><Bi en="Start free" kn="ಉಚಿತ ಪ್ರಾರಂಭ" /></Link>
        </div>
      </nav>

      <section className="heroSection">
        <div className="heroGrid">
          <Reveal>
            <div className="heroCopy">
              <div className="eyebrow"><Landmark size={16} /><Bi en="Karnataka-first legal drafting assistant" kn="ಕರ್ನಾಟಕ-first legal drafting assistant" /></div>
              <h1><Bi en="Draft Karnataka land-records orders in minutes." kn="ಕರ್ನಾಟಕ ಭೂದಾಖಲೆ ಆದೇಶ ಕರಡುಗಳನ್ನು ನಿಮಿಷಗಳಲ್ಲಿ ತಯಾರಿಸಿ." /></h1>
              <p className="heroSub"><Bi en="Upload a case PDF. Verify extracted facts through Entity Lock. Record officer reasoning. Generate an editable Kannada draft with an Assistance Report." kn="ಪ್ರಕರಣದ PDF ಅಪ್ಲೋಡ್ ಮಾಡಿ. Entity Lock ಮೂಲಕ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ. ಅಧಿಕಾರಿ ವಿವೇಚನೆ ದಾಖಲಿಸಿ. Assistance Report ಜೊತೆಗೆ ಕನ್ನಡ ಕರಡು ಪಡೆಯಿರಿ." /></p>
              <div className="coreLine"><Scale size={18} /><span><Bi en="AI drafts. Human verifies. Officer remains responsible." kn="AI ಕರಡು ತಯಾರಿಸುತ್ತದೆ. ಮಾನವ ಪರಿಶೀಲಿಸುತ್ತಾನೆ. ಅಧಿಕಾರಿ ಹೊಣೆಗಾರರಾಗಿರುತ್ತಾರೆ." /></span></div>
              <div className="heroActions">
                <Link href="/auth/register" className="primaryCTA"><Bi en="Start with 1 free order" kn="1 ಉಚಿತ ಆದೇಶದಿಂದ ಪ್ರಾರಂಭಿಸಿ" /><ArrowRight size={18} /></Link>
                <a href="#verification" className="secondaryCTA"><Bi en="See verification flow" kn="ಪರಿಶೀಲನೆ ಕ್ರಮ ನೋಡಿ" /></a>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="pipelineCard" aria-label="Compliance pipeline">
              <div className="pipelineTop"><span><Bi en="Compliance Pipeline" kn="Compliance Pipeline" /></span><ShieldCheck size={20} /></div>
              <div className="tricolorBar" />
              <div className="pipelineSteps">
                {pipelineSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div className="pipelineStep" key={step.en}>
                      <div className="stepNumber">{index + 1}</div>
                      <div className="stepIcon"><Icon size={18} /></div>
                      <div><strong>{locale === "kn" ? step.kn : step.en}</strong><span>{locale === "kn" ? step.noteKn : step.noteEn}</span></div>
                    </div>
                  );
                })}
              </div>
              <div className="hashStrip"><Fingerprint size={16} /><span>manifest: 9f3a...verified</span></div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="comparisonSection">
        <Reveal><div className="sectionHeader"><p><Bi en="Before vs After" kn="ಮೊದಲು ಮತ್ತು ನಂತರ" /></p><h2><Bi en="Before Aadesh, one order means hours of work." kn="ಆದೇಶ AI ಮೊದಲು, ಒಂದು ಆದೇಶಕ್ಕೆ ಗಂಟೆಗಳ ಕೆಲಸ ಬೇಕಾಗುತ್ತದೆ." /></h2></div></Reveal>
        <div className="compareGrid">
          <Reveal><div className="compareCard today"><h3><Bi en="Today" kn="ಈಗ" /></h3>{todayRows.map((item) => <div className="compareRow" key={item.en}><span className="minus">-</span>{text(item, locale)}</div>)}</div></Reveal>
          <Reveal delay={120}><div className="compareCard aadesh"><h3><Bi en="With Aadesh AI" kn="ಆದೇಶ AI ಜೊತೆ" /></h3>{aadeshRows.map((item) => <div className="compareRow" key={item.en}><span className="plus"><Check size={14} /></span>{text(item, locale)}</div>)}</div></Reveal>
        </div>
      </section>

      <section className="assistantSection" id="verification">
        <div className="assistantGrid">
          <Reveal><div><p className="sectionKicker"><Bi en="RAI-safe positioning" kn="RAI-safe positioning" /></p><h2><Bi en="AI assistant, not autonomous authority." kn="AI ಸಹಾಯಕ, ಸ್ವತಂತ್ರ ಅಧಿಕಾರವಲ್ಲ." /></h2><p><Bi en="The product is designed for human-in-the-loop drafting. It supports the caseworker and officer; it does not replace legal responsibility." kn="ಈ ಉತ್ಪನ್ನ human-in-the-loop ಕರಡುಗಾಗಿ ವಿನ್ಯಾಸಗೊಂಡಿದೆ. ಇದು caseworker ಮತ್ತು officer ಗೆ ಸಹಾಯ ಮಾಡುತ್ತದೆ; ಕಾನೂನು ಹೊಣೆಗಾರಿಕೆಯನ್ನು ಬದಲಿಸುವುದಿಲ್ಲ." /></p></div></Reveal>
          <Reveal delay={120}><div className="assistantList">{assistantBullets.map((item) => <div key={item.en}><ShieldCheck size={18} /><span>{text(item, locale)}</span></div>)}</div></Reveal>
        </div>
      </section>

      <section className="workflowSection" id="workflow">
        <Reveal><div className="sectionHeader"><p><Bi en="Drafting workflow" kn="ಕರಡು ಕ್ರಮ" /></p><h2><Bi en="A clear human verification path before every draft." kn="ಪ್ರತಿ ಕರಡು ಮೊದಲು ಸ್ಪಷ್ಟ ಮಾನವ ಪರಿಶೀಲನೆ ಕ್ರಮ." /></h2></div></Reveal>
        <div className="workflowRail">
          {workflowSteps.map((step, index) => {
            const Icon = step.icon;
            return <Reveal key={step.en} delay={index * 80}><div className="workflowStep"><span>{index + 1}</span><Icon size={24} /><strong>{locale === "kn" ? step.kn : step.en}</strong></div></Reveal>;
          })}
        </div>
      </section>

      <section className="proofSection">
        <Reveal><div className="sectionHeader light"><p><Bi en="Compliance proof" kn="Compliance proof" /></p><h2><Bi en="Evidence trail built into the drafting flow." kn="ಕರಡು flow ಒಳಗೆ evidence trail." /></h2></div></Reveal>
        <div className="proofGrid">
          {proofCards.map((card, index) => {
            const Icon = card.icon;
            return <Reveal key={card.title.en} delay={index * 80}><div className="proofCard"><Icon size={24} /><h3>{text(card.title, locale)}</h3><p>{text(card.body, locale)}</p></div></Reveal>;
          })}
        </div>
      </section>

      <section className="quoteSection">
        <Reveal><div className="quoteCard"><div className="quoteSeal"><LogoMark /></div><blockquote><Bi en="Draft quality was very close. Only small corrections were needed." kn="ಕರಡು ಗುಣಮಟ್ಟ ತುಂಬಾ ಹತ್ತಿರವಾಗಿತ್ತು. ಸಣ್ಣ ತಿದ್ದುಪಡಿ ಮಾತ್ರ ಬೇಕಾಯಿತು." /></blockquote><cite><Bi en="DDLR caseworker, Bengaluru South pilot" kn="DDLR caseworker, Bengaluru South pilot" /></cite></div></Reveal>
      </section>

      <section className="pricingSection" id="pricing">
        <Reveal><div className="sectionHeader"><p><Bi en="Pilot pricing" kn="ಪೈಲಟ್ ಬೆಲೆ" /></p><h2><Bi en="Start small. Pay per completed order." kn="ಸಣ್ಣದಾಗಿ ಪ್ರಾರಂಭಿಸಿ. ಪೂರ್ಣಗೊಂಡ ಆದೇಶಕ್ಕೆ ಮಾತ್ರ ಪಾವತಿ." /></h2><span className="pricingSub"><Bi en="Human drafters usually cost ₹1,000-₹2,000 per order. Aadesh pilot packs reduce the effective cost to ₹250-₹333 per order." kn="ಮಾನವ ಕರಡುಗಾರರಿಗೆ ಸಾಮಾನ್ಯವಾಗಿ ಪ್ರತಿ ಆದೇಶಕ್ಕೆ ₹1,000-₹2,000 ವೆಚ್ಚವಾಗುತ್ತದೆ. ಆದೇಶ AI ಪೈಲಟ್ ಪ್ಯಾಕ್‌ಗಳು ಪರಿಣಾಮಕಾರಿ ವೆಚ್ಚವನ್ನು ಪ್ರತಿ ಆದೇಶಕ್ಕೆ ₹250-₹333 ಕ್ಕೆ ಕಡಿಮೆ ಮಾಡುತ್ತವೆ." /></span></div></Reveal>
        <div className="pricingGrid">
          {pricing.map((plan, index) => <Reveal key={plan.name.en} delay={index * 70}><div className={plan.featured ? "priceCard featured" : "priceCard"}>{plan.featured && <div className="popular"><Bi en="Pilot value" kn="ಪೈಲಟ್ ಮೌಲ್ಯ" /></div>}<h3>{text(plan.name, locale)}</h3><strong>{text(plan.price, locale)}</strong><span>{text(plan.meta, locale)}</span><p>{text(plan.per, locale)}</p><Link href="/auth/register"><Bi en="Start" kn="ಪ್ರಾರಂಭಿಸಿ" /><ArrowRight size={16} /></Link></div></Reveal>)}
        </div>
        <p className="pricingNote"><Bi en="One completed order consumes one credit. Failed generations do not consume credits." kn="ಒಂದು ಪೂರ್ಣಗೊಂಡ ಆದೇಶಕ್ಕೆ ಒಂದು ಕ್ರೆಡಿಟ್ ಬಳಕೆಯಾಗುತ್ತದೆ. ವಿಫಲವಾದ generation ಗೆ ಕ್ರೆಡಿಟ್ ಕಡಿತವಾಗುವುದಿಲ್ಲ." /></p>
      </section>

      <section className="faqSection">
        <Reveal><div className="sectionHeader"><p><Bi en="FAQ" kn="ಪ್ರಶ್ನೆಗಳು" /></p><h2><Bi en="Clear answers for caseworkers and officers." kn="caseworker ಮತ್ತು officer ಗಳಿಗೆ ಸ್ಪಷ್ಟ ಉತ್ತರಗಳು." /></h2></div></Reveal>
        <div className="faqGrid">{faqs.map((faq) => <FAQItem key={faq.q.en} q={faq.q} a={faq.a} />)}</div>
      </section>

      <section className="finalCTA">
        <Reveal><div><p><Bi en="Ready for a controlled pilot?" kn="ನಿಯಂತ್ರಿತ pilot ಗೆ ಸಿದ್ಧವೇ?" /></p><h2><Bi en="Generate your first verified Kannada draft." kn="ನಿಮ್ಮ ಮೊದಲ ಪರಿಶೀಲಿತ ಕನ್ನಡ ಕರಡು ರಚಿಸಿ." /></h2><Link href="/auth/register" className="primaryCTA"><Bi en="Start with 1 free order" kn="1 ಉಚಿತ ಆದೇಶದಿಂದ ಪ್ರಾರಂಭಿಸಿ" /><ArrowRight size={18} /></Link></div></Reveal>
      </section>

      <footer className="footer">
        <div className="footerGrid">
          <div><div className="footerBrand"><LogoMark /><span><strong>ಆದೇಶ AI</strong><small>Aadesh AI</small></span></div><p><Bi en="Karnataka-first, human-in-the-loop Kannada government order drafting assistant." kn="ಕರ್ನಾಟಕ-first, human-in-the-loop ಕನ್ನಡ ಸರ್ಕಾರಿ ಆದೇಶ ಕರಡು ಸಹಾಯಕ." /></p></div>
          <div><h4><Bi en="Product" kn="ಉತ್ಪನ್ನ" /></h4><a href="#workflow"><Bi en="Workflow" kn="ಕ್ರಮ" /></a><a href="#pricing"><Bi en="Pricing" kn="ಬೆಲೆ" /></a><Link href="/auth/register"><Bi en="Start free" kn="ಉಚಿತ ಪ್ರಾರಂಭ" /></Link></div>
          <div><h4><Bi en="Legal" kn="ಕಾನೂನು" /></h4><Link href="/legal/privacy-policy"><Bi en="Privacy Policy" kn="ಗೌಪ್ಯತಾ ನೀತಿ" /></Link><Link href="/legal/terms-of-service"><Bi en="Terms" kn="ನಿಯಮಗಳು" /></Link></div>
          <div><h4><Bi en="Contact" kn="ಸಂಪರ್ಕ" /></h4><span>support@aadesh-ai.in</span><span><Bi en="Bengaluru, Karnataka" kn="ಬೆಂಗಳೂರು, ಕರ್ನಾಟಕ" /></span></div>
        </div>
        <div className="footerBottom"><span>© 2026 ಆದೇಶ AI</span><strong>Made in Karnataka</strong></div>
      </footer>

      <div className={showStickyCTA ? "mobileSticky show" : "mobileSticky"}><Link href="/auth/register"><Bi en="Start with 1 free order" kn="1 ಉಚಿತ ಆದೇಶದಿಂದ ಪ್ರಾರಂಭಿಸಿ" /><ArrowRight size={17} /></Link></div>

      <style>{`
        .aadeshPage{min-height:100vh;background:${C.cream};color:${C.charcoal};font-family:Inter,"Noto Sans Kannada","Noto Sans",system-ui,sans-serif;letter-spacing:0}
        .navShell{position:sticky;top:0;z-index:50;display:flex;align-items:center;justify-content:space-between;gap:18px;max-width:1180px;margin:0 auto;padding:14px 24px;background:rgba(255,247,240,.92);border-bottom:1px solid ${C.borderWarm};backdrop-filter:blur(16px)}
        .brandLink,.footerBrand{display:inline-flex;align-items:center;gap:10px;color:${C.navy};text-decoration:none}.brandLink span,.footerBrand span{display:grid;gap:1px}.brandLink strong,.footerBrand strong{font-size:17px;line-height:1}.brandLink small,.footerBrand small{color:${C.midGray};font-size:11px}.logoMark{width:38px;height:38px;display:grid;place-items:center;border-radius:10px;background:linear-gradient(135deg,${C.saffron},${C.gold});color:#fff;font-weight:800;font-size:18px;box-shadow:0 8px 24px rgba(233,123,59,.24)}
        .navLinks,.navActions{display:flex;align-items:center;gap:16px}.navLinks a,.loginLink{color:${C.charcoal};text-decoration:none;font-size:14px;font-weight:650}.langButton{display:inline-flex;align-items:center;gap:6px;border:1px solid ${C.borderWarm};background:${C.warmWhite};color:${C.navy};border-radius:999px;padding:8px 13px;font-weight:800;cursor:pointer}
        .navCTA,.primaryCTA{display:inline-flex;align-items:center;justify-content:center;gap:8px;color:#fff;background:linear-gradient(135deg,${C.saffron},${C.saffronDark});text-decoration:none;border-radius:12px;font-weight:800;box-shadow:0 12px 28px rgba(233,123,59,.28)}.navCTA{padding:10px 16px;font-size:14px}
        .heroSection{position:relative;overflow:hidden;background:radial-gradient(circle at 18% 12%,rgba(249,168,37,.18),transparent 30%),linear-gradient(135deg,${C.cream} 0%,${C.peach} 56%,#fff8ef 100%)}.heroSection:before{content:"";position:absolute;inset:0 0 auto;height:7px;background:linear-gradient(90deg,${C.saffron},white,${C.green})}.heroGrid{position:relative;display:grid;grid-template-columns:minmax(0,1.06fr) minmax(360px,.94fr);align-items:center;gap:56px;max-width:1180px;margin:0 auto;padding:86px 24px 72px}
        .eyebrow,.coreLine,.pipelineTop,.hashStrip{display:inline-flex;align-items:center;gap:8px;border-radius:999px;font-weight:800}.eyebrow{color:${C.saffronDark};background:rgba(233,123,59,.1);border:1px solid rgba(233,123,59,.24);padding:8px 13px;font-size:13px}.heroCopy h1{max-width:760px;margin:22px 0 18px;color:${C.navyDark};font-family:"Noto Serif Kannada",Georgia,serif;font-size:clamp(40px,5.8vw,72px);line-height:1.02;letter-spacing:0}.heroSub{max-width:680px;margin:0;color:#475467;font-size:clamp(16px,2vw,20px);line-height:1.75}.coreLine{margin-top:24px;color:${C.navy};background:rgba(255,252,250,.82);border:1px solid ${C.borderWarm};padding:10px 14px;font-size:14px}.heroActions{display:flex;flex-wrap:wrap;gap:14px;margin-top:30px}.primaryCTA{min-height:52px;padding:15px 22px;font-size:16px}.secondaryCTA{display:inline-flex;align-items:center;justify-content:center;min-height:52px;padding:14px 20px;border:1px solid ${C.borderWarm};border-radius:12px;background:rgba(255,252,250,.8);color:${C.navy};text-decoration:none;font-weight:800}
        .pipelineCard{position:relative;border:1px solid rgba(233,123,59,.2);border-radius:24px;padding:24px;background:rgba(255,252,250,.92);box-shadow:0 28px 70px rgba(88,41,12,.13);animation:pipelineFloat 6s ease-in-out infinite}.pipelineTop{width:100%;justify-content:space-between;color:${C.navy};font-size:14px}.tricolorBar{height:6px;margin:18px 0 20px;border-radius:999px;background:linear-gradient(90deg,${C.saffron},white,${C.green});border:1px solid rgba(0,0,0,.04)}.pipelineSteps{display:grid;gap:12px}.pipelineStep{display:grid;grid-template-columns:28px 40px 1fr;align-items:center;gap:12px;padding:13px;border:1px solid ${C.borderWarm};border-radius:14px;background:white;transition:transform .22s ease,box-shadow .22s ease}.pipelineStep:hover,.proofCard:hover,.priceCard:hover{transform:translateY(-3px);box-shadow:0 16px 34px rgba(23,33,95,.1)}.stepNumber{width:28px;height:28px;display:grid;place-items:center;border-radius:999px;background:${C.cream};color:${C.saffronDark};font-size:12px;font-weight:900}.stepIcon{width:40px;height:40px;display:grid;place-items:center;border-radius:12px;background:linear-gradient(135deg,${C.saffron},${C.gold});color:white}.pipelineStep strong,.pipelineStep span{display:block}.pipelineStep strong{color:${C.navyDark};font-size:14px}.pipelineStep span{color:${C.midGray};margin-top:2px;font-size:12px}.hashStrip{margin-top:18px;width:100%;justify-content:center;color:${C.green};background:rgba(19,136,8,.08);border:1px solid rgba(19,136,8,.2);padding:10px;font-size:12px}
        section{scroll-margin-top:86px}.comparisonSection,.workflowSection,.pricingSection,.faqSection{max-width:1180px;margin:0 auto;padding:76px 24px}.sectionHeader{max-width:780px;margin:0 auto 36px;text-align:center}.sectionHeader p,.sectionKicker,.finalCTA p{margin:0 0 10px;color:${C.saffronDark};font-size:12px;font-weight:900;letter-spacing:0;text-transform:uppercase}.sectionHeader h2,.assistantSection h2,.finalCTA h2{margin:0;color:${C.navyDark};font-family:"Noto Serif Kannada",Georgia,serif;font-size:clamp(28px,3.7vw,46px);line-height:1.16;letter-spacing:0}
        .compareGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px}.compareCard{border-radius:22px;padding:26px;border:1px solid ${C.borderWarm};background:${C.warmWhite};box-shadow:0 12px 36px rgba(23,33,95,.06)}.compareCard.today{background:#fff5ef}.compareCard.aadesh{border-color:rgba(19,136,8,.18);background:#f7fff5}.compareCard h3{margin:0 0 18px;color:${C.navy};font-size:22px}.compareRow{display:flex;align-items:flex-start;gap:10px;padding:12px 0;border-top:1px solid rgba(0,0,0,.06);color:#344054;line-height:1.55}.minus,.plus{width:22px;height:22px;flex:0 0 22px;display:grid;place-items:center;border-radius:999px;font-weight:900}.minus{background:rgba(191,54,12,.1);color:${C.saffronDark}}.plus{background:rgba(19,136,8,.12);color:${C.green}}
        .assistantSection{background:linear-gradient(135deg,${C.navy},${C.navyDark});color:white;padding:82px 24px}.assistantGrid{display:grid;grid-template-columns:minmax(0,.92fr) minmax(320px,1.08fr);align-items:center;gap:42px;max-width:1120px;margin:0 auto}.assistantSection h2{color:white}.assistantSection p:not(.sectionKicker){max-width:620px;color:rgba(255,255,255,.75);font-size:17px;line-height:1.75}.assistantList{display:grid;gap:12px}.assistantList div{display:flex;gap:12px;align-items:flex-start;padding:16px;border:1px solid rgba(255,255,255,.13);border-radius:16px;background:rgba(255,255,255,.07);color:rgba(255,255,255,.9);line-height:1.55}.assistantList svg{color:${C.gold};flex:0 0 auto;margin-top:2px}
        .workflowRail{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:14px}.workflowStep{min-height:172px;display:flex;flex-direction:column;justify-content:space-between;border:1px solid ${C.borderWarm};border-radius:18px;padding:18px;background:white}.workflowStep span{width:34px;height:34px;display:grid;place-items:center;border-radius:999px;background:${C.cream};color:${C.saffronDark};font-weight:900}.workflowStep svg{color:${C.saffron}}.workflowStep strong{color:${C.navy};line-height:1.35}
        .proofSection{padding:78px 24px;background:${C.navy}}.sectionHeader.light h2{color:white}.sectionHeader.light p{color:${C.gold}}.proofGrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;max-width:1120px;margin:0 auto}.proofCard{min-height:204px;padding:22px;border-radius:18px;border:1px solid rgba(255,255,255,.13);background:rgba(255,255,255,.08);color:white;transition:transform .22s ease,box-shadow .22s ease}.proofCard svg{color:${C.gold}}.proofCard h3{margin:18px 0 8px;font-size:18px}.proofCard p{margin:0;color:rgba(255,255,255,.76);font-size:14px;line-height:1.65}
        .quoteSection{padding:74px 24px;background:${C.peach}}.quoteCard{max-width:880px;margin:0 auto;padding:42px;text-align:center;border-radius:24px;background:${C.warmWhite};border:1px solid ${C.borderWarm};box-shadow:0 18px 44px rgba(88,41,12,.08)}.quoteSeal{display:flex;justify-content:center;margin-bottom:18px}blockquote{margin:0 auto;max-width:760px;color:${C.navyDark};font-family:"Noto Serif Kannada",Georgia,serif;font-size:clamp(24px,3vw,38px);line-height:1.3}cite{display:block;margin-top:18px;color:${C.midGray};font-style:normal;font-weight:700}
        .pricingSub{display:block;max-width:760px;margin:16px auto 0;color:${C.midGray};font-size:16px;line-height:1.75}.pricingGrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}.priceCard{position:relative;display:flex;flex-direction:column;min-height:292px;padding:24px;border-radius:20px;border:1px solid ${C.borderWarm};background:${C.warmWhite};box-shadow:0 10px 30px rgba(23,33,95,.06);transition:transform .22s ease,box-shadow .22s ease}.priceCard.featured{border:2px solid ${C.saffron}}.popular{position:absolute;top:-12px;left:24px;padding:5px 12px;border-radius:999px;color:white;background:${C.saffron};font-size:11px;font-weight:900}.priceCard h3{margin:8px 0 18px;color:${C.navy};font-size:20px}.priceCard strong{color:${C.saffronDark};font-size:36px;line-height:1}.priceCard span{margin-top:10px;color:${C.charcoal};font-weight:800}.priceCard p{margin:10px 0 22px;color:${C.midGray}}.priceCard a{display:inline-flex;align-items:center;justify-content:center;gap:8px;margin-top:auto;min-height:44px;border-radius:12px;color:${C.saffronDark};border:1px solid ${C.saffron};text-decoration:none;font-weight:900}.priceCard.featured a{color:white;background:${C.saffron}}.pricingNote{max-width:740px;margin:24px auto 0;padding:14px 18px;border:1px solid ${C.borderWarm};border-radius:14px;background:${C.warmWhite};color:${C.navy};text-align:center;font-weight:800;line-height:1.55}
        .faqGrid{display:grid;gap:12px;max-width:860px;margin:0 auto}.faqItem{overflow:hidden;border:1px solid ${C.borderWarm};border-radius:16px;background:white}.faqButton{width:100%;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px 20px;border:0;background:transparent;color:${C.navy};text-align:left;font-weight:900;cursor:pointer}.faqChevron{flex:0 0 auto;transition:transform .18s ease}.faqChevron.open{transform:rotate(180deg)}.faqAnswer{margin:0;padding:0 20px 18px;color:${C.midGray};line-height:1.7}
        .finalCTA{padding:78px 24px;text-align:center;background:radial-gradient(circle at 50% 0%,rgba(249,168,37,.18),transparent 34%),linear-gradient(135deg,${C.peach},${C.cream})}.finalCTA h2{max-width:720px;margin:0 auto 26px}
        .footer{padding:56px 24px 36px;color:white;background:linear-gradient(180deg,${C.navy},${C.navyDark})}.footerGrid{display:grid;grid-template-columns:1.35fr repeat(3,minmax(150px,1fr));gap:30px;max-width:1120px;margin:0 auto}.footerBrand{color:white}.footer p{max-width:360px;color:rgba(255,255,255,.72);line-height:1.7}.footer h4{margin:0 0 14px;color:${C.gold};font-size:12px;text-transform:uppercase}.footer a,.footer span{display:block;margin:9px 0;color:rgba(255,255,255,.82);text-decoration:none;font-size:14px}.footerBottom{display:flex;align-items:center;justify-content:space-between;gap:14px;max-width:1120px;margin:34px auto 0;padding-top:22px;border-top:1px solid rgba(255,255,255,.14);color:rgba(255,255,255,.75);font-size:13px}.footerBottom strong{color:white;background:linear-gradient(135deg,${C.saffron},${C.gold});border-radius:999px;padding:7px 13px}
        .mobileSticky{display:none}.aadesh-reveal{opacity:1;transform:translateY(0);transition:opacity .6s ease,transform .6s ease}@keyframes pipelineFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @media (prefers-reduced-motion:reduce){.pipelineCard{animation:none}*{scroll-behavior:auto!important}}
        @media (max-width:980px){.navLinks{display:none}.heroGrid,.assistantGrid,.compareGrid{grid-template-columns:1fr}.heroGrid{gap:38px;padding-top:58px}.workflowRail,.proofGrid,.pricingGrid{grid-template-columns:repeat(2,minmax(0,1fr))}.footerGrid{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media (max-width:640px){.navShell{padding:10px 14px}.brandLink small,.loginLink,.navCTA{display:none}.langButton{padding:8px 10px}.heroGrid{padding:42px 18px 48px}.heroCopy h1{font-size:clamp(34px,11vw,46px)}.heroSub{font-size:15px}.coreLine{align-items:flex-start;border-radius:14px}.heroActions{display:grid}.primaryCTA,.secondaryCTA{width:100%}.pipelineCard{padding:16px;border-radius:18px}.pipelineStep{grid-template-columns:26px 36px 1fr;padding:10px}.stepIcon{width:36px;height:36px}.comparisonSection,.workflowSection,.pricingSection,.faqSection{padding:56px 18px}.assistantSection,.proofSection,.quoteSection,.finalCTA{padding:58px 18px}.workflowRail,.proofGrid,.pricingGrid,.footerGrid{grid-template-columns:1fr}.workflowStep{min-height:132px}.quoteCard{padding:28px 20px}.footerBottom{align-items:flex-start;flex-direction:column}.mobileSticky{position:fixed;left:0;right:0;bottom:0;z-index:60;display:block;padding:12px 16px max(12px,env(safe-area-inset-bottom));background:rgba(255,247,240,.96);border-top:1px solid ${C.borderWarm};box-shadow:0 -10px 24px rgba(23,33,95,.12);transform:translateY(105%);transition:transform .26s ease}.mobileSticky.show{transform:translateY(0)}.mobileSticky a{display:flex;min-height:48px;align-items:center;justify-content:center;gap:8px;border-radius:12px;color:white;background:linear-gradient(135deg,${C.saffron},${C.saffronDark});text-decoration:none;font-weight:900}}
      `}</style>
    </main>
  );
}
