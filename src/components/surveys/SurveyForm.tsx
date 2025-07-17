import React, { useState } from 'react';

const SurveyForm = () => {
  const [questions, setQuestions] = useState([]);

  const addQuestion = (type) => {
    setQuestions([...questions, { type, text: '' }]);
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
        <button onClick={() => addQuestion('text')} className="btn-primary">
          Add Text Entry
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
          {question.type === 'text' && (
            <div>
              <p>Text Entry</p>
              {/* No additional options needed for text entry */}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SurveyForm;
