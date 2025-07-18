import React from 'react';

const CollaborationFeatures: React.FC = () => {
  return (
    <div className="flex h-screen">
      <div className="w-1/4 bg-gray-200 p-4">
        <h2 className="text-xl font-bold mb-4">Teams</h2>
        <ul>
          <li className="cursor-pointer p-2 hover:bg-gray-300">Team 1</li>
          <li className="cursor-pointer p-2 hover:bg-gray-300">Team 2</li>
          <li className="cursor-pointer p-2 hover:bg-gray-300">Team 3</li>
        </ul>
      </div>
      <div className="w-3/4 p-4">
        <h1 className="text-3xl font-bold mb-4">Collaboration & Team Features</h1>
        <div>
          <p>Select a team to view.</p>
        </div>
      </div>
    </div>
  );
};

export default CollaborationFeatures;
