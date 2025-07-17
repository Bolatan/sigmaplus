import React, { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

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
  const [questions, setQuestions] = useState([]);

  const addQuestion = (type) => {
    setQuestions([...questions, { type, text: '', id: Date.now() }]);
  };

  const moveQuestion = (dragIndex, hoverIndex) => {
    const newQuestions = [...questions];
    const [removed] = newQuestions.splice(dragIndex, 1);
    newQuestions.splice(hoverIndex, 0, removed);
    setQuestions(newQuestions);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <h2>Create Survey</h2>
        <div className="mb-4">
          <button onClick={() => addQuestion('multiple-choice')} className="btn-primary mr-2">
            Add Multiple Choice
          </button>
          <button onClick={() => addQuestion('matrix')} className="btn-primary mr-2">
            Add Matrix
          </button>
          <button onClick={() => addQuestion('text')} className="btn-primary mr-2">
            Add Text Entry
          </button>
          <button onClick={() => addQuestion('star-rating')} className="btn-primary mr-2">
            Add Star Rating
          </button>
          <button onClick={() => addQuestion('ranking')} className="btn-primary mr-2">
            Add Ranking
          </button>
        </div>
        {questions.map((question, index) => (
          <DraggableQuestion key={question.id} id={question.id} index={index} moveQuestion={moveQuestion}>
            <div className="card mb-4">
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
              {question.type === 'multiple-choice' && <div>Multiple Choice Options</div>}
              {question.type === 'matrix' && <div>Matrix Options</div>}
              {question.type === 'text' && <div>Text Entry</div>}
              {question.type === 'star-rating' && <div>Star Rating</div>}
              {question.type === 'ranking' && <div>Ranking Options</div>}
            </div>
          </DraggableQuestion>
        ))}
      </div>
    </DndProvider>
  );
};

export default SurveyForm;
