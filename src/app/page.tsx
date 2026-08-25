"use client";

import { useState } from "react";
import RateCalculator from "@/components/RateCalculator";
import ContractorCalculator from "@/components/ContractorCalculator";
import AIAdvisor from "@/components/AIAdvisor";
import OfferDecoder from "@/components/OfferDecoder";
import { type RateResults, type ContractorResults } from "@/lib/calculations";

export default function Home() {
  const [rateResults, setRateResults] = useState<RateResults | null>(null);
  const [contractorResults, setContractorResults] = useState<ContractorResults | null>(null);

  return (
    <main className="min-h-screen py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* Hero */}
        <div className="text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Free · No sign-up · AI-powered
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Know Your Rate
          </h1>
          <p className="text-lg text-zinc-400 max-w-xl mx-auto">
            Stop guessing what you&apos;re worth. Decode your salary, compare job offers, and get instant AI coaching — all in one place.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { label: "Tax Reality Check", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
              { label: "Contractor vs. Salary", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
              { label: "Offer Decoder", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
              { label: "AI Money Coach", color: "text-pink-400 bg-pink-500/10 border-pink-500/20" },
            ].map(p => (
              <span key={p.label} className={`px-3 py-1 text-xs font-semibold rounded-full border ${p.color}`}>
                {p.label}
              </span>
            ))}
          </div>
        </div>

        {/* Calculators */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <RateCalculator onResults={setRateResults} />
          <ContractorCalculator onResults={setContractorResults} />
        </div>

        {/* AI Money Coach */}
        <AIAdvisor rateResults={rateResults} contractorResults={contractorResults} />

        {/* Offer Decoder */}
        <OfferDecoder />

        {/* How it works */}
        <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8">
          <h2 className="text-lg font-bold text-white mb-6">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </div>
                <h3 className="text-sm font-semibold text-zinc-200">{step.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-zinc-700">
          KnowYourRate · Estimates only · Not financial advice
        </p>
      </div>
    </main>
  );
}

const steps = [
  { title: "Enter your numbers", description: "Drop in your salary, hours, and tax rate. Takes 30 seconds." },
  { title: "See the reality", description: "Get your actual hourly, monthly, and net figures broken down clearly." },
  { title: "Decode any offer", description: "Compare two job offers head-to-head including equity, PTO, and remote perks." },
  { title: "Ask the AI coach", description: "Get instant, personalized advice based on your exact numbers." },
];
