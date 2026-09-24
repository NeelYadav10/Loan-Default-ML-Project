import React, { useEffect, useState } from 'react';
import { getModelInfo } from '../lib/api';
import { Cpu, BarChart3, Database, ShieldCheck, CheckCircle2, RefreshCw, FileText, Info, HelpCircle } from 'lucide-react';

const FEATURE_TABLE_DATA = [
  { name: "Age", type: "Integer", range: "18 – 69", desc: "Borrower age in years" },
  { name: "Income", type: "Integer", range: "₹15,000 – ₹149,999", desc: "Self-reported annual gross income" },
  { name: "LoanAmount", type: "Integer", range: "₹5,000 – ₹249,999", desc: "Principal loan amount requested" },
  { name: "CreditScore", type: "Integer", range: "300 – 849", desc: "FICO credit rating" },
  { name: "MonthsEmployed", type: "Integer", range: "0 – 119", desc: "Employment tenure at current employer" },
  { name: "NumCreditLines", type: "Integer", range: "1 – 4", desc: "Active open credit accounts" },
  { name: "InterestRate", type: "Float", range: "2.0% – 25.0%", desc: "Annualized interest rate percentage" },
  { name: "LoanTerm", type: "Categorical", range: "12, 24, 36, 48, 60", desc: "Repayment duration in months" },
  { name: "DTIRatio", type: "Float", range: "0.10 – 0.90", desc: "Total monthly debt payments / gross income" },
  { name: "Education", type: "Categorical", range: "High School, Bachelor's, Master's, PhD", desc: "Highest academic qualification" },
  { name: "EmploymentType", type: "Categorical", range: "Full-time, Part-time, Self-employed, Unemployed", desc: "Current employment status" },
  { name: "MaritalStatus", type: "Categorical", range: "Single, Married, Divorced", desc: "Legal marital status" },
  { name: "HasMortgage", type: "Categorical", range: "Yes, No", desc: "Indicates existing home loan" },
  { name: "HasDependents", type: "Categorical", range: "Yes, No", desc: "Indicates financial dependents" },
  { name: "LoanPurpose", type: "Categorical", range: "Auto, Business, Education, Home, Other", desc: "Intended application of funds" },
  { name: "HasCoSigner", type: "Categorical", range: "Yes, No", desc: "Secondary credit guarantee backing" }
];

export default function About() {
  const [modelInfo, setModelInfo] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [slowNotice, setSlowNotice] = useState(false);
  const [metricsError, setMetricsError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted) setSlowNotice(true);
    }, 5000);

    const fetchInfo = async () => {
      try {
        const data = await getModelInfo();
        if (isMounted) {
          setModelInfo(data);
          setMetricsError(false);
        }
      } catch (err) {
        console.warn('Backend metrics fetch warning:', err);
        if (isMounted) {
          setMetricsError(true);
        }
      } finally {
        if (isMounted) {
          clearTimeout(timer);
          setSlowNotice(false);
          setMetricsLoading(false);
        }
      }
    };
    fetchInfo();
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  const metrics = modelInfo?.metrics || null;
  const featureImportances = modelInfo?.feature_importances || null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Page Header (Renders Immediately) */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <span className="text-xs font-bold text-tealAccent uppercase tracking-widest">
          Model Specifications & Dataset
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-ink tracking-tight">
          About the LoanSight Engine
        </h1>
        <p className="text-ink-muted text-sm sm:text-base">
          Full technical architecture, dataset specifications, feature dictionary, and model evaluation metrics.
        </p>
      </div>

      {/* Static Section 1: Overview & Dataset Facts (Renders Immediately) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 shadow-soft space-y-2">
          <div className="w-10 h-10 rounded-xl bg-tealAccent/15 text-tealAccent flex items-center justify-center mb-3">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-ink text-base">Model Algorithm</h3>
          <p className="text-xs text-ink-muted leading-relaxed">
            <strong>GradientBoostingClassifier</strong> (150 decision trees, max depth 4, learning rate 0.1, random state 42). Champion architecture selected from 5-fold cross-validation.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-200 shadow-soft space-y-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-ink text-base">Dataset Facts</h3>
          <p className="text-xs text-ink-muted leading-relaxed">
            Trained on <strong>255,347 anonymized loan application records</strong>. Baseline default class rate is <strong>~11.6%</strong> (stratified 80/20 train/test split).
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-200 shadow-soft space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-ink text-base">16 Risk Signals</h3>
          <p className="text-xs text-ink-muted leading-relaxed">
            Evaluates 9 numerical features (IQR clipped) and 7 categorical features (encoded with training LabelEncoders) to compute default risk.
          </p>
        </div>
      </div>

      {/* Dynamic Live Metrics Section (Loads from /api/model-info with Skeleton Loader) */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-200 shadow-soft space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-tealAccent/15 text-tealAccent flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-ink text-lg">Held-Out Test Set Metrics</h3>
              <p className="text-xs text-ink-muted">Evaluated on 51,070 test records (20% split)</p>
            </div>
          </div>
          <span className="text-xs font-mono px-3 py-1 bg-slate-100 rounded-full text-ink-muted">
            {metricsLoading ? 'Fetching...' : (metrics ? 'Live Connected' : 'Offline Mode')}
          </span>
        </div>

        {metricsLoading ? (
          <div className="py-8 text-center space-y-3">
            <RefreshCw className="w-6 h-6 text-tealAccent animate-spin mx-auto" />
            <span className="text-xs text-ink-muted block">Loading real test set metrics from server...</span>
            {slowNotice && (
              <span className="text-xs font-medium text-amber-600 block animate-pulse">
                Waking up the server, this may take up to a minute…
              </span>
            )}
          </div>
        ) : metricsError || !metrics ? (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-ink-muted space-y-1">
            <Info className="w-5 h-5 text-amber-500 mx-auto mb-1" />
            <p className="font-semibold text-ink">Live Test Metrics Temporarily Offline</p>
            <p>Showing static specifications below. Connect to backend to view live JSON metrics.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-center">
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
              <span className="text-[11px] font-semibold text-ink-muted block uppercase">Accuracy</span>
              <span className="text-2xl font-bold font-display text-ink">
                {((metrics.accuracy || 0.8864) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
              <span className="text-[11px] font-semibold text-ink-muted block uppercase">ROC-AUC</span>
              <span className="text-2xl font-bold font-display text-tealAccent">
                {(metrics.roc_auc || 0.7583).toFixed(4)}
              </span>
            </div>
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
              <span className="text-[11px] font-semibold text-ink-muted block uppercase">Precision</span>
              <span className="text-2xl font-bold font-display text-ink">
                {((metrics.precision || 0.5882) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
              <span className="text-[11px] font-semibold text-ink-muted block uppercase">Recall</span>
              <span className="text-2xl font-bold font-display text-ink">
                {((metrics.recall || 0.0737) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
              <span className="text-[11px] font-semibold text-ink-muted block uppercase">F1-Score</span>
              <span className="text-2xl font-bold font-display text-ink">
                {(metrics.f1_score || 0.1310).toFixed(4)}
              </span>
            </div>
          </div>
        )}

        {/* Feature Importances Chart if available */}
        {featureImportances && (
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <h4 className="font-display font-bold text-ink text-sm">Gini Feature Importances (Top Drivers)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
              {Object.entries(featureImportances).map(([feat, imp]) => {
                const pct = (imp * 100).toFixed(1);
                return (
                  <div key={feat} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-ink">
                      <span>{feat}</span>
                      <span className="font-mono text-tealAccent">{pct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-tealAccent h-2 rounded-full" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Static Section 2: Complete 16 Input Features Dictionary Table */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-200 shadow-soft space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-tealAccent/15 text-tealAccent flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-ink text-lg">Input Features Dictionary (16 Signals)</h3>
            <p className="text-xs text-ink-muted">Allowed bounds, data types, and field descriptions</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-ink font-bold font-display">
                <th className="p-3 rounded-l-xl">Field Name</th>
                <th className="p-3">Data Type</th>
                <th className="p-3">Allowed Range / Options</th>
                <th className="p-3 rounded-r-xl">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-ink-muted font-medium">
              {FEATURE_TABLE_DATA.map((row) => (
                <tr key={row.name} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-3 font-semibold text-ink font-mono">{row.name}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-ink text-[11px] font-mono">
                      {row.type}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-teal-700">{row.range}</td>
                  <td className="p-3 text-ink-muted">{row.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Static Section 3: Risk Level Calibration & How Predictions Work */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Risk Calibration Guide */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-200 shadow-soft space-y-4">
          <h3 className="font-display font-bold text-ink text-lg flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-tealAccent" />
            Risk Level Calibration Matrix
          </h3>
          <p className="text-xs text-ink-muted leading-relaxed">
            Probability thresholds are calibrated against test set percentiles (P75 = 0.147, P95 = 0.35) to provide meaningful credit risk buckets:
          </p>

          <div className="space-y-3 text-xs pt-2">
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center">
              <div>
                <strong className="text-emerald-900 block">Low Risk Profile</strong>
                <span className="text-emerald-700">Probability &lt; 0.15 (Bottom 75% of applicants)</span>
              </div>
              <span className="px-2.5 py-1 bg-white text-emerald-700 font-bold rounded-lg border border-emerald-300">
                Low
              </span>
            </div>

            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 flex justify-between items-center">
              <div>
                <strong className="text-amber-900 block">Medium Risk Profile</strong>
                <span className="text-amber-700">Probability 0.15 – 0.35 (75th to 95th percentile)</span>
              </div>
              <span className="px-2.5 py-1 bg-white text-amber-700 font-bold rounded-lg border border-amber-300">
                Medium
              </span>
            </div>

            <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 flex justify-between items-center">
              <div>
                <strong className="text-rose-900 block">High Risk Profile</strong>
                <span className="text-rose-700">Probability &gt; 0.35 (Top 5% highest risk)</span>
              </div>
              <span className="px-2.5 py-1 bg-white text-rose-700 font-bold rounded-lg border border-rose-300">
                High
              </span>
            </div>
          </div>
        </div>

        {/* How Predictions Work */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-200 shadow-soft space-y-4">
          <h3 className="font-display font-bold text-ink text-lg flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-tealAccent" />
            How Predictions Work
          </h3>
          <div className="space-y-3 text-xs text-ink-muted leading-relaxed">
            <p>
              1. <strong>Input Standardization</strong>: Numeric inputs are clipped using saved IQR bounds (`Q1 - 1.5*IQR`, `Q3 + 1.5*IQR`) to prevent outlier distortion.
            </p>
            <p>
              2. <strong>Ensemble Scoring</strong>: Standardized inputs pass through 150 decision trees. The probability score represents the proportion of trees voting for default weighted by step size.
            </p>
            <p>
              3. <strong>Sensitivity What-If Analysis</strong>: Each feature is temporarily replaced with its baseline training median/mode to compute probability delta \(\Delta p\), revealing the exact drivers raising or lowering default risk.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
