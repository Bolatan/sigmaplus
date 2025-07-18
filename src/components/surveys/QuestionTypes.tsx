import React from 'react';

const QuestionTypes: React.FC<{ onSelect: (type: string) => void }> = ({ onSelect }) => {
  const questionTypes = [
    { id: 'text', name: 'Text' },
    { id: 'multiple-choice', name: 'Multiple Choice' },
    { id: 'star-rating', name: 'Star Rating' },
    { id: 'ranking', name: 'Ranking' },
    { id: 'matrix', name: 'Matrix' },
    { id: 'open-ended', name: 'Open-Ended' },
  ];

  return (
    <div>
      <h3 className="text-lg font-bold mb-2">Question Types</h3>
      <ul>
        {questionTypes.map((type) => (
          <li
            key={type.id}
            onClick={() => onSelect(type.id)}
            className="cursor-pointer p-2 hover:bg-gray-300"
          >
            {type.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuestionTypes;
