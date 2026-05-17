"use client";

import { useState, useRef, useEffect } from "react";
import { type RateResults, type ContractorResults, formatCurrency, formatPercent } from "@/lib/calculations";

interface Props {
  rateResults: RateResults | null;
  contractorResults: ContractorResults | null;
}

const EXAMPLE_QUESTIONS = [
  "Is my effective tax rate reasonable for my income?",
  "Should I go contractor or stay salaried?",
  "What contractor rate would match my salary net?",
  "How much am I really making per hour after taxes?",
];

export default function AIAdvisor({ rateResults, contractorResults }: Props) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const answerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (answer && answerRef.current) {
      answerRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [answer]);

  const hasContext = rateResults !== null || contractorResults !== null;

  function buildContext() {
    if (!hasContext) return null;
    const ctx: Record<string, unknown> = {};
    if (rateResults) {
      ctx.salaryCalculation = {
        grossHourly: formatCurrency(rateResults.grossHourly),
        netHourly: formatCurrency(rateResults.netHourly),
        grossMonthly: formatCurrency(rateResults.grossMonthly),
        netMonthly: formatCurrency(rateResults.netMonthly),
        grossAnnual: formatCurrency(rateResults.grossAnnual),
        netAnnual: formatCurrency(rateResults.netAnnual),
        effectiveTaxRate: formatPercent(rateResults.effectiveTaxRate),
        totalHoursPerYear: rateResults.totalHoursPerYear,
      };
    }
    if (contractorResults) {
      ctx.contractorCalculation = {
        grossAnnual: formatCurrency(contractorResults.grossAnnual),
        netAnnual: formatCurrency(contractorResults.netAnnual),
        netHourly: formatCurrency(contractorResults.netHourly),
        effectiveTaxRate: formatPercent(contractorResults.effectiveTaxRate),
        equivalentSalary: formatCurrency(contractorResults.equivalentSalary),
      };
    }
    return ctx;
  }

  async function handleAsk(q?: string) {
    const q_ = (q ?? question).trim();
    if (!q_) return;
    setQuestion(q ?? question);
    setAnswer("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q_, context: buildContext() }),
      });

      if (!res.ok || !res.body) {
        setError(await res.text());
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setAnswer(accumulated);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">AI Financial Advisor</h2>
          <p className="text-sm text-slate-500 mt-1">
            Powered by Groq · <span className="font-medium">Llama 3.3 70B</span>
          </p>
        </div>
        {hasContext && (
          <span className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Context loaded
          </span>
        )}
      </div>

      {/* Context hint */}
      {!hasContext && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <span className="text-amber-500 text-lg leading-none">💡</span>
          <p className="text-sm text-amber-800">
            Run a calculation above first to give the advisor context about your specific numbers.
            Or ask a general question below.
          </p>
        </div>
      )}

      {/* Example questions */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Try asking</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => handleAsk(q)}
              disabled={loading}
              className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-600 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAsk()}
          placeholder="Ask anything about your rates, taxes, or compensation…"
          disabled={loading}
          className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-slate-50"
        />
        <button
          onClick={() => handleAsk()}
          disabled={loading || !question.trim()}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm shrink-0"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Thinking
            </span>
          ) : "Ask"}
        </button>
      </div>

      {/* Response */}
      {(answer || error) && (
        <div ref={answerRef} className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-2">
          {error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : (
            <>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Advisor</p>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{answer}</p>
              {!loading && (
                <p className="text-xs text-slate-400 pt-1">
                  Estimates only — consult a licensed tax professional for binding advice.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
