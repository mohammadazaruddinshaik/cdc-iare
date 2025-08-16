
// src/components/DonutChart.jsx
import React from 'react';
const DonutChart = ({ percentage, presentColor, absentColor }) => {
  const radius = 40;
  const strokeWidth = 10;
  const innerRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * innerRadius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={innerRadius} fill="none" stroke={absentColor || "#374151"} strokeWidth={strokeWidth} />
        <circle cx="50" cy="50" r={innerRadius} fill="none" stroke={presentColor} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 50 50)" className="transition-all duration-1000 ease-out" />
      </svg>
      <span className="absolute text-lg sm:text-xl font-bold text-white animate-pulse">{percentage}%</span>
    </div>
  );
};
export default DonutChart;

