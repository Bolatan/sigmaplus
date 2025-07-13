import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { brandAwarenessTemplate } from '../../data/survey-templates/brand-awareness';

interface TemplateSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: any) => void;
}

export const TemplateSelectionModal: React.FC<TemplateSelectionModalProps> = ({ isOpen, onClose, onSelectTemplate }) => {
  const templates = [
    { name: 'Brand Awareness', template: brandAwarenessTemplate },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select a Survey Template">
      <div className="space-y-4">
        {templates.map((template, index) => (
          <Button
            key={index}
            variant="outline"
            onClick={() => {
              onSelectTemplate(template.template);
              onClose();
            }}
          >
            {template.name}
          </Button>
        ))}
      </div>
    </Modal>
  );
};
