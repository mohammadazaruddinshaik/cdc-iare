import React from 'react';

// Define a color mapping for each platform
const platformColors = {
  'GeeksforGeeks': 'bg-gradient-to-r from-green-400 to-green-600',
  'LeetCode': 'bg-gradient-to-r from-yellow-400 to-orange-500',
  'CodeChef': 'bg-gradient-to-r from-blue-400 to-indigo-600',
};

const BarChart = ({ data }) => {
  // If data is not an array or is empty, show a fallback message
  if (!Array.isArray(data) || data.length === 0) {
    return (
        <div className="text-center text-gray-500 py-8">
            <p>No coding scores available.</p>
            <p className="text-sm mt-2">Start coding to see your performance!</p>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      {data.map((item, index) => {
        // Calculate percentage based on the specific maxScore for each platform
        const percentage = item.maxScore > 0 ? (item.score / item.maxScore) * 100 : 0;
        
        // Get the specific color for the platform, with a default fallback
        const barColor = platformColors[item.platform] || 'bg-gray-500';

        return (
          <div key={item.platform} style={{ animation: `fadeInUp 0.5s ease-out ${index * 150}ms forwards`, opacity: 0 }}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-semibold text-gray-700">{item.platform}</span>
              <span className="text-xs font-bold text-gray-600">
                {item.score} / {item.maxScore}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner overflow-hidden">
              <div
                className={`${barColor} h-3 rounded-full transition-all duration-1000 ease-out`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BarChart;