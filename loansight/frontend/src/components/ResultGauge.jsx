import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function ResultGauge({ probability = 0.12, riskLevel = 'Low' }) {
  const percentage = Math.min(Math.max(probability * 100, 0), 100);
  const [displayValue, setDisplayValue] = useState(0);

  // Count up animation
  useEffect(() => {
    let start = 0;
    const end = percentage;
    const duration = 1200; // ms
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [percentage]);

  // Color by risk level
  let strokeColor = '#10B981'; // Green (Low)
  let badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (riskLevel === 'High') {
    strokeColor = '#E11D48'; // Red (High)
    badgeBg = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (riskLevel === 'Medium') {
    strokeColor = '#D97706'; // Amber (Medium)
    badgeBg = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  // SVG Gauge calculations
  // Semi-circle radius = 80, center = (100, 100)
  // Arc stroke length for semi-circle (PI * R) = PI * 80 ≈ 251.32
  const strokeDasharray = 251.32;
  const strokeDashoffset = strokeDasharray - (strokeDasharray * (displayValue / 100));

  return (
    <div className="flex flex-col items-center justify-center relative py-4">
      <div className="relative w-64 h-36 flex items-center justify-center">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 200 120">
          {/* Background Track Arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Animated Value Arc */}
          <motion.path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={strokeColor}
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            transition={{ duration: 0.1, ease: "easeOut" }}
          />
        </svg>

        {/* Inner Counter Text */}
        <div className="absolute bottom-2 flex flex-col items-center text-center">
          <span className="text-4xl font-extrabold font-display tracking-tight text-ink">
            {displayValue.toFixed(1)}%
          </span>
          <span className="text-xs font-medium text-ink-muted uppercase tracking-wider mt-0.5">
            Default Probability
          </span>
        </div>
      </div>

      {/* Risk Level Badge */}
      <div className="mt-3">
        <span className={`inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold border ${badgeBg}`}>
          <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: strokeColor }}></span>
          {riskLevel} Risk Profile
        </span>
      </div>
    </div>
  );
}
