import React, { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ConditionalLogicModal } from './ConditionalLogicModal';

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


const SurveyForm = ({ formData, onFormDataChange, onSubmit, onCancel, buttonText, agents, companies, projects, user, onDrop }) => {
  const [questions, setQuestions] = useState(formData.questions || []);
  const [isLogicModalOpen, setIsLogicModalOpen] = useState(false);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);

  const [, drop] = useDrop({
    accept: 'questionBankItem',
    drop: (item) => onDrop(item),
  });

  const handleOpenLogicModal = (index: number) => {
    setSelectedQuestionIndex(index);
    setIsLogicModalOpen(true);
  };

  const handleCloseLogicModal = () => {
    setSelectedQuestionIndex(null);
    setIsLogicModalOpen(false);
  };

  const handleSaveLogic = (logic: any) => {
    if (selectedQuestionIndex === null) return;

    const newQuestions = [...questions];
    newQuestions[selectedQuestionIndex].logic = logic;
    setQuestions(newQuestions);
    onFormDataChange({ ...formData, questions: newQuestions });
    handleCloseLogicModal();
  };

  const addQuestion = (type) => {
    const newQuestion = { type, text: '', id: Date.now().toString(), options: [] };
    if (type === 'matrix') {
      newQuestion.rows = [''];
      newQuestion.columns = [''];
    }
    const newQuestions = [...questions, newQuestion];
    setQuestions(newQuestions);
    onFormDataChange({ ...formData, questions: newQuestions });
  };

  const removeQuestion = (qIndex) => {
    const newQuestions = [...questions];
    newQuestions.splice(qIndex, 1);
    setQuestions(newQuestions);
    onFormDataChange({ ...formData, questions: newQuestions });
  };

  const moveQuestion = (dragIndex, hoverIndex) => {
    const newQuestions = [...questions];
    const [removed] = newQuestions.splice(dragIndex, 1);
    newQuestions.splice(hoverIndex, 0, removed);
    setQuestions(newQuestions);
    onFormDataChange({ ...formData, questions: newQuestions });
  };

  const handleQuestionChange = (index, newText) => {
    const newQuestions = [...questions];
    newQuestions[index].text = newText;
    setQuestions(newQuestions);
    onFormDataChange({ ...formData, questions: newQuestions });
  };

  const handleOptionChange = (qIndex, oIndex, newText) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = newText;
    setQuestions(newQuestions);
    onFormDataChange({ ...formData, questions: newQuestions });
  };

  const addOption = (qIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.push('');
    setQuestions(newQuestions);
    onFormDataChange({ ...formData, questions: newQuestions });
  };

  const removeOption = (qIndex, oIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.splice(oIndex, 1);
    setQuestions(newQuestions);
    onFormDataChange({ ...formData, questions: newQuestions });
  };

  const handleMatrixChange = (qIndex, type, mIndex, newText) => {
    const newQuestions = [...questions];
    newQuestions[qIndex][type][mIndex] = newText;
    setQuestions(newQuestions);
    onFormDataChange({ ...formData, questions: newQuestions });
  };

  const addMatrixRow = (qIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].rows.push('');
    setQuestions(newQuestions);
    onFormDataChange({ ...formData, questions: newQuestions });
  };

  const addMatrixColumn = (qIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].columns.push('');
    setQuestions(newQuestions);
    onFormDataChange({ ...formData, questions: newQuestions });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <form onSubmit={onSubmit} ref={drop}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => onFormDataChange({ ...formData, title: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>
        <div className="mb-4">
            <label htmlFor="project" className="block text-sm font-medium text-gray-700">Project</label>
            <select
                id="project"
                value={formData.projectId}
                onChange={(e) => onFormDataChange({ ...formData, projectId: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
                <option value="">Select a project</option>
                {projects.map(project => (
                    <option key={project._id} value={project._id}>{project.title}</option>
                ))}
            </select>
        </div>

        {user?.role === 'admin' && (
          <>
            <div className="mb-4">
              <label htmlFor="agent" className="block text-sm font-medium text-gray-700">Agent</label>
              <select
                id="agent"
                value={formData.agentId}
                onChange={(e) => onFormDataChange({ ...formData, agentId: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="">Select an agent</option>
                {agents.map(agent => (
                  <option key={agent._id} value={agent._id}>{agent.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="companies" className="block text-sm font-medium text-gray-700">Companies</label>
              <select
                id="companies"
                multiple
                value={formData.companyIds}
                onChange={(e) => onFormDataChange({ ...formData, companyIds: Array.from(e.target.selectedOptions, option => option.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                {companies.map(company => (
                  <option key={company._id} value={company._id}>{company.name}</option>
                ))}
              </select>
            </div>
          </>
        )}

        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900">Questions</h3>
          <div className="flex space-x-2 mt-2">
            <button type="button" onClick={() => addQuestion('multiple-choice')} className="btn-secondary">Multiple Choice</button>
            <button type="button" onClick={() => addQuestion('star-rating')} className="btn-secondary">Star Rating</button>
            <button type="button" onClick={() => addQuestion('ranking')} className="btn-secondary">Ranking</button>
            <button type="button" onClick={() => addQuestion('matrix')} className="btn-secondary">Matrix</button>
            <button type="button" onClick={() => addQuestion('open-ended')} className="btn-secondary">Open-Ended</button>
            <button type="button" onClick={() => addQuestion('page-break')} className="btn-secondary">Page Break</button>
          </div>
        </div>

        {questions.map((q, qIndex) => (
          q.type === 'page-break' ? (
            <div key={q.id} className="p-4 border rounded-md mb-4 text-center bg-gray-100">
              --- Page Break ---
            </div>
          ) : (
          <DraggableQuestion key={q.id} id={q.id} index={qIndex} moveQuestion={moveQuestion}>
            <div className="p-4 border rounded-md mb-4">
              <input
                type="text"
                placeholder="Enter your question"
                value={q.text}
                onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                className="input mb-2 w-full"
              />
              <div className="flex justify-end items-center">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={q.isRequired || false}
                    onChange={(e) => {
                      const newQuestions = [...questions];
                      newQuestions[qIndex].isRequired = e.target.checked;
                      setQuestions(newQuestions);
                      onFormDataChange({ ...formData, questions: newQuestions });
                    }}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Required
                  </label>
                </div>
                <button type="button" onClick={() => handleOpenLogicModal(qIndex)} className="text-sm text-blue-600 hover:text-blue-800 ml-4">Logic</button>
                <button type="button" onClick={() => removeQuestion(qIndex)} className="text-sm text-red-600 hover:text-red-800 ml-4">Remove</button>
              </div>
              {q.type === 'multiple-choice' && (
                <div>
                  {q.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center mb-2">
                      <input
                        type="text"
                        placeholder={`Option ${oIndex + 1}`}
                        value={option}
                        onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                        className="input mr-2 flex-grow"
                      />
                      <button type="button" onClick={() => removeOption(qIndex, oIndex)} className="btn-danger">Remove</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addOption(qIndex)} className="btn-secondary">Add Option</button>
                </div>
              )}
              {q.type === 'ranking' && (
                <div>
                  {q.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center mb-2">
                      <input
                        type="text"
                        placeholder={`Option ${oIndex + 1}`}
                        value={option}
                        onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                        className="input mr-2 flex-grow"
                      />
                      <button type="button" onClick={() => removeOption(qIndex, oIndex)} className="btn-danger">Remove</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addOption(qIndex)} className="btn-secondary">Add Option</button>
                </div>
              )}
              {q.type === 'matrix' && (
                <div>
                  <h4 className="font-medium">Rows</h4>
                  {q.rows.map((row, rIndex) => (
                    <input
                      key={rIndex}
                      type="text"
                      placeholder={`Row ${rIndex + 1}`}
                      value={row}
                      onChange={(e) => handleMatrixChange(qIndex, 'rows', rIndex, e.target.value)}
                      className="input mb-2 w-full"
                    />
                  ))}
                  <button type="button" onClick={() => addMatrixRow(qIndex)} className="btn-secondary">Add Row</button>

                  <h4 className="font-medium mt-4">Columns</h4>
                  {q.columns.map((col, cIndex) => (
                    <input
                      key={cIndex}
                      type="text"
                      placeholder={`Column ${cIndex + 1}`}
                      value={col}
                      onChange={(e) => handleMatrixChange(qIndex, 'columns', cIndex, e.target.value)}
                      className="input mb-2 w-full"
                    />
                  ))}
                  <button type="button" onClick={() => addMatrixColumn(qIndex)} className="btn-secondary">Add Column</button>
                </div>
              )}
            </div>
          </DraggableQuestion>
          )
        ))}

        <div className="flex justify-end space-x-2 mt-4">
          <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary">{buttonText}</button>
        </div>
      </form>
      {selectedQuestionIndex !== null && (
        <ConditionalLogicModal
          isOpen={isLogicModalOpen}
          onClose={handleCloseLogicModal}
          onSave={handleSaveLogic}
          question={questions[selectedQuestionIndex]}
          availableQuestions={questions.slice(0, selectedQuestionIndex)}
        />
      )}
    </DndProvider>
  );
};

export default SurveyForm;
