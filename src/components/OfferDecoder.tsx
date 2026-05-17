"use client";

import { useState } from "react";
import { calculateOffer, formatCurrency, type OfferInputs, type OfferResults } from "@/lib/calculations";

const defaultOffer = (company: string): OfferInputs => ({
  company, baseSalary: 90000, signingBonus: 0, annualEquity: 0,
  healthInsuranceCost: 2400, ptoDays: 15, remoteDaysPerWeek: 0, hoursPerWeek: 40,
});

const fields: { label: string; key: keyof Omit<OfferInputs, "company">; step?: number; max?: number }[] = [
  { label: "Base Salary ($)", key: "baseSalary", step: 1000 },
  { label: "Signing Bonus ($)", key: "signingBonus", step: 500 },
  { label: "Annual Equity / RSUs ($)", key: "annualEquity", step: 1000 },
  { label: "Health Insurance / Year ($)", key: "healthInsuranceCost", step: 100 },
  { label: "PTO Days", key: "ptoDays", max: 365 },
  { label: "Remote Days / Week", key: "remoteDaysPerWeek", max: 5 },
];

interface DecodedOffer { inputs: OfferInputs; results: OfferResults; }

function StatRow({ label, a, b, higherIsBetter = true }: { label: string; a: number; b: number; higherIsBetter?: boolean }) {
  const aWins = higherIsBetter ? a >= b : a <= b;
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 py-2 border-b border-zinc-800/60 last:border-0">
      <div className={`text-sm font-semibold text-right ${aWins ? "text-white" : "text-zinc-500"}`}>
        {formatCurrency(a)}
        {aWins && a !== b && <span className="ml-1 text-emerald-400 text-xs">✓</span>}
      </div>
      <div className="text-xs text-zinc-600 text-center whitespace-nowrap px-2">{label}</div>
      <div className={`text-sm font-semibold text-left ${!aWins ? "text-white" : "text-zinc-500"}`}>
        {formatCurrency(b)}
        {!aWins && a !== b && <span className="ml-1 text-emerald-400 text-xs">✓</span>}
      </div>
    </div>
  );
}

export default function OfferDecoder() {
  const [offerA, setOfferA] = useState<OfferInputs>(defaultOffer("Offer A"));
  const [offerB, setOfferB] = useState<OfferInputs>(defaultOffer("Offer B"));
  const [decoded, setDecoded] = useState<[DecodedOffer, DecodedOffer] | null>(null);
  const [aiVerdict, setAiVerdict] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  function update(which: "A" | "B", key: keyof OfferInputs, value: string) {
    const setter = which === "A" ? setOfferA : setOfferB;
    setter(p => ({ ...p, [key]: key === "company" ? value : parseFloat(value) || 0 }));
  }

  async function handleDecode() {
    const rA = calculateOffer(offerA);
    const rB = calculateOffer(offerB);
    setDecoded([{ inputs: offerA, results: rA }, { inputs: offerB, results: rB }]);
    setAiVerdict("");
    setLoadingAI(true);
    const context = {
      offerA: { company: offerA.company, year1: formatCurrency(rA.year1Total), year4: formatCurrency(rA.year4Total), hourly: formatCurrency(rA.effectiveHourly), commuteSavings: formatCurrency(rA.annualCommuteSavings), ptoBonusDays: rA.ptoBonusDays },
      offerB: { company: offerB.company, year1: formatCurrency(rB.year1Total), year4: formatCurrency(rB.year4Total), hourly: formatCurrency(rB.effectiveHourly), commuteSavings: formatCurrency(rB.annualCommuteSavings), ptoBonusDays: rB.ptoBonusDays },
    };
    try {
      const res = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: "Compare these two job offers and give me a verdict. Which one wins and should I negotiate?", context }),
      });
      if (!res.ok || !res.body) { setLoadingAI(false); return; }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setAiVerdict(acc);
      }
    } catch { /* silent fail */ }
    finally { setLoadingAI(false); }
  }

  const winner = decoded
    ? decoded[0].results.year4Total >= decoded[1].results.year4Total ? "A" : "B"
    : null;

  return (
    <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-2xl p-7 space-y-7">
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-white">Offer Decoder</h2>
          <span className="px-2.5 py-0.5 text-xs font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/25 rounded-full">New</span>
        </div>
        <p className="text-sm text-zinc-500 mt-1">Got multiple offers? See the real money side by side.</p>
      </div>

      {/* Two-column inputs */}
      <div className="grid grid-cols-2 gap-4">
        {(["A", "B"] as const).map(which => {
          const offer = which === "A" ? offerA : offerB;
          return (
            <div key={which} className="space-y-3">
              <input
                type="text"
                value={offer.company}
                onChange={e => update(which, "company", e.target.value)}
                placeholder={`Company ${which}`}
                className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
              {fields.map(f => (
                <div key={f.key} className="flex flex-col gap-1">
                  <label className="text-xs text-zinc-600">{f.label}</label>
                  <input
                    type="number"
                    value={offer[f.key] as number}
                    onChange={e => update(which, f.key, e.target.value)}
                    min={0} max={f.max} step={f.step ?? 1}
                    className="bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                  />
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <button
        onClick={handleDecode}
        className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all duration-200 text-sm"
      >
        Decode These Offers
      </button>

      {/* Results */}
      {decoded && (
        <div className="space-y-5">
          {/* Winner banner */}
          <div className={`rounded-xl p-4 text-center border ${winner === "A" ? "bg-emerald-500/10 border-emerald-500/30" : "bg-purple-500/10 border-purple-500/30"}`}>
            <p className="text-sm font-semibold text-zinc-400">4-Year Winner</p>
            <p className="text-2xl font-bold text-white mt-1">
              {winner === "A" ? decoded[0].inputs.company : decoded[1].inputs.company}
            </p>
            <p className={`text-sm font-medium mt-1 ${winner === "A" ? "text-emerald-400" : "text-purple-400"}`}>
              +{formatCurrency(Math.abs(decoded[0].results.year4Total - decoded[1].results.year4Total))} more over 4 years
            </p>
          </div>

          {/* Side-by-side stats */}
          <div className="bg-zinc-800/50 rounded-xl p-4">
            <div className="grid grid-cols-[1fr_auto_1fr] mb-3">
              <p className="text-sm font-bold text-right text-zinc-300">{decoded[0].inputs.company}</p>
              <div className="w-12" />
              <p className="text-sm font-bold text-left text-zinc-300">{decoded[1].inputs.company}</p>
            </div>
            <StatRow label="Year 1 Total" a={decoded[0].results.year1Total} b={decoded[1].results.year1Total} />
            <StatRow label="4-Year Total" a={decoded[0].results.year4Total} b={decoded[1].results.year4Total} />
            <StatRow label="Effective Hourly" a={decoded[0].results.effectiveHourly} b={decoded[1].results.effectiveHourly} />
            <StatRow label="Commute Savings/yr" a={decoded[0].results.annualCommuteSavings} b={decoded[1].results.annualCommuteSavings} />
            {(decoded[0].results.ptoBonusDays > 0 || decoded[1].results.ptoBonusDays > 0) && (
              <StatRow label="Extra PTO Value" a={decoded[0].results.ptoBonusValue} b={decoded[1].results.ptoBonusValue} />
            )}
          </div>

          {/* AI Verdict */}
          {(aiVerdict || loadingAI) && (
            <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/60 p-5 space-y-2">
              <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">AI Verdict</p>
              {loadingAI && !aiVerdict
                ? <div className="flex items-center gap-2 text-zinc-500 text-sm"><span className="w-3 h-3 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" /> Analyzing offers…</div>
                : <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{aiVerdict}</p>
              }
              {!loadingAI && <p className="text-xs text-zinc-600 pt-1">Estimates only — not financial advice.</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
