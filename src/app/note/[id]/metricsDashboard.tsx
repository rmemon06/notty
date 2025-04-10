import React from 'react';

interface MetricsDashboardProps {
  wordCount: number;
  characterCount?: number;
  readingTime?: number; // in minutes
}

const MetricsDashboard: React.FC<MetricsDashboardProps> = ({
  wordCount,
  characterCount,
  readingTime,
}) => {
  return (
    <div className="p-4 border border-gray-200 rounded-lg shadow-sm bg-white mt-4">
      <h3 className="text-lg font-bold mb-2">Metrics Dashboard</h3>
      <ul className="list-disc ml-5 space-y-1">
        <li>Word Count: {wordCount}</li>
        {characterCount !== undefined && <li>Character Count: {characterCount}</li>}
        {readingTime !== undefined && <li>Estimated Reading Time: {readingTime} min</li>}
      </ul>
    </div>
  );
};

export default MetricsDashboard;
