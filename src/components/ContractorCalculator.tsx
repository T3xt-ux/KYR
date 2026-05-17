"use client";

import { useState } from "react";
import { calculateContractorRate, formatCurrency, formatPercent, type ContractorInputs, type ContractorResults } from "@/lib/calculations";

const defaultInputs: ContractorInputs = { hourlyRate: 75, hoursPerWeek: 40, weeksPerYear: 48, selfEmploymentTax: 30, businessExpenses: 6000 };

interface Props { onResults?: (r: ContractorResults) => void; }

export default function ContractorCalculator({ onResults }: Props) {
  const [inputs, setInputs] = useState<ContractorInputs>(defaultInputs);
  const [results, setResults] = useState<ContractorResults | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputs(p => ({ ...p, [e.target.name]: parseFloat(e.target.value) || 0 }));
  }

  function handleCalculate() {
    const r = calculateContractorRate(inputs);
    setResults(r);
    onResults?.(r);
  }

  return (
    <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-2xl p-7 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Go Solo Calculator</h2>
        <p className="text-sm text-zinc-500 mt-1">Is freelancing actually worth it?</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Hourly Rate ($)", name: "hourlyRate", step: 5, min: 1 },
          { label: "Hours / Week", name: "hoursPerWeek", min: 1, max: 80 },
          { label: "Billable Weeks / Year", name: "weeksPerYear", min: 1, max: 52 },
          { label: "Self-Employment Tax (%)", name: "selfEmploymentTax", min: 0, max: 60, step: 0.5 },
          { label: "Business Expenses / Year ($)", name: "businessExpenses", step: 500, min: 0 },
        ].map(f => (
          <div key={f.name} className={f.name === "businessExpenses" ? "col-span-2 flex flex-col gap-1" : "flex flex-col gap-1"}>
            <label className="text-xs font-medium text-zinc-500">{f.label}</label>
            <input
              type="number" name={f.name}
              value={inputs[f.name as keyof ContractorInputs]}
              onChange={handleChange}
              min={f.min} max={f.max} step={f.step ?? 1}
              className="bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleCalculate}
        className="w-full py-3 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl transition-all duration-200 text-sm"
      >
        Crunch Contractor Numbers
      </button>

      {results && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl p-4 text-center text-white">
              <p className="text-xs font-medium text-emerald-200 mb-1">Net Hourly</p>
              <p className="text-2xl font-bold">{formatCurrency(results.netHourly)}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl p-4 text-center text-white">
              <p className="text-xs font-medium text-emerald-200 mb-1">Net Annual</p>
              <p className="text-2xl font-bold">{formatCurrency(results.netAnnual)}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-800/80 border border-zinc-700 rounded-xl p-4 text-center">
              <p className="text-xs font-medium text-zinc-500 mb-1">Gross Annual</p>
              <p className="text-lg font-bold text-zinc-100">{formatCurrency(results.grossAnnual)}</p>
            </div>
            <div className="bg-zinc-800/80 border border-zinc-700 rounded-xl p-4 text-center">
              <p className="text-xs font-medium text-zinc-500 mb-1">Effective Tax</p>
              <p className="text-lg font-bold text-zinc-100">{formatPercent(results.effectiveTaxRate)}</p>
            </div>
          </div>
          <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4">
            <p className="text-sm text-indigo-400 font-medium">Equivalent Salary</p>
            <p className="text-2xl font-bold text-white mt-1">{formatCurrency(results.equivalentSalary)}</p>
            <p className="text-xs text-zinc-500 mt-1">A salaried job would need to pay this to match your contractor take-home</p>
          </div>
        </div>
      )}
    </div>
  );
}
