export interface RateInputs {
  annualSalary: number;
  hoursPerWeek: number;
  weeksPerYear: number;
  taxRate: number;
  benefits: number;
}

export interface RateResults {
  grossHourly: number;
  netHourly: number;
  grossMonthly: number;
  netMonthly: number;
  grossAnnual: number;
  netAnnual: number;
  totalHoursPerYear: number;
  effectiveTaxRate: number;
}

export function calculateRates(inputs: RateInputs): RateResults {
  const { annualSalary, hoursPerWeek, weeksPerYear, taxRate, benefits } =
    inputs;

  const totalHoursPerYear = hoursPerWeek * weeksPerYear;
  const grossHourly = annualSalary / totalHoursPerYear;
  const netAnnual = annualSalary * (1 - taxRate / 100) - benefits;
  const netHourly = netAnnual / totalHoursPerYear;
  const grossMonthly = annualSalary / 12;
  const netMonthly = netAnnual / 12;
  const effectiveTaxRate = ((annualSalary - netAnnual) / annualSalary) * 100;

  return {
    grossHourly,
    netHourly,
    grossMonthly,
    netMonthly,
    grossAnnual: annualSalary,
    netAnnual,
    totalHoursPerYear,
    effectiveTaxRate,
  };
}

export interface ContractorInputs {
  hourlyRate: number;
  hoursPerWeek: number;
  weeksPerYear: number;
  selfEmploymentTax: number;
  businessExpenses: number;
}

export interface ContractorResults {
  grossAnnual: number;
  netAnnual: number;
  netHourly: number;
  effectiveTaxRate: number;
  equivalentSalary: number;
}

export function calculateContractorRate(
  inputs: ContractorInputs
): ContractorResults {
  const {
    hourlyRate,
    hoursPerWeek,
    weeksPerYear,
    selfEmploymentTax,
    businessExpenses,
  } = inputs;

  const grossAnnual = hourlyRate * hoursPerWeek * weeksPerYear;
  const taxableIncome = grossAnnual - businessExpenses;
  const taxAmount = taxableIncome * (selfEmploymentTax / 100);
  const netAnnual = grossAnnual - taxAmount - businessExpenses;
  const totalHours = hoursPerWeek * weeksPerYear;
  const netHourly = netAnnual / totalHours;
  const effectiveTaxRate = (taxAmount / grossAnnual) * 100;
  const equivalentSalary = netAnnual / (1 - 0.3);

  return {
    grossAnnual,
    netAnnual,
    netHourly,
    effectiveTaxRate,
    equivalentSalary,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
