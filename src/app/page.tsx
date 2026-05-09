import RateCalculator from "@/components/RateCalculator";
import ContractorCalculator from "@/components/ContractorCalculator";

export default function Home() {
  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">
            Know Your Rate
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">
            Understand what your salary really means per hour — and whether
            contractor life pays better.
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3">
          {[
            "Gross vs Net",
            "Tax Estimation",
            "Contractor vs Employee",
            "Equivalent Salary",
          ].map((pill) => (
            <span
              key={pill}
              className="px-4 py-1.5 bg-blue-100 text-blue-700 text-sm font-medium rounded-full"
            >
              {pill}
            </span>
          ))}
        </div>

        {/* Calculators */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RateCalculator />
          <ContractorCalculator />
        </div>

        {/* How it works */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-slate-800">{step.title}</h3>
                <p className="text-sm text-slate-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-400">
          KnowYourRate — estimates only. Consult a tax professional for advice.
        </p>
      </div>
    </main>
  );
}

const steps = [
  {
    title: "Enter Your Numbers",
    description:
      "Input your annual salary or hourly rate along with your working hours and estimated tax rate.",
  },
  {
    title: "Instant Calculation",
    description:
      "See your gross and net hourly, monthly, and annual figures broken down clearly.",
  },
  {
    title: "Compare & Decide",
    description:
      "Use the contractor analyzer to see if going independent would put more money in your pocket.",
  },
];
