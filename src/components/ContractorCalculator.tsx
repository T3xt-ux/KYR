"use client";

import { useState } from "react";
import {
  calculateContractorRate,
  formatCurrency,
  formatPercent,
  type ContractorInputs,
  type ContractorResults,
} from "@/lib/calculations";

const defaultInputs: ContractorInputs = {
  hourlyRate: 75,
  hoursPerWeek: 40,
  weeksPerYear: 48,
  selfEmploymentTax: 30,
  businessExpenses: 6000,
};

interface Props {
  onResults?: (results: ContractorResults) => void;
}

export default function ContractorCalculator({ onResults }: Props) {
  const [inputs, setInputs] = useState<ContractorInputs>(defaultInputs);
  const [results, setResults] = useState<ContractorResults | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
  }

  function handleCalculate() {
    const r = calculateContractorRate(inputs);
    setResults(r);
    onResults?.(r);
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">
        Contractor Rate Analyzer
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-600">
            Hourly Rate ($)
          </label>
          <input
            type="number"
            name="hourlyRate"
            value={inputs.hourlyRate}
            onChange={handleChange}
            min={1}
            step={5}
            className="border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-600">
            Hours per Week
          </label>
          <input
            type="number"
            name="hoursPerWeek"
            value={inputs.hoursPerWeek}
            onChange={handleChange}
            min={1}
            max={80}
            className="border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-600">
            Billable Weeks per Year
          </label>
          <input
            type="number"
            name="weeksPerYear"
            value={inputs.weeksPerYear}
            onChange={handleChange}
            min={1}
            max={52}
            className="border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-600">
            Self-Employment Tax Rate (%)
          </label>
          <input
            type="number"
            name="selfEmploymentTax"
            value={inputs.selfEmploymentTax}
            onChange={handleChange}
            min={0}
            max={60}
            step={0.5}
            className="border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label className="text-sm font-medium text-slate-600">
            Annual Business Expenses ($)
          </label>
          <input
            type="number"
            name="businessExpenses"
            value={inputs.businessExpenses}
            onChange={handleChange}
            min={0}
            step={500}
            className="border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
      </div>

      <button
        onClick={handleCalculate}
        className="w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors duration-200"
      >
        Analyze Contractor Income
      </button>

      {results && (
        <div className="mt-6 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-600 text-white rounded-xl p-4 text-center">
              <p className="text-xs font-medium text-emerald-100 mb-1">Net Hourly</p>
              <p className="text-2xl font-bold">
                {formatCurrency(results.netHourly)}
              </p>
            </div>
            <div className="bg-emerald-600 text-white rounded-xl p-4 text-center">
              <p className="text-xs font-medium text-emerald-100 mb-1">Net Annual</p>
              <p className="text-2xl font-bold">
                {formatCurrency(results.netAnnual)}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
              <p className="text-xs font-medium text-slate-500 mb-1">Gross Annual</p>
              <p className="text-xl font-bold text-slate-800">
                {formatCurrency(results.grossAnnual)}
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
              <p className="text-xs font-medium text-slate-500 mb-1">Effective Tax</p>
              <p className="text-xl font-bold text-slate-800">
                {formatPercent(results.effectiveTaxRate)}
              </p>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-700 font-medium">
              Equivalent Employee Salary
            </p>
            <p className="text-2xl font-bold text-blue-900 mt-1">
              {formatCurrency(results.equivalentSalary)}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              A salaried employee would need to earn this to match your net
              contractor income (assuming ~30% tax)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
