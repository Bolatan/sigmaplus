import React from 'react';

const MarketResearch: React.FC = () => {
  return (
    <div className="flex h-screen">
      <div className="w-1/4 bg-gray-200 p-4">
        <h2 className="text-xl font-bold mb-4">Tools</h2>
        <ul>
          <li className="cursor-pointer p-2 hover:bg-gray-300">Tool 1</li>
          <li className="cursor-pointer p-2 hover:bg-gray-300">Tool 2</li>
          <li className="cursor-pointer p-2 hover:bg-gray-300">Tool 3</li>
        </ul>
      </div>
      <div className="w-3/4 p-4">
        <h1 className="text-3xl font-bold mb-4">Market Research Tools</h1>
        <div>
          <p>Select a tool to use.</p>
        </div>
      </div>
    </div>
  );
};

export default MarketResearch;
