import React, { useState } from 'react';
import { SurveyMonkeyService, SurveyMonkeyQuestion } from '../../services/SurveyMonkeyService';

const SurveyForm = () => {
  const [questions, setQuestions] = useState<SurveyMonkeyQuestion[]>([]);
  const [surveyId, setSurveyId] = useState<string | null>(null);

  const addQuestion = (type: SurveyMonkeyQuestion['type']) => {
    setQuestions([...questions, { id: String(questions.length + 1), type, text: '' }]);
  };

  const buildWithAI = async () => {
    const newSurvey = await SurveyMonkeyService.createSurveyWithAI('Create a customer satisfaction survey.');
    setQuestions(newSurvey.questions);
    setSurveyId(newSurvey.id);
  };

  const addConditionalLogic = async () => {
    if (surveyId) {
      await SurveyMonkeyService.addConditionalLogic(surveyId, questions[0].id, {
        if: {
          questionId: questions[0].id,
          answer: 'Option 1',
        },
        then: {
          action: 'skip',
          questionId: questions[2].id,
        },
      });
    }
  };

  const addMultilingualSupport = async () => {
    if (surveyId) {
      await SurveyMonkeyService.addMultilingualSupport(surveyId, 'es');
    }
  };

  return (
    <div>
      <h2>Create Survey</h2>
      <div className="mb-4">
        <button onClick={() => addQuestion('multiple-choice')} className="btn-primary mr-2">
          Add Multiple Choice
        </button>
        <button onClick={() => addQuestion('matrix')} className="btn-primary mr-2">
          Add Matrix
        </button>
        <button onClick={() => addQuestion('open-ended')} className="btn-primary mr-2">
          Add Text Entry
        </button>
        <button onClick={() => addQuestion('star')} className="btn-primary mr-2">
          Add Star Rating
        </button>
        <button onClick={() => addQuestion('ranking')} className="btn-primary mr-2">
          Add Ranking
        </button>
        <button onClick={buildWithAI} className="btn-primary mr-2">
          Build with AI
        </button>
        <button onClick={addConditionalLogic} className="btn-primary mr-2" disabled={!surveyId}>
          Add Conditional Logic
        </button>
        <button onClick={addMultilingualSupport} className="btn-primary" disabled={!surveyId}>
          Add Multilingual Support
        </button>
      </div>
      {questions.map((question, index) => (
        <div key={index} className="card mb-4">
          <input
            type="text"
            placeholder="Enter your question"
            className="input mb-2"
            value={question.text}
            onChange={(e) => {
              const newQuestions = [...questions];
              newQuestions[index].text = e.target.value;
              setQuestions(newQuestions);
            }}
          />
          {question.type === 'multiple-choice' && (
            <div>
              <p>Multiple Choice Options</p>
              {/* Add options input fields here */}
            </div>
          )}
          {question.type === 'matrix' && (
            <div>
              <p>Matrix Options</p>
              {/* Add matrix input fields here */}
            </div>
          )}
          {question.type === 'open-ended' && (
            <div>
              <p>Text Entry</p>
              {/* No additional options needed for text entry */}
            </div>
          )}
          {question.type === 'star' && (
            <div>
              <p>Star Rating</p>
              {/* Add star rating input fields here */}
            </div>
          )}
          {question.type === 'ranking' && (
            <div>
              <p>Ranking</p>
              {/* Add ranking input fields here */}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SurveyForm;
