import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Check, ChevronRight, ChevronLeft, RefreshCw, AlertTriangle,
  GraduationCap, Award, BookOpen, Sparkles, Briefcase, Clock, UserCheck, AlertCircle,
  User, Heart, Users, Car, Building, Home as HomeIcon, HelpCircle, Download, RotateCcw,
  Sparkle, ShieldCheck, Edit3, Info, FileSpreadsheet
} from 'lucide-react';

import { predictLoanDefault } from '../lib/api';
import { FORM_STEPS, DEFAULT_FORM_VALUES, FIELD_METADATA } from '../constants/fields';
import LoanSnapshot from '../components/LoanSnapshot';
import ResultGauge from '../components/ResultGauge';

export default function Predict() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(DEFAULT_FORM_VALUES);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [predictedInputs, setPredictedInputs] = useState(null);
  const [apiError, setApiError] = useState(null);

  const abortControllerRef = useRef(null);

  // Clear result state when leaving page or mounting
  useEffect(() => {
    setResult(null);
    setPredictedInputs(null);
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Helper for input change: immediately clears any existing prediction result!
  const handleChange = (field, value) => {
    if (result) {
      setResult(null);
      setPredictedInputs(null);
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Helper for currency formatting input
  const handleCurrencyChange = (field, rawString) => {
    const numericStr = rawString.replace(/[^0-9]/g, '');
    const numVal = numericStr ? parseInt(numericStr, 10) : 0;
    handleChange(field, numVal);
  };

  // Step Validation
  const validateStep = (stepIdx) => {
    const newErrors = {};
    const stepObj = FORM_STEPS[stepIdx];

    if (!stepObj || stepObj.id === 'review') return true;

    stepObj.fields.forEach((field) => {
      const val = formData[field];
      const meta = FIELD_METADATA[field];

      if (val === undefined || val === null || val === '') {
        newErrors[field] = 'This field is required';
      } else if (meta && meta.min !== undefined && val < meta.min) {
        newErrors[field] = `Must be at least ${meta.min}`;
      } else if (meta && meta.max !== undefined && val > meta.max) {
        newErrors[field] = `Must be at most ${meta.max}`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < FORM_STEPS.length - 1) {
        setCurrentStep((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleBack = () => {
    if (result) {
      setResult(null);
      setPredictedInputs(null);
    }
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Submit Prediction with AbortController to prevent out-of-order race conditions
  const handleSubmit = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setResult(null);
    setPredictedInputs(null);
    setLoading(true);
    setApiError(null);

    const snapshotInputs = { ...formData };

    try {
      await new Promise((res) => setTimeout(res, 600));
      const response = await predictLoanDefault(snapshotInputs, abortControllerRef.current.signal);
      
      setResult(response);
      setPredictedInputs(snapshotInputs);

      if (response.prediction === 0) {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
        console.log('Request cancelled by user or newer prediction.');
        return;
      }
      console.error('Prediction API error:', err);
      setApiError(
        err.response?.data?.detail || 
        'Failed to connect to backend server on port 8001. Ensure run_backend.bat is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Render Category Icon
  const renderIcon = (iconName) => {
    switch (iconName) {
      case 'GraduationCap': return <GraduationCap className="w-5 h-5" />;
      case 'Award': return <Award className="w-5 h-5" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5" />;
      case 'Briefcase': return <Briefcase className="w-5 h-5" />;
      case 'Clock': return <Clock className="w-5 h-5" />;
      case 'UserCheck': return <UserCheck className="w-5 h-5" />;
      case 'AlertCircle': return <AlertCircle className="w-5 h-5" />;
      case 'User': return <User className="w-5 h-5" />;
      case 'Heart': return <Heart className="w-5 h-5" />;
      case 'Users': return <Users className="w-5 h-5" />;
      case 'Car': return <Car className="w-5 h-5" />;
      case 'Building': return <Building className="w-5 h-5" />;
      case 'Home': return <HomeIcon className="w-5 h-5" />;
      default: return <HelpCircle className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header title */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <span className="text-xs font-bold text-tealAccent uppercase tracking-widest">
          Risk Assessment Wizard
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-ink tracking-tight">
          Loan Default Evaluation
        </h1>
        <p className="text-ink-muted text-sm sm:text-base">
          Complete the guided profile fields below to generate an ML risk prediction.
        </p>
      </div>

      {/* Main Container */}
      {!result ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Wizard Column */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Progress Bar & Steps Header */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-200 shadow-soft">
              {/* Step Navigation Strip */}
              <div className="flex items-center justify-between mb-4 overflow-x-auto pb-2 scrollbar-none">
                {FORM_STEPS.map((step, idx) => {
                  const isCompleted = idx < currentStep;
                  const isCurrent = idx === currentStep;
                  return (
                    <div
                      key={step.id}
                      onClick={() => isCompleted && setCurrentStep(idx)}
                      className={`flex items-center gap-2 flex-shrink-0 cursor-pointer ${
                        isCompleted ? 'text-tealAccent font-semibold' : (isCurrent ? 'text-ink font-bold' : 'text-slate-400')
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isCompleted
                            ? 'bg-tealAccent text-white'
                            : (isCurrent ? 'bg-ink text-white ring-4 ring-ink/10' : 'bg-slate-200 text-slate-500')
                        }`}
                      >
                        {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
                      </div>
                      <span className="text-xs font-display hidden sm:inline">{step.shortTitle}</span>
                      {idx < FORM_STEPS.length - 1 && (
                        <div className="w-4 sm:w-8 h-0.5 bg-slate-200 mx-1"></div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Progress Line */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-tealAccent h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / FORM_STEPS.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Form Step Body */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-soft">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-xl font-bold font-display text-ink">
                      {FORM_STEPS[currentStep].title}
                    </h2>
                    <p className="text-xs text-ink-muted mt-1">
                      {FORM_STEPS[currentStep].description}
                    </p>
                  </div>

                  {/* Step 1: Personal */}
                  {currentStep === 0 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm font-semibold text-ink">
                          <label htmlFor="input-age">Age (Years)</label>
                          <span className="font-mono text-tealAccent font-bold text-base px-2.5 py-0.5 bg-tealAccent/10 rounded-lg">
                            {formData.Age} yrs
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min="18"
                            max="69"
                            step="1"
                            value={formData.Age}
                            onChange={(e) => handleChange('Age', parseInt(e.target.value, 10))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-tealAccent"
                          />
                          <input
                            id="input-age"
                            type="number"
                            min="18"
                            max="69"
                            value={formData.Age}
                            onChange={(e) => handleChange('Age', parseInt(e.target.value, 10) || 18)}
                            className="w-20 px-3 py-1.5 border border-slate-300 rounded-xl text-sm font-semibold text-center focus:ring-2 focus:ring-tealAccent outline-none"
                          />
                        </div>
                        <div className="flex justify-between text-[11px] text-ink-muted">
                          <span>Min: 18</span>
                          <span>Max: 69</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-ink block">Education Level</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {FIELD_METADATA.Education.map((item) => {
                            const selected = formData.Education === item.value;
                            return (
                              <button
                                key={item.value}
                                type="button"
                                onClick={() => handleChange('Education', item.value)}
                                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-xs font-semibold transition-all gap-2 ${
                                  selected
                                    ? 'border-tealAccent bg-tealAccent/10 text-tealAccent ring-2 ring-tealAccent/20'
                                    : 'border-slate-200 bg-white text-ink-muted hover:border-slate-300 hover:text-ink'
                                }`}
                              >
                                {renderIcon(item.icon)}
                                <span>{item.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-ink block">Marital Status</label>
                        <div className="grid grid-cols-3 gap-3">
                          {FIELD_METADATA.MaritalStatus.map((item) => {
                            const selected = formData.MaritalStatus === item.value;
                            return (
                              <button
                                key={item.value}
                                type="button"
                                onClick={() => handleChange('MaritalStatus', item.value)}
                                className={`flex items-center justify-center p-3 rounded-2xl border text-xs font-semibold transition-all gap-2 ${
                                  selected
                                    ? 'border-tealAccent bg-tealAccent/10 text-tealAccent ring-2 ring-tealAccent/20'
                                    : 'border-slate-200 bg-white text-ink-muted hover:border-slate-300 hover:text-ink'
                                }`}
                              >
                                {renderIcon(item.icon)}
                                <span>{item.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                        <div>
                          <span className="text-sm font-semibold text-ink block">Has Dependents</span>
                          <span className="text-xs text-ink-muted">Children or dependent family members</span>
                        </div>
                        <div className="flex items-center bg-slate-200 p-1 rounded-xl">
                          {['Yes', 'No'].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleChange('HasDependents', opt)}
                              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                formData.HasDependents === opt
                                  ? 'bg-white text-ink shadow-sm'
                                  : 'text-ink-muted hover:text-ink'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Employment & Income */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-ink block">Employment Status</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {FIELD_METADATA.EmploymentType.map((item) => {
                            const selected = formData.EmploymentType === item.value;
                            return (
                              <button
                                key={item.value}
                                type="button"
                                onClick={() => handleChange('EmploymentType', item.value)}
                                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-xs font-semibold transition-all gap-2 ${
                                  selected
                                    ? 'border-tealAccent bg-tealAccent/10 text-tealAccent ring-2 ring-tealAccent/20'
                                    : 'border-slate-200 bg-white text-ink-muted hover:border-slate-300 hover:text-ink'
                                }`}
                              >
                                {renderIcon(item.icon)}
                                <span>{item.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm font-semibold text-ink">
                          <label htmlFor="input-months-employed">Months Employed</label>
                          <span className="font-mono text-tealAccent font-bold text-base px-2.5 py-0.5 bg-tealAccent/10 rounded-lg">
                            {formData.MonthsEmployed} mos
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min="0"
                            max="119"
                            step="1"
                            value={formData.MonthsEmployed}
                            onChange={(e) => handleChange('MonthsEmployed', parseInt(e.target.value, 10))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-tealAccent"
                          />
                          <input
                            id="input-months-employed"
                            type="number"
                            min="0"
                            max="119"
                            value={formData.MonthsEmployed}
                            onChange={(e) => handleChange('MonthsEmployed', parseInt(e.target.value, 10) || 0)}
                            className="w-20 px-3 py-1.5 border border-slate-300 rounded-xl text-sm font-semibold text-center focus:ring-2 focus:ring-tealAccent outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="input-income" className="text-sm font-semibold text-ink block">
                          Annual Income (INR)
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-ink-muted font-bold">
                            ₹
                          </span>
                          <input
                            id="input-income"
                            type="text"
                            value={formData.Income ? formData.Income.toLocaleString() : ''}
                            onChange={(e) => handleCurrencyChange('Income', e.target.value)}
                            placeholder="75,000"
                            className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-2xl text-base font-semibold focus:ring-2 focus:ring-tealAccent outline-none"
                          />
                        </div>
                        <span className="text-[11px] text-ink-muted block">Allowed range: ₹15,000 – ₹149,999</span>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Credit Profile */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm font-semibold text-ink">
                          <label htmlFor="input-credit-score">Credit Score</label>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-ink">
                              {formData.CreditScore >= 740 ? 'Excellent' : formData.CreditScore >= 670 ? 'Good' : formData.CreditScore >= 580 ? 'Fair' : 'Poor'}
                            </span>
                            <span className="font-mono text-tealAccent font-bold text-base px-2.5 py-0.5 bg-tealAccent/10 rounded-lg">
                              {formData.CreditScore}
                            </span>
                          </div>
                        </div>

                        <input
                          id="input-credit-score"
                          type="range"
                          min="300"
                          max="849"
                          step="1"
                          value={formData.CreditScore}
                          onChange={(e) => handleChange('CreditScore', parseInt(e.target.value, 10))}
                          className="w-full h-3 rounded-lg appearance-none cursor-pointer credit-slider"
                        />
                        <div className="flex justify-between text-[11px] text-ink-muted font-medium">
                          <span className="text-rose-600">Poor (300)</span>
                          <span className="text-amber-600">Fair (580)</span>
                          <span className="text-emerald-600">Good (670)</span>
                          <span className="text-teal-600">Excellent (849)</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-ink block">Open Credit Lines</label>
                        <div className="grid grid-cols-4 gap-3">
                          {[1, 2, 3, 4].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => handleChange('NumCreditLines', num)}
                              className={`py-3 rounded-2xl border text-sm font-bold transition-all ${
                                formData.NumCreditLines === num
                                  ? 'border-tealAccent bg-tealAccent/10 text-tealAccent ring-2 ring-tealAccent/20'
                                  : 'border-slate-200 bg-white text-ink-muted hover:border-slate-300 hover:text-ink'
                              }`}
                            >
                              {num} {num === 1 ? 'line' : 'lines'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm font-semibold text-ink">
                          <label htmlFor="input-dti">Debt-to-Income (DTI) Ratio</label>
                          <span className="font-mono text-tealAccent font-bold text-base px-2.5 py-0.5 bg-tealAccent/10 rounded-lg">
                            {(formData.DTIRatio * 100).toFixed(0)}% ({formData.DTIRatio})
                          </span>
                        </div>
                        <input
                          id="input-dti"
                          type="range"
                          min="0.10"
                          max="0.90"
                          step="0.01"
                          value={formData.DTIRatio}
                          onChange={(e) => handleChange('DTIRatio', parseFloat(e.target.value))}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-tealAccent"
                        />
                        <div className="flex justify-between text-[11px] text-ink-muted">
                          <span>Low Debt (0.10)</span>
                          <span>Moderate (0.40)</span>
                          <span>High Burden (0.90)</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                        <div>
                          <span className="text-sm font-semibold text-ink block">Has Active Mortgage</span>
                          <span className="text-xs text-ink-muted">Existing home mortgage loan</span>
                        </div>
                        <div className="flex items-center bg-slate-200 p-1 rounded-xl">
                          {['Yes', 'No'].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleChange('HasMortgage', opt)}
                              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                formData.HasMortgage === opt
                                  ? 'bg-white text-ink shadow-sm'
                                  : 'text-ink-muted hover:text-ink'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Loan Details */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label htmlFor="input-loan-amount" className="text-sm font-semibold text-ink block">
                          Requested Loan Amount (INR)
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-ink-muted font-bold">
                            ₹
                          </span>
                          <input
                            id="input-loan-amount"
                            type="text"
                            value={formData.LoanAmount ? formData.LoanAmount.toLocaleString() : ''}
                            onChange={(e) => handleCurrencyChange('LoanAmount', e.target.value)}
                            placeholder="25,000"
                            className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-2xl text-base font-semibold focus:ring-2 focus:ring-tealAccent outline-none"
                          />
                        </div>
                        <span className="text-[11px] text-ink-muted block">Allowed range: ₹5,000 – ₹249,999</span>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-ink block">Loan Duration (Months)</label>
                        <div className="grid grid-cols-5 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                          {[12, 24, 36, 48, 60].map((term) => (
                            <button
                              key={term}
                              type="button"
                              onClick={() => handleChange('LoanTerm', term)}
                              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                                formData.LoanTerm === term
                                  ? 'bg-white text-ink shadow-sm'
                                  : 'text-ink-muted hover:text-ink'
                              }`}
                            >
                              {term}m
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm font-semibold text-ink">
                          <label htmlFor="input-interest-rate">Interest Rate (%)</label>
                          <span className="font-mono text-tealAccent font-bold text-base px-2.5 py-0.5 bg-tealAccent/10 rounded-lg">
                            {formData.InterestRate}% APR
                          </span>
                        </div>
                        <input
                          id="input-interest-rate"
                          type="range"
                          min="2.0"
                          max="25.0"
                          step="0.1"
                          value={formData.InterestRate}
                          onChange={(e) => handleChange('InterestRate', parseFloat(e.target.value))}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-tealAccent"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-ink block">Loan Purpose</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {FIELD_METADATA.LoanPurpose.map((item) => {
                            const selected = formData.LoanPurpose === item.value;
                            return (
                              <button
                                key={item.value}
                                type="button"
                                onClick={() => handleChange('LoanPurpose', item.value)}
                                className={`flex items-center p-3 rounded-2xl border text-xs font-semibold transition-all gap-2 ${
                                  selected
                                    ? 'border-tealAccent bg-tealAccent/10 text-tealAccent ring-2 ring-tealAccent/20'
                                    : 'border-slate-200 bg-white text-ink-muted hover:border-slate-300 hover:text-ink'
                                }`}
                              >
                                {renderIcon(item.icon)}
                                <span>{item.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                        <div>
                          <span className="text-sm font-semibold text-ink block">Has Co-Signer</span>
                          <span className="text-xs text-ink-muted">Additional credit guarantor</span>
                        </div>
                        <div className="flex items-center bg-slate-200 p-1 rounded-xl">
                          {['Yes', 'No'].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleChange('HasCoSigner', opt)}
                              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                formData.HasCoSigner === opt
                                  ? 'bg-white text-ink shadow-sm'
                                  : 'text-ink-muted hover:text-ink'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 5: Review & Predict */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-ink-muted">
                        Please review all 16 applicant parameters below. You can click any section to make edits before submitting for ML evaluation.
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div
                          onClick={() => setCurrentStep(0)}
                          className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-tealAccent/40 transition-all cursor-pointer space-y-2 group"
                        >
                          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                            <span className="font-bold text-ink text-xs">Personal Profile</span>
                            <Edit3 className="w-3.5 h-3.5 text-slate-400 group-hover:text-tealAccent" />
                          </div>
                          <div className="text-xs space-y-1 text-ink-muted">
                            <div>Age: <strong className="text-ink">{formData.Age} yrs</strong></div>
                            <div>Education: <strong className="text-ink">{formData.Education}</strong></div>
                            <div>Marital: <strong className="text-ink">{formData.MaritalStatus}</strong></div>
                            <div>Dependents: <strong className="text-ink">{formData.HasDependents}</strong></div>
                          </div>
                        </div>

                        <div
                          onClick={() => setCurrentStep(1)}
                          className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-tealAccent/40 transition-all cursor-pointer space-y-2 group"
                        >
                          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                            <span className="font-bold text-ink text-xs">Employment & Income</span>
                            <Edit3 className="w-3.5 h-3.5 text-slate-400 group-hover:text-tealAccent" />
                          </div>
                          <div className="text-xs space-y-1 text-ink-muted">
                            <div>Employment: <strong className="text-ink">{formData.EmploymentType}</strong></div>
                            <div>Duration: <strong className="text-ink">{formData.MonthsEmployed} mos</strong></div>
                            <div>Income: <strong className="text-ink">₹{formData.Income.toLocaleString()}</strong></div>
                          </div>
                        </div>

                        <div
                          onClick={() => setCurrentStep(2)}
                          className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-tealAccent/40 transition-all cursor-pointer space-y-2 group"
                        >
                          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                            <span className="font-bold text-ink text-xs">Credit Profile</span>
                            <Edit3 className="w-3.5 h-3.5 text-slate-400 group-hover:text-tealAccent" />
                          </div>
                          <div className="text-xs space-y-1 text-ink-muted">
                            <div>Score: <strong className="text-ink">{formData.CreditScore} pts</strong></div>
                            <div>Credit Lines: <strong className="text-ink">{formData.NumCreditLines}</strong></div>
                            <div>DTI Ratio: <strong className="text-ink">{(formData.DTIRatio * 100).toFixed(0)}%</strong></div>
                            <div>Mortgage: <strong className="text-ink">{formData.HasMortgage}</strong></div>
                          </div>
                        </div>

                        <div
                          onClick={() => setCurrentStep(3)}
                          className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-tealAccent/40 transition-all cursor-pointer space-y-2 group"
                        >
                          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                            <span className="font-bold text-ink text-xs">Loan Terms</span>
                            <Edit3 className="w-3.5 h-3.5 text-slate-400 group-hover:text-tealAccent" />
                          </div>
                          <div className="text-xs space-y-1 text-ink-muted">
                            <div>Amount: <strong className="text-ink">₹{formData.LoanAmount.toLocaleString()}</strong></div>
                            <div>Term: <strong className="text-ink">{formData.LoanTerm} months</strong></div>
                            <div>Rate: <strong className="text-ink">{formData.InterestRate}% APR</strong></div>
                            <div>Co-Signer: <strong className="text-ink">{formData.HasCoSigner}</strong></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation Button Bar */}
                  <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={currentStep === 0 || loading}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        currentStep === 0
                          ? 'opacity-0 cursor-default'
                          : 'bg-slate-100 text-ink-muted hover:bg-slate-200 hover:text-ink'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </button>

                    {currentStep < FORM_STEPS.length - 1 ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="flex items-center gap-2 px-6 py-3 bg-tealAccent hover:bg-tealAccent-hover text-white text-sm font-bold rounded-xl shadow-md transition-all"
                      >
                        Next Step
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-tealAccent to-emerald-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-tealAccent/25 hover:shadow-xl transition-all"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Evaluating 16 Risk Signals...
                          </>
                        ) : (
                          <>
                            <Sparkle className="w-4 h-4" />
                            Run Default Prediction
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Live Loan Snapshot Side Panel (Desktop) */}
          <div className="lg:col-span-4">
            <LoanSnapshot formData={formData} />
          </div>
        </div>
      ) : (
        /* Result View (Clean, Honest, Displaying Exact Evaluated Inputs) */
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          {/* Demo Mode Banner if active */}
          {result.demo_mode && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-800 text-sm">
              <Info className="w-5 h-5 text-amber-600 shrink-0" />
              <span>
                <strong>Demo Mode Active:</strong> Running on mock heuristics because model files were not loaded in backend/model/.
              </span>
            </div>
          )}

          {/* Main Verdict Header Card */}
          <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-glass text-center space-y-6">
            <span className="text-xs font-bold text-ink-muted uppercase tracking-widest">
              Evaluation Verdict
            </span>

            {/* Semicircle Gauge */}
            <ResultGauge
              probability={result.default_probability}
              riskLevel={result.risk_level}
            />

            {/* Verdict Badge */}
            <div className="pt-2">
              <div
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-base font-extrabold font-display border shadow-sm ${
                  result.prediction === 0
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-rose-50 text-rose-700 border-rose-300'
                }`}
              >
                <ShieldCheck className="w-5 h-5" />
                {result.label}
              </div>
            </div>

            <p className="text-ink-muted text-sm max-w-lg mx-auto leading-relaxed">
              Based on the evaluated applicant parameters, the trained Gradient Boosting model predicts a 
              <strong className="text-ink"> {(result.default_probability * 100).toFixed(1)}% default probability</strong>.
            </p>
          </div>

          {/* Exact Evaluated Inputs Recap Card */}
          {predictedInputs && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-soft space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-display font-bold text-ink text-base flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-tealAccent" />
                  Evaluated Input Profile
                </h3>
                <span className="text-[11px] font-mono text-ink-muted bg-slate-100 px-2 py-0.5 rounded-md">
                  Exact Evaluated Parameters
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-ink-muted block text-[10px]">Age</span>
                  <span className="font-bold text-ink">{predictedInputs.Age} yrs</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-ink-muted block text-[10px]">Annual Income</span>
                  <span className="font-bold text-ink">₹{predictedInputs.Income?.toLocaleString()}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-ink-muted block text-[10px]">Loan Amount</span>
                  <span className="font-bold text-ink">₹{predictedInputs.LoanAmount?.toLocaleString()}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-ink-muted block text-[10px]">Credit Score</span>
                  <span className="font-bold text-ink">{predictedInputs.CreditScore} pts</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-ink-muted block text-[10px]">Employment</span>
                  <span className="font-bold text-ink">{predictedInputs.EmploymentType} ({predictedInputs.MonthsEmployed}m)</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-ink-muted block text-[10px]">DTI Ratio</span>
                  <span className="font-bold text-ink">{(predictedInputs.DTIRatio * 100).toFixed(0)}%</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-ink-muted block text-[10px]">Interest Rate</span>
                  <span className="font-bold text-ink">{predictedInputs.InterestRate}% APR</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-ink-muted block text-[10px]">Term & Co-Signer</span>
                  <span className="font-bold text-ink">{predictedInputs.LoanTerm}m / Co-Signer: {predictedInputs.HasCoSigner}</span>
                </div>
              </div>
            </div>
          )}

          {/* What-If Key Factors Section */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-soft space-y-4">
            <h3 className="font-display font-bold text-ink text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-tealAccent" />
              Key What-If Risk Drivers
            </h3>
            <p className="text-xs text-ink-muted">
              Sensitivity analysis comparing applicant parameters against baseline training medians:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {result.top_factors.map((factor, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 flex items-start gap-3 text-xs text-ink font-medium leading-relaxed"
                >
                  <div className="w-6 h-6 rounded-lg bg-tealAccent/15 text-tealAccent flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>{factor}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons: ONLY Edit Inputs & Download Report */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
            <button
              onClick={() => {
                setResult(null);
                setPredictedInputs(null);
              }}
              className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-ink text-sm font-semibold rounded-2xl transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Edit Inputs
            </button>

            <button
              onClick={() => window.print()}
              className="px-6 py-3.5 bg-tealAccent hover:bg-tealAccent-hover text-white text-sm font-bold rounded-2xl shadow-md transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Report
            </button>
          </div>

          {/* Educational Disclaimer */}
          <div className="text-center text-xs text-ink-muted pt-2 border-t border-slate-200/60">
            Educational project. Not financial advice.
          </div>
        </motion.div>
      )}

      {/* Graceful API Error State */}
      {apiError && (
        <div className="max-w-md mx-auto p-6 glass-panel rounded-2xl border border-rose-200 bg-rose-50/50 text-center space-y-4">
          <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto" />
          <h3 className="font-bold text-rose-900 text-sm">Backend Service Error</h3>
          <p className="text-xs text-rose-700 leading-relaxed">{apiError}</p>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-xl shadow-sm hover:bg-rose-700"
          >
            Retry Prediction
          </button>
        </div>
      )}
    </div>
  );
}
