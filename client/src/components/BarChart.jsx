
// src/components/BarChart.jsx
import React from 'react';
const BarChart = ({ data }) => {
  const maxScore = Math.max(...data.map(item => item.score));
  
  return (
    <div className="space-y-4">
      {data.map((platform, index) => (
        <div key={platform.platform} className="relative" style={{ animationDelay: `${index * 200}ms` }}>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center space-x-3">
              <span className="font-semibold text-gray-800 text-sm sm:text-base">{platform.platform}</span>
            </div>
            <span className="text-xs sm:text-sm font-bold text-[#071225] px-2 py-0.5 bg-gray-100 rounded-full animate-bounce">
              {platform.score}
            </span>
          </div>
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-2.5 sm:h-3 shadow-inner">
              <div className="bg-[#071225] h-2.5 sm:h-3 rounded-full transition-all duration-1000 ease-out shadow-md relative overflow-hidden animate-pulse" style={{ width: `${(platform.score / maxScore) * 100}%` }}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-20"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
export default BarChart;
