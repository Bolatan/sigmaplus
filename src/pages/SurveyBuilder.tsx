import React, { useState } from 'react';
import QuestionTypes from '../components/surveys/QuestionTypes';
import AiSurveyModal from '../components/surveys/AiSurveyModal';

const SurveyBuilder: React.FC = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const addQuestion = (type: string) => {
    setQuestions([...questions, { id: Date.now(), type, text: '' }]);
  };

  const updateQuestionType = (id: number, type: string) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, type } : q))
    );
  };

  const handleAiSubmit = async (prompt: string) => {
    try {
      const response = await fetch('/api/surveys/generate-with-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate survey');
      }

      const survey = await response.json();
      setQuestions(survey.questions);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/4 bg-gray-200 p-4">
        <h2 className="text-xl font-bold mb-4">Form Elements</h2>
        <button
          onClick={() => setIsAiModalOpen(true)}
          className="bg-purple-500 text-white px-4 py-2 rounded mb-4"
        >
          Build with AI
        </button>
        <QuestionTypes onSelect={addQuestion} />
      </div>
      <div className="w-3/4 p-4">
        <h1 className="text-3xl font-bold mb-4">Survey Builder</h1>
        <div>
          {questions.map((question) => (
            <div key={question.id} className="mb-4">
              <div className="flex items-center mb-2">
                <select
                  value={question.type}
                  onChange={(e) =>
                    updateQuestionType(question.id, e.target.value)
                  }
                  className="border p-2 mr-2"
                >
                  <option value="text">Text</option>
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="star-rating">Star Rating</option>
                  <option value="ranking">Ranking</option>
                  <option value="matrix">Matrix</option>
                  <option value="open-ended">Open-Ended</option>
                </select>
                <input
                  type="text"
                  placeholder="Enter your question"
                  className="border p-2 w-full"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      {isAiModalOpen && (
        <AiSurveyModal
          onClose={() => setIsAiModalOpen(false)}
          onSubmit={handleAiSubmit}
        />
      )}
    </div>
  );
};

export default SurveyBuilder;
