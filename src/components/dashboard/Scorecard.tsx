import React from 'react';

interface ScorecardProps {
  title: string;
  value: string;
}

const Scorecard: React.FC<ScorecardProps> = ({ title, value }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

export default Scorecard;
