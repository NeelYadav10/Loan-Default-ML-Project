import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Zap, Eye, Lock, ArrowRight, CheckCircle2,
  TrendingUp, BarChart3, Cpu, Sparkles, FileText
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="space-y-20 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 gradient-mesh">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-6 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tealAccent/10 border border-tealAccent/20 text-tealAccent text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen Machine Learning Assessment</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display text-ink tracking-tight leading-[1.15]">
                Instant Loan Default <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-tealAccent to-emerald-600">
                  Risk Intelligence
                </span>
              </h1>

              <p className="text-lg text-ink-muted leading-relaxed max-w-2xl mx-auto lg:mx-0">
                LoanSight delivers enterprise-grade credit risk predictions using a trained 
                Gradient Boosting model evaluated on 255,000+ anonymized borrower records across 16 critical risk signals.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => navigate('/predict')}
                  className="w-full sm:w-auto px-8 py-4 bg-tealAccent hover:bg-tealAccent-hover text-white text-base font-bold rounded-2xl transition-all shadow-lg shadow-tealAccent/25 hover:shadow-xl hover:shadow-tealAccent/35 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 group"
                >
                  Start Loan Assessment
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => navigate('/about')}
                  className="w-full sm:w-auto px-6 py-4 glass-panel text-ink hover:text-tealAccent text-base font-semibold rounded-2xl border border-slate-200 hover:border-tealAccent/40 transition-all flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  View Model Architecture
                </button>
              </div>

              {/* Trust Micro-Badges */}
              <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-ink-muted border-t border-slate-200/60">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-tealAccent" />
                  <span>255K Dataset Trained</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-tealAccent" />
                  <span>88.6% Model Accuracy</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-tealAccent" />
                  <span>Sub-50ms Inference</span>
                </div>
              </div>
            </motion.div>

            {/* Right Hero Visual (Interactive Floating UI Mockup) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main Card */}
                <div className="glass-panel rounded-3xl p-6 shadow-card-hover border border-slate-200 space-y-6 relative z-10">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-tealAccent/15 text-tealAccent flex items-center justify-center font-bold">
                        <Cpu className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-ink text-sm">Gradient Boosting v1.0</h4>
                        <p className="text-xs text-ink-muted">Inference Latency: 14ms</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-semibold text-xs rounded-full border border-emerald-200">
                      Model Active
                    </span>
                  </div>

                  {/* Sample Mini Prediction Preview */}
                  <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>Evaluated Risk Profile</span>
                      <span className="font-mono text-emerald-400">PASSED</span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-xs text-slate-400 block">Default Probability</span>
                        <span className="text-3xl font-extrabold font-display text-white">4.8%</span>
                      </div>
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-bold text-xs rounded-lg border border-emerald-500/30">
                        Low Risk
                      </span>
                    </div>

                    <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-emerald-400 h-2.5 rounded-full" style={{ width: '4.8%' }}></div>
                    </div>
                  </div>

                  {/* Key Features Mini List */}
                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <span className="text-ink-muted font-medium">Debt-to-Income (DTI)</span>
                      <span className="font-semibold text-ink">0.24 (Healthy)</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <span className="text-ink-muted font-medium">Credit Score</span>
                      <span className="font-semibold text-ink">760 pts (Good)</span>
                    </div>
                  </div>
                </div>

                {/* Floating Decorative Badges */}
                <div className="absolute -top-4 -right-4 bg-white p-3 rounded-2xl shadow-glass border border-slate-200 z-20 hidden sm:flex items-center gap-2.5 text-xs font-semibold text-ink">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <span>ROC-AUC 0.758</span>
                </div>

                <div className="absolute -bottom-4 -left-4 bg-white p-3 rounded-2xl shadow-glass border border-slate-200 z-20 hidden sm:flex items-center gap-2.5 text-xs font-semibold text-ink">
                  <div className="w-7 h-7 rounded-lg bg-tealAccent-light text-tealAccent flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <span>What-If Explainable ML</span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 3 Main Feature Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <h2 className="text-3xl font-bold font-display text-ink tracking-tight">
            Designed for Modern Credit Assessment
          </h2>
          <p className="text-ink-muted text-base">
            Engineered with strict machine learning standards, real-time explainability, and enterprise privacy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Fast */}
          <div className="glass-panel p-8 rounded-3xl border border-slate-200 shadow-soft hover:shadow-card-hover transition-all duration-300 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-display text-ink">Sub-50ms Inference</h3>
            <p className="text-ink-muted text-sm leading-relaxed">
              Optimized scikit-learn Gradient Boosting pipeline loaded directly into memory for lightning-fast real-time scoring.
            </p>
          </div>

          {/* Card 2: Explainable */}
          <div className="glass-panel p-8 rounded-3xl border border-slate-200 shadow-soft hover:shadow-card-hover transition-all duration-300 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-tealAccent-light text-tealAccent flex items-center justify-center border border-tealAccent/20">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-display text-ink">What-If Explainability</h3>
            <p className="text-ink-muted text-sm leading-relaxed">
              No black boxes. Per-prediction sensitivity analysis evaluates feature impact against baseline training medians to isolate key risk drivers.
            </p>
          </div>

          {/* Card 3: Secure */}
          <div className="glass-panel p-8 rounded-3xl border border-slate-200 shadow-soft hover:shadow-card-hover transition-all duration-300 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-display text-ink">Stateless & Secure</h3>
            <p className="text-ink-muted text-sm leading-relaxed">
              Applicant data is processed strictly in-memory during evaluation and never persisted to databases or third-party servers.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Strip (3 Steps) */}
      <section className="bg-white/80 border-y border-slate-200/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-tealAccent uppercase tracking-widest">Workflow</span>
            <h2 className="text-3xl font-bold font-display text-ink tracking-tight">How LoanSight Evaluates Risk</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-canvas-subtle p-6 rounded-2xl border border-slate-200/70 space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-tealAccent text-white font-bold font-display text-sm flex items-center justify-center">
                1
              </span>
              <h4 className="font-display font-bold text-ink text-lg">Provide Applicant Data</h4>
              <p className="text-ink-muted text-sm leading-relaxed">
                Enter 16 borrower parameters spanning employment, income, credit profile, and requested loan terms into our guided wizard.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-canvas-subtle p-6 rounded-2xl border border-slate-200/70 space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-tealAccent text-white font-bold font-display text-sm flex items-center justify-center">
                2
              </span>
              <h4 className="font-display font-bold text-ink text-lg">Machine Learning Pipeline</h4>
              <p className="text-ink-muted text-sm leading-relaxed">
                The payload is cleaned with saved IQR bounds, scaled with StandardScaler, and evaluated against 150 gradient boosted decision trees.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-canvas-subtle p-6 rounded-2xl border border-slate-200/70 space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-tealAccent text-white font-bold font-display text-sm flex items-center justify-center">
                3
              </span>
              <h4 className="font-display font-bold text-ink text-lg">Actionable Verdict & Report</h4>
              <p className="text-ink-muted text-sm leading-relaxed">
                Receive an instant probability score, risk level badge (Low/Medium/High), top explanatory factors, and downloadable summary report.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-10 sm:p-14 text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-white">
              Ready to Evaluate a Loan Profile?
            </h2>
            <p className="text-slate-300 text-base">
              Test applicant scenarios using live custom parameters or fill instant sample data with one click.
            </p>
          </div>

          <div className="relative z-10 pt-2">
            <button
              onClick={() => navigate('/predict')}
              className="px-8 py-4 bg-tealAccent hover:bg-tealAccent-hover text-white font-bold text-base rounded-2xl transition-all shadow-lg shadow-tealAccent/30 hover:scale-105"
            >
              Start Free Assessment Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
