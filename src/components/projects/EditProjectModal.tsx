import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface Project {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onSave: (project: Project) => void;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({
  isOpen,
  onClose,
  project,
  onSave,
}) => {
  const [formData, setFormData] = React.useState<Project | null>(project);

  React.useEffect(() => {
    setFormData(project);
  }, [project]);

  if (!project) {
    return null;
  }

  const handleSave = () => {
    if (formData) {
      onSave(formData);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Project">
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <Input
            id="title"
            value={formData?.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value, id: project.id, createdAt: project.createdAt })}
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <Input
            id="description"
            value={formData?.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value, id: project.id, createdAt: project.createdAt })}
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="primary" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EditProjectModal;
