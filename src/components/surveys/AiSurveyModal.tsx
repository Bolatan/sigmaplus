import React, { useState } from 'react';

const AiSurveyModal: React.FC<{
  onClose: () => void;
  onSubmit: (prompt: string) => void;
}> = ({ onClose, onSubmit }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = () => {
    onSubmit(prompt);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Build with AI
          </h3>
          <div className="mt-2 px-7 py-3">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter a prompt to generate a survey"
              className="w-full h-32 p-2 border"
            />
          </div>
          <div className="items-center px-4 py-3">
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Generate Survey
            </button>
            <button
              onClick={onClose}
              className="mt-2 px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiSurveyModal;
