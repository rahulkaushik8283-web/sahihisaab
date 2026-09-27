import React from 'react';

export const GaugeChart = ({ score = 75, maxScore = 100, color = "#16A085" }) => {
  const radius = 70;
  const strokeWidth = 14;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  
  // Half-circle arc progress (180 deg)
  const strokeDashoffset = circumference - ((score / maxScore) * (circumference / 2));

  return (
    <div className="gauge-wrapper">
      <svg height="180" width="180" viewBox="0 0 180 180" style={{ transform: 'rotate(-90deg)' }}>
        {/* Background track */}
        <circle
          stroke="#E2E8F0"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference / 2} ${circumference}`}
          r={normalizedRadius}
          cx="90"
          cy="90"
          strokeLinecap="round"
        />
        {/* Animated Progress Fill */}
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference / 2} ${circumference}`}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease-in-out' }}
          r={normalizedRadius}
          cx="90"
          cy="90"
          strokeLinecap="round"
        />
      </svg>
      <div className="gauge-score-value">
        <span className="gauge-score-num" style={{ color }}>{score}</span>
        <span className="gauge-score-max">/ {maxScore}</span>
      </div>
    </div>
  );
};
