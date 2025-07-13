import React from 'react';
import { Modal } from '../ui/Modal';
import { Survey } from '../../types';

interface SurveyDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  survey: Survey | null;
}

export const SurveyDetailModal: React.FC<SurveyDetailModalProps> = ({ isOpen, onClose, survey }) => {
  if (!survey) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={survey.title}>
      <div className="space-y-4">
        <p>{survey.description}</p>
        <div>
          <h3 className="text-lg font-medium">Questions</h3>
          <ul>
            {survey.questions.map((q) => (
              <li key={q.id}>{q.text}</li>
            ))}
          </ul>
        </div>
      </div>
    </Modal>
  );
};
