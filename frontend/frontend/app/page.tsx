"use client";

import { useMemo, useState } from "react";

const API_BASE = "http://localhost:8000";

const DATING_INTENTS = [
  "Something meaningful, open to long-term",
  "Going on dates and seeing where it goes",
  "Short-term or more casual right now",
  "Figuring it out, open to surprises",
];

const LOVE_LANGUAGES = [
  "Words of affirmation",
  "Quality time",
  "Physical touch",
  "Acts of service",
  "Giving or receiving gifts",
];

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export default function Home() {
  const [datingIntent, setDatingIntent] = useState(DATING_INTENTS[0]);
  const [gesture, setGesture] = useState("");
  const [passion, setPassion] = useState("");
  const [threeWords, setThreeWords] = useState("");
  const [loveLanguage, setLoveLanguage] = useState(LOVE_LANGUAGES[0]);

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return (
      gesture.trim().length > 0 &&
      passion.trim().length > 0 &&
      threeWords.trim().length > 0
    );
  }, [gesture, passion, threeWords]);

  async function submit() {
    setError(null);

    if (!canSubmit) {
      setError("Please fill in all fields before submitting.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/profiles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dating_intent: datingIntent,
          gesture: gesture.trim(),
          passion: passion.trim(),
          three_words: threeWords.trim(),
          love_language: loveLanguage,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to submit profile.");
      }

      setSubmitted(true);
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  const scrollToForm = () => {
    const el = document.getElementById("profile-form");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="bg-[#070707] text-[#EDEDED] min-h-screen">
      {/* HERO / LANDING (bigger, scroll-down) */}
      <section className="relative">
        <div className="max-w-[1200px] mx-auto px-6 pt-16 sm:pt-20">
          {/* make the landing feel like a full page */}
          <div className="min-h-[92vh] flex flex-col">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Left hero */}
              <div className="lg:col-span-7">
                <div className="font-mono text-[12px] tracking-[0.18em] text-[#BDBDBD]">
                  ENGINEERED FOR SIGNAL
                </div>

                <h1 className="mt-6 font-sans font-semibold tracking-tight leading-[0.92] text-[64px] sm:text-[88px] md:text-[112px]">
                  Datemate
                </h1>

                <p className="mt-6 max-w-[46ch] text-[#BDBDBD] text-[16px] sm:text-[17px] leading-relaxed">
                  A minimal profile signal, distilled into semantics — then organized for
                  fast, high-quality recommendations.
                </p>

                <div className="mt-10 flex items-center gap-3">
                  <button
                    onClick={scrollToForm}
                    className="group relative inline-flex items-center justify-center px-7 py-3.5 border border-[#EDEDED] text-[#EDEDED] bg-transparent hover:bg-[#EDEDED] hover:text-[#070707] transition"
                  >
                    <span className="font-mono text-[12px] tracking-[0.18em]">
                      BUILD YOUR PROFILE
                    </span>
                  </button>

                  <div className="font-mono text-[12px] text-[#8E8E8E] tracking-[0.16em]">
                    v0.1
                  </div>
                </div>
              </div>

              {/* Right rail */}
              <div className="lg:col-span-5">
                <div className="lg:pt-9">
                  <p className="font-mono text-[13px] text-[#BDBDBD] leading-relaxed">
                    Co-engineer your dating signal with a system designed to capture
                    meaning, not keywords.
                  </p>

                  {submitted && (
                    <div className="mt-8 border border-[#2A2A2A] bg-[#0C0C0C] p-5">
                      <div className="font-mono text-[12px] tracking-[0.16em] text-[#BDBDBD]">
                        SUBMISSION RECEIVED
                      </div>
                      <div className="mt-2 text-[18px] leading-snug">
                        You’re in. We’ll reach out soon with your matches.
                      </div>
                      <div className="mt-3 text-[#BDBDBD] text-[14px] leading-relaxed">
                        For now, you can close this tab — your profile is saved.
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="mt-6 border border-[#4A1E1E] bg-[#120909] p-4 text-[#FFD7D7]">
                      <div className="font-mono text-[12px] tracking-[0.14em]">
                        ERROR
                      </div>
                      <div className="mt-1 text-[14px] leading-relaxed">{error}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Push scroll cue to bottom of hero */}
            <div className="mt-auto pt-16 pb-10">
              <div className="h-px bg-[#1A1A1A]" />
              <div className="mt-6 flex items-center justify-between">
                <div className="font-mono text-[12px] tracking-[0.16em] text-[#8E8E8E]">
                  SCROLL
                </div>

                <button
                  onClick={scrollToForm}
                  className="group flex items-center gap-3 text-[#BDBDBD] hover:text-[#EDEDED] transition"
                >
                  <span className="font-mono text-[12px] tracking-[0.16em]">
                    PROFILE INTAKE
                  </span>
                  <span className="inline-block translate-y-[1px] group-hover:translate-y-[3px] transition-transform">
                    ↓
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* subtle vignette */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#070707]" />
      </section>

      {/* PURPOSE + FEATURES */}
      <section className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="h-px bg-[#1A1A1A]" />
        <div className="mt-12 font-sans font-semibold tracking-tight leading-[0.95] text-[34px] sm:text-[40px] md:text-[52px]">
          Our Purpose
        </div>

        <p className="mt-4 max-w-[68ch] text-[#BDBDBD] text-[15px] sm:text-[16px] leading-relaxed">
          Dating is noisy. We reduce it to signal — and use semantics to connect people
          who actually resonate.
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-10">
          <Feature
            num="01/"
            title="No-compromise signal"
            body="Compact prompts that capture intent, energy, and style — without needing a full bio."
          />
          <Feature
            num="02/"
            title="Semantic understanding"
            body="Embeddings translate answers into meaning-space so similar vibes naturally align."
          />
          <Feature
            num="03/"
            title="Mission-critical delivery"
            body="Profiles are stored durably. Matching runs asynchronously so the UX stays clean."
          />
        </div>
      </section>

      {/* FORM */}
      <section
        id="profile-form"
        className="max-w-[1200px] mx-auto px-6 pb-20 pt-6"
      >
        <div className="h-px bg-[#1A1A1A] mb-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <div className="sticky top-6">
              <div className="font-mono text-[12px] tracking-[0.16em] text-[#BDBDBD]">
                PROFILE INTAKE
              </div>
              <h2 className="mt-3 text-[30px] sm:text-[34px] leading-tight">
                Answer five questions.
                <br />
                We’ll handle the rest.
              </h2>
              <p className="mt-4 text-[#BDBDBD] text-[14px] leading-relaxed max-w-[46ch]">
                You won’t see matches immediately. We’ll compute embeddings, group
                similar profiles, and send your best candidates shortly.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="border border-[#1F1F1F] bg-[#0A0A0A] p-6 sm:p-8">
              {/* Q1 */}
              <Label>1) What are you looking for right now?</Label>
              <Select
                value={datingIntent}
                onChange={setDatingIntent}
                options={DATING_INTENTS}
              />

              {/* Q2 */}
              <div className="mt-6">
                <Label>2) One small gesture from a partner that would make your day</Label>
                <Input
                  value={gesture}
                  onChange={setGesture}
                  placeholder="1 sentence max"
                />
              </div>

              {/* Q3 */}
              <div className="mt-6">
                <Label>3) Something you’re passionate about</Label>
                <Input
                  value={passion}
                  onChange={setPassion}
                  placeholder="1–2 lines"
                />
              </div>

              {/* Q4 */}
              <div className="mt-6">
                <Label>4) Best friend describes you in three words</Label>
                <Input
                  value={threeWords}
                  onChange={setThreeWords}
                  placeholder="e.g., thoughtful, ambitious, chill"
                />
                <div className="mt-2 font-mono text-[12px] text-[#8E8E8E]">
                  Tip: comma-separated looks clean.
                </div>
              </div>

              {/* Q5 */}
              <div className="mt-6">
                <Label>5) Love language</Label>
                <Select
                  value={loveLanguage}
                  onChange={setLoveLanguage}
                  options={LOVE_LANGUAGES}
                />
              </div>

              <div className="mt-8 flex items-center justify-between gap-4">
                <div className="font-mono text-[12px] tracking-[0.16em] text-[#8E8E8E]">
                  {submitted ? "STATUS: SAVED" : "STATUS: DRAFT"}
                </div>

                <button
                  disabled={loading || submitted}
                  onClick={submit}
                  className={cx(
                    "relative inline-flex items-center justify-center px-6 py-3 border transition",
                    "font-mono text-[12px] tracking-[0.18em]",
                    submitted
                      ? "border-[#2A2A2A] text-[#6E6E6E] cursor-not-allowed"
                      : "border-[#EDEDED] text-[#EDEDED] hover:bg-[#EDEDED] hover:text-[#070707]",
                    loading && !submitted && "opacity-70"
                  )}
                >
                  {submitted ? "SUBMITTED" : loading ? "SUBMITTING..." : "SUBMIT PROFILE"}
                </button>
              </div>

              {!submitted && (
                <div className="mt-4 text-[#8E8E8E] text-[13px] leading-relaxed">
                  By submitting, you agree we can use your answers to generate matches.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className="max-w-[1200px] mx-auto px-6 pb-10 text-[#8E8E8E]">
        <div className="h-px bg-[#1A1A1A] mb-6" />
        <div className="font-mono text-[12px] tracking-[0.14em]">
          DATEMATE • LOCAL DEV • {new Date().getFullYear()}
        </div>
      </footer>
    </main>
  );
}

function Feature({ num, title, body }: { num: string; title: string; body: string }) {
  return (
    <div>
      <div className="font-mono text-[14px] text-[#BDBDBD] tracking-[0.12em]">
        {num}
      </div>
      <div className="mt-4 text-[24px] leading-snug">{title}</div>
      <div className="mt-3 text-[#BDBDBD] text-[14px] leading-relaxed max-w-[52ch]">
        {body}
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block font-sans text-[14px] text-[#EDEDED] mb-2">
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-[#070707] border border-[#1F1F1F] px-4 py-3 text-[#EDEDED] placeholder:text-[#5F5F5F] outline-none focus:border-[#EDEDED] transition"
    />
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-[#070707] border border-[#1F1F1F] px-4 py-3 text-[#EDEDED] outline-none focus:border-[#EDEDED] transition"
    >
      {options.map((x) => (
        <option key={x} value={x} className="bg-[#070707]">
          {x}
        </option>
      ))}
    </select>
  );
}
