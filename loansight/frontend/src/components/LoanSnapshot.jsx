import React from 'react';
import { DollarSign, Percent, TrendingUp, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function LoanSnapshot({ formData }) {
  const amount = Number(formData.LoanAmount) || 25000;
  const rate = Number(formData.InterestRate) || 10.5;
  const term = Number(formData.LoanTerm) || 36;
  const income = Number(formData.Income) || 75000;
  const dti = Number(formData.DTIRatio) || 0.35;
  const creditScore = Number(formData.CreditScore) || 680;

  // Monthly payment calculation
  const r = rate / 100 / 12;
  const n = term;
  let monthlyPayment = 0;
  if (r > 0 && n > 0) {
    monthlyPayment = (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  } else if (n > 0) {
    monthlyPayment = amount / n;
  }

  // Loan to income ratio
  const lti = income > 0 ? amount / income : 0;

  // DTI Status
  let dtiStatus = { label: 'Healthy', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
  if (dti > 0.50) {
    dtiStatus = { label: 'High Burden', color: 'text-rose-600 bg-rose-50 border-rose-200' };
  } else if (dti > 0.35) {
    dtiStatus = { label: 'Moderate', color: 'text-amber-600 bg-amber-50 border-amber-200' };
  }

  // Credit tier
  let creditTier = 'Fair';
  if (creditScore >= 740) creditTier = 'Excellent';
  else if (creditScore >= 670) creditTier = 'Good';
  else if (creditScore < 580) creditTier = 'Poor';

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-200 shadow-soft sticky top-24 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="font-display font-semibold text-ink text-sm flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-tealAccent" />
          Live Loan Snapshot
        </h3>
        <span className="text-[11px] font-mono text-ink-muted bg-slate-100 px-2 py-0.5 rounded-full">
          Real-time
        </span>
      </div>

      {/* Estimated Monthly Payment */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-4 shadow-sm">
        <span className="text-xs font-medium text-slate-300 block mb-1">Estimated Monthly Payment</span>
        <div className="text-2xl font-bold font-display tracking-tight text-white flex items-baseline gap-1">
          ₹{Math.round(monthlyPayment).toLocaleString()}
          <span className="text-xs font-normal text-slate-400">/ mo</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
          <span>{term} months @ {rate}% APR</span>
          <span>Principal: ₹{amount.toLocaleString()}</span>
        </div>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
          <span className="text-ink-muted block text-[11px] mb-1">Loan-to-Income</span>
          <span className="font-semibold font-display text-ink text-sm block">
            {(lti * 100).toFixed(1)}%
          </span>
          <span className="text-[10px] text-ink-muted">{lti > 2.0 ? 'High leverage' : 'Standard bounds'}</span>
        </div>

        <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
          <span className="text-ink-muted block text-[11px] mb-1">DTI Ratio Status</span>
          <span className={`inline-block font-semibold px-2 py-0.5 rounded-md border text-[11px] ${dtiStatus.color}`}>
            {dtiStatus.label} ({(dti * 100).toFixed(0)}%)
          </span>
        </div>

        <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 col-span-2 flex items-center justify-between">
          <div>
            <span className="text-ink-muted block text-[11px]">Credit Score Rating</span>
            <span className="font-semibold text-ink text-sm">{creditScore} pts</span>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 bg-white rounded-lg border border-slate-200 shadow-2xs">
            {creditTier}
          </span>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 text-[11px] text-ink-muted flex items-center gap-1.5">
        <CheckCircle2 className="w-3.5 h-3.5 text-tealAccent" />
        <span>Updates automatically as you alter form parameters.</span>
      </div>
    </div>
  );
}
