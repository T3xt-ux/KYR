"use client";

import { useState } from "react";
import { calculateRates, formatCurrency, formatPercent, type RateInputs, type RateResults } from "@/lib/calculations";

const defaultInputs: RateInputs = { annualSalary: 100000, hoursPerWeek: 40, weeksPerYear: 50, taxRate: 25, benefits: 5000 };

interface Props { onResults?: (r: RateResults) => void; }

export default function RateCalculator({ onResults }: Props) {
  const [inputs, setInputs] = useState<RateInputs>(defaultInputs);
  const [results, setResults] = useState<RateResults | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputs(p => ({ ...p, [e.target.name]: parseFloat(e.target.value) || 0 }));
  }

  function handleCalculate() {
    const r = calculateRates(inputs);
    setResults(r);
    onResults?.(r);
  }

  return (
    <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-2xl p-7 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Salary Reality Check</h2>
        <p className="text-sm text-zinc-500 mt-1">What are you actually earning per hour?</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Annual Salary ($)", name: "annualSalary", step: 1000, min: 0 },
          { label: "Hours / Week", name: "hoursPerWeek", min: 1, max: 80 },
          { label: "Weeks Worked / Year", name: "weeksPerYear", min: 1, max: 52 },
          { label: "Tax Rate (%)", name: "taxRate", min: 0, max: 60, step: 0.5 },
          { label: "Benefits Cost / Year ($)", name: "benefits", step: 500, min: 0 },
        ].map(f => (
          <div key={f.name} className={f.name === "benefits" ? "col-span-2 flex flex-col gap-1" : "flex flex-col gap-1"}>
            <label className="text-xs font-medium text-zinc-500">{f.label}</label>
            <input
              type="number" name={f.name}
              value={inputs[f.name as keyof RateInputs]}
              onChange={handleChange}
              min={f.min} max={f.max} step={f.step ?? 1}
              className="bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleCalculate}
        className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 text-sm"
      >
        Calculate My Real Rate
      </button>

      {results && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: "Gross Hourly", value: formatCurrency(results.grossHourly), hi: true },
            { label: "Net Hourly", value: formatCurrency(results.netHourly), hi: true },
            { label: "Gross Monthly", value: formatCurrency(results.grossMonthly) },
            { label: "Net Monthly", value: formatCurrency(results.netMonthly) },
            { label: "Net Annual", value: formatCurrency(results.netAnnual) },
            { label: "Effective Tax", value: formatPercent(results.effectiveTaxRate) },
          ].map(({ label, value, hi }) => (
            <div key={label} className={`rounded-xl p-4 text-center ${hi ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white" : "bg-zinc-800/80 border border-zinc-700 text-zinc-100"}`}>
              <p className={`text-xs font-medium mb-1 ${hi ? "text-blue-200" : "text-zinc-500"}`}>{label}</p>
              <p className="text-lg font-bold">{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
