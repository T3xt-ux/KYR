"use client";

import { useState, useRef, useEffect } from "react";
import { type RateResults, type ContractorResults, formatCurrency, formatPercent } from "@/lib/calculations";

interface Props {
  rateResults: RateResults | null;
  contractorResults: ContractorResults | null;
}

const EXAMPLES = [
  "Is my effective tax rate reasonable?",
  "Should I go contractor or stay salaried?",
  "What rate would match my salary net?",
  "How much am I really making per hour?",
];

export default function AIAdvisor({ rateResults, contractorResults }: Props) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const answerRef = useRef<HTMLDivElement>(null);
  const hasContext = rateResults !== null || contractorResults !== null;

  useEffect(() => {
    if (answer) answerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [answer]);

  function buildContext() {
    if (!hasContext) return null;
    const ctx: Record<string, unknown> = {};
    if (rateResults) ctx.salaryCalculation = {
      grossHourly: formatCurrency(rateResults.grossHourly),
      netHourly: formatCurrency(rateResults.netHourly),
      grossAnnual: formatCurrency(rateResults.grossAnnual),
      netAnnual: formatCurrency(rateResults.netAnnual),
      effectiveTaxRate: formatPercent(rateResults.effectiveTaxRate),
      totalHoursPerYear: rateResults.totalHoursPerYear,
    };
    if (contractorResults) ctx.contractorCalculation = {
      grossAnnual: formatCurrency(contractorResults.grossAnnual),
      netAnnual: formatCurrency(contractorResults.netAnnual),
      netHourly: formatCurrency(contractorResults.netHourly),
      effectiveTaxRate: formatPercent(contractorResults.effectiveTaxRate),
      equivalentSalary: formatCurrency(contractorResults.equivalentSalary),
    };
    return ctx;
  }

  async function handleAsk(q?: string) {
    const q_ = (q ?? question).trim();
    if (!q_) return;
    if (q) setQuestion(q);
    setAnswer(""); setError(""); setLoading(true);
    try {
      const res = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q_, context: buildContext() }),
      });
      if (!res.ok || !res.body) { setError(await res.text()); return; }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setAnswer(acc);
      }
    } catch { setError("Network error. Try again."); }
    finally { setLoading(false); }
  }

  return (
    <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-2xl p-7 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">AI Money Coach</h2>
          <p className="text-sm text-zinc-500 mt-1">Ask anything about your rates, taxes, or comp</p>
        </div>
        {hasContext && (
          <span className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live context
          </span>
        )}
      </div>

      {!hasContext && (
        <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
          <span className="text-amber-400 text-base leading-none mt-0.5">💡</span>
          <p className="text-sm text-amber-300/80">
            Run a calculation above to unlock context-aware advice, or ask a general question below.
          </p>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">Try asking</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map(q => (
            <button key={q} onClick={() => handleAsk(q)} disabled={loading}
              className="text-xs px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-full transition-colors disabled:opacity-40"
            >{q}</button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="text" value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAsk()}
          placeholder="Ask about your money situation…"
          disabled={loading}
          className="flex-1 bg-zinc-800/80 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:opacity-50"
        />
        <button
          onClick={() => handleAsk()}
          disabled={loading || !question.trim()}
          className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 text-white font-semibold rounded-xl transition-all text-sm shrink-0"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Thinking
            </span>
          ) : "Ask"}
        </button>
      </div>

      {(answer || error) && (
        <div ref={answerRef} className="rounded-xl border border-zinc-700/50 bg-zinc-800/60 p-5 space-y-2">
          {error
            ? <p className="text-sm text-red-400">{error}</p>
            : <>
                <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">Coach</p>
                <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{answer}</p>
                {!loading && <p className="text-xs text-zinc-600 pt-1">Estimates only — not financial advice.</p>}
              </>
          }
        </div>
      )}
    </div>
  );
}
