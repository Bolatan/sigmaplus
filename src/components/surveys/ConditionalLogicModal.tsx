import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface ConditionalLogicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (logic: any) => void;
  question: any;
  availableQuestions: any[];
}

export const ConditionalLogicModal: React.FC<ConditionalLogicModalProps> = ({
  isOpen,
  onClose,
  onSave,
  question,
  availableQuestions,
}) => {
  const [conditions, setConditions] = useState(question.logic?.conditions || []);

  useEffect(() => {
    if (isOpen) {
      setConditions(question.logic?.conditions || [{ questionId: '', operator: 'equals', value: '' }]);
    }
  }, [isOpen, question.logic]);

  const handleConditionChange = (index, field, value) => {
    const newConditions = [...conditions];
    newConditions[index][field] = value;

    // Reset value if the dependent question changes
    if (field === 'questionId') {
      newConditions[index].value = '';
    }
    setConditions(newConditions);
  };

  const addCondition = () => {
    setConditions([...conditions, { questionId: '', operator: 'equals', value: '' }]);
  };

  const removeCondition = (index) => {
    const newConditions = conditions.filter((_, i) => i !== index);
    setConditions(newConditions);
  };

  const handleSave = () => {
    // Filter out incomplete conditions before saving
    const validConditions = conditions.filter(c => c.questionId && c.value);
    onSave({ conditions: validConditions, logicalOperator: 'AND' });
  };

  const getOptionsForQuestion = (questionId) => {
    const targetQuestion = availableQuestions.find(q => q.id === questionId);
    return targetQuestion?.options || [];
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Conditional Logic for "${question.text}"`}>
      <div className="space-y-4">
        <p>Show this question only if the following conditions are met:</p>

        {conditions.map((condition, index) => (
          <div key={index} className="space-y-2 p-3 border rounded-md relative">
            <div className="grid grid-cols-3 gap-2">
              <select
                value={condition.questionId}
                onChange={(e) => handleConditionChange(index, 'questionId', e.target.value)}
                className="input"
              >
                <option value="">Select a question...</option>
                {availableQuestions.map(q => (
                  <option key={q.id} value={q.id}>{q.text}</option>
                ))}
              </select>

              <select
                value={condition.operator}
                onChange={(e) => handleConditionChange(index, 'operator', e.target.value)}
                className="input"
              >
                <option value="equals">Is equal to</option>
                <option value="not_equals">Is not equal to</option>
              </select>

              {getOptionsForQuestion(condition.questionId).length > 0 ? (
                <select
                  value={condition.value}
                  onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
                  className="input"
                  disabled={!condition.questionId}
                >
                  <option value="">Select an option...</option>
                  {getOptionsForQuestion(condition.questionId).map((opt, i) => (
                    <option key={i} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="Enter a value"
                  value={condition.value}
                  onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
                  className="input"
                  disabled={!condition.questionId}
                />
              )}
            </div>
            <button
              type="button"
              onClick={() => removeCondition(index)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
            >
              &times;
            </button>
          </div>
        ))}

        <Button variant="outline" onClick={addCondition}>Add Condition</Button>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>Save Logic</Button>
        </div>
      </div>
    </Modal>
  );
};
