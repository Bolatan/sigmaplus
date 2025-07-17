import React, { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Survey, Question, Option } from '../../types/survey';
import { SurveyService } from '../../services/SurveyService';

const ItemTypes = {
  QUESTION: 'question',
};

const DraggableQuestion = ({ id, index, moveQuestion, children }) => {
  const ref = React.useRef(null);
  const [, drop] = useDrop({
    accept: ItemTypes.QUESTION,
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) {
        return;
      }
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      moveQuestion(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.QUESTION,
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <div ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }}>
      {children}
    </div>
  );
};

const SurveyForm = () => {
  const [questions, setQuestions] = useState<SignaPlusQuestion[]>([]);
  const [surveyId, setSurveyId] = useState<string | null>(null);


  const addQuestion = (type: Question['type']) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type,
      text: '',
      options: type === 'multiple-choice' ? [] : undefined,
    };
    setSurvey({
      ...survey,
      questions: [...survey.questions, newQuestion],
    });
  };

  const moveQuestion = (dragIndex: number, hoverIndex: number) => {
    const newQuestions = [...survey.questions];
    const [removed] = newQuestions.splice(dragIndex, 1);
    newQuestions.splice(hoverIndex, 0, removed);
    setSurvey({ ...survey, questions: newQuestions });
  };

  const handleQuestionTextChange = (index: number, text: string) => {
    const newQuestions = [...survey.questions];
    newQuestions[index].text = text;
    setSurvey({ ...survey, questions: newQuestions });
  };

  const addOption = (questionIndex: number) => {
    const newQuestions = [...survey.questions];
    const question = newQuestions[questionIndex];
    if (question.options) {
      question.options.push({ id: Date.now().toString(), text: '' });
      setSurvey({ ...survey, questions: newQuestions });
    }
  };

  const handleOptionTextChange = (
    questionIndex: number,
    optionIndex: number,
    text: string
  ) => {
    const newQuestions = [...survey.questions];
    const question = newQuestions[questionIndex];
    if (question.options) {
      question.options[optionIndex].text = text;
      setSurvey({ ...survey, questions: newQuestions });
    }
  };

  const handleSave = async () => {
    await SurveyService.create({ ...survey, id: Date.now().toString() });
    alert('Survey saved!');
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <h2>Create Survey</h2>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Survey Title"
            className="input mb-2"
            value={survey.title}
            onChange={(e) => setSurvey({ ...survey, title: e.target.value })}
          />
          <textarea
            placeholder="Survey Description"
            className="input mb-2"
            value={survey.description}
            onChange={(e) =>
              setSurvey({ ...survey, description: e.target.value })
            }
          />
        </div>
        <div className="mb-4">
          <button
            onClick={() => addQuestion('multiple-choice')}
            className="btn-primary mr-2"
          >
            Add Multiple Choice
          </button>
          <button onClick={() => addQuestion('matrix')} className="btn-primary mr-2">
            Add Matrix
          </button>
          <button onClick={() => addQuestion('text')} className="btn-primary mr-2">
            Add Text Entry
          </button>
          <button
            onClick={() => addQuestion('star-rating')}
            className="btn-primary mr-2"
          >
            Add Star Rating
          </button>
          <button onClick={() => addQuestion('ranking')} className="btn-primary mr-2">
            Add Ranking
          </button>
        </div>
        {survey.questions.map((question, index) => (
          <DraggableQuestion
            key={question.id}
            id={question.id}
            index={index}
            moveQuestion={moveQuestion}
          >
            <div className="card mb-4">
              <input
                type="text"
                placeholder="Enter your question"
                className="input mb-2"
                value={question.text}
                onChange={(e) => handleQuestionTextChange(index, e.target.value)}
              />
              {question.type === 'multiple-choice' && (
                <div>
                  <h3>Options</h3>
                  {question.options?.map((option, optionIndex) => (
                    <div key={option.id} className="flex items-center mb-2">
                      <input
                        type="text"
                        placeholder="Option"
                        className="input mr-2"
                        value={option.text}
                        onChange={(e) =>
                          handleOptionTextChange(index, optionIndex, e.target.value)
                        }
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => addOption(index)}
                    className="btn-secondary"
                  >
                    Add Option
                  </button>
                </div>
              )}
              {question.type === 'matrix' && <div>Matrix Options</div>}
              {question.type === 'text' && <div>Text Entry</div>}
              {question.type === 'star-rating' && <div>Star Rating</div>}
              {question.type === 'ranking' && <div>Ranking Options</div>}
            </div>
          </DraggableQuestion>
        ))}
        <div className="mt-8">
          <button onClick={handleSave} className="btn-primary">
            Save Survey
          </button>
        </div>
      </div>
    </DndProvider>
  );
};

export default SurveyForm;
