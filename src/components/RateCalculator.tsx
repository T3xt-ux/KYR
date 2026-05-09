"use client";

import { useState } from "react";
import {
  calculateRates,
  formatCurrency,
  formatPercent,
  type RateInputs,
  type RateResults,
} from "@/lib/calculations";

const defaultInputs: RateInputs = {
  annualSalary: 100000,
  hoursPerWeek: 40,
  weeksPerYear: 50,
  taxRate: 25,
  benefits: 5000,
};

export default function RateCalculator() {
  const [inputs, setInputs] = useState<RateInputs>(defaultInputs);
  const [results, setResults] = useState<RateResults | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
  }

  function handleCalculate() {
    setResults(calculateRates(inputs));
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">
        Salary → Hourly Rate
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          label="Annual Salary ($)"
          name="annualSalary"
          value={inputs.annualSalary}
          onChange={handleChange}
          min={0}
          step={1000}
        />
        <InputField
          label="Hours per Week"
          name="hoursPerWeek"
          value={inputs.hoursPerWeek}
          onChange={handleChange}
          min={1}
          max={80}
        />
        <InputField
          label="Weeks Worked per Year"
          name="weeksPerYear"
          value={inputs.weeksPerYear}
          onChange={handleChange}
          min={1}
          max={52}
        />
        <InputField
          label="Income Tax Rate (%)"
          name="taxRate"
          value={inputs.taxRate}
          onChange={handleChange}
          min={0}
          max={60}
          step={0.5}
        />
        <InputField
          label="Annual Benefits Cost ($)"
          name="benefits"
          value={inputs.benefits}
          onChange={handleChange}
          min={0}
          step={500}
        />
      </div>

      <button
        onClick={handleCalculate}
        className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors duration-200"
      >
        Calculate My Rate
      </button>

      {results && (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <ResultCard
            label="Gross Hourly"
            value={formatCurrency(results.grossHourly)}
            highlight
          />
          <ResultCard
            label="Net Hourly"
            value={formatCurrency(results.netHourly)}
            highlight
          />
          <ResultCard
            label="Gross Monthly"
            value={formatCurrency(results.grossMonthly)}
          />
          <ResultCard
            label="Net Monthly"
            value={formatCurrency(results.netMonthly)}
          />
          <ResultCard
            label="Net Annual"
            value={formatCurrency(results.netAnnual)}
          />
          <ResultCard
            label="Effective Tax"
            value={formatPercent(results.effectiveTaxRate)}
          />
        </div>
      )}
    </div>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  label: string;
  name: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-600">{label}</label>
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        className="border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
      />
    </div>
  );
}

function ResultCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-4 text-center ${
        highlight
          ? "bg-blue-600 text-white"
          : "bg-slate-50 border border-slate-200 text-slate-800"
      }`}
    >
      <p className={`text-xs font-medium mb-1 ${highlight ? "text-blue-100" : "text-slate-500"}`}>
        {label}
      </p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
