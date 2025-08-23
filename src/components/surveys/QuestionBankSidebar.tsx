import React, { useState, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import useApi from '../../hooks/useApi';

const ItemTypes = {
  QUESTION_BANK_ITEM: 'questionBankItem',
};

const QuestionBankItem = ({ question }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.QUESTION_BANK_ITEM,
    item: { question },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="p-2 border rounded-md mb-2 cursor-move"
    >
      {question.text}
    </div>
  );
};

const QuestionBankSidebar = () => {
  const [questions, setQuestions] = useState([]);
  const api = useApi();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await api.get('/question-bank');
        setQuestions(response.data.questions);
      } catch (error) {
        console.error('Failed to fetch question bank', error);
      }
    };

    fetchQuestions();
  }, [api]);

  return (
    <div className="p-4 border-l">
      <h3 className="text-lg font-medium mb-4">Question Bank</h3>
      <div>
        {questions.map((q) => (
          <QuestionBankItem key={q.id} question={q} />
        ))}
      </div>
    </div>
  );
};

export default QuestionBankSidebar;
