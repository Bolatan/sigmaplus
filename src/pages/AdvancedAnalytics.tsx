import React from 'react';

const AdvancedAnalytics: React.FC = () => {
  return (
    <div className="flex h-screen">
      <div className="w-1/4 bg-gray-200 p-4">
        <h2 className="text-xl font-bold mb-4">Reports</h2>
        <ul>
          <li className="cursor-pointer p-2 hover:bg-gray-300">Report 1</li>
          <li className="cursor-pointer p-2 hover:bg-gray-300">Report 2</li>
          <li className="cursor-pointer p-2 hover:bg-gray-300">Report 3</li>
        </ul>
      </div>
      <div className="w-3/4 p-4">
        <h1 className="text-3xl font-bold mb-4">Advanced Analytics & Reporting</h1>
        <div>
          <p>Select a report to view.</p>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
