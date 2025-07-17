import React, { useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Survey, SurveyQuestion, QuestionType } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { ConditionalLogicModal } from '../surveys/ConditionalLogicModal';

interface SurveyFormData {
  title: string;
  description: string;
  questions: SurveyQuestion[];
  agentId?: string;
  companyIds?: string[];
  projectId?: string;
}

interface SurveyFormProps {
  formData: SurveyFormData;
  onFormDataChange: (data: SurveyFormData) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
  buttonText: string;
  companies: { _id: string; name: string }[];
  projects: { _id: string; title: string }[];
  surveys: Survey[];
  user: Record<string, unknown> | null;
}

const SurveyForm: React.FC<SurveyFormProps> = ({
  formData,
  onFormDataChange,
  onSubmit,
  onCancel,
  buttonText,
  companies,
  projects,
  user,
}) => {
  const handleInputChange = useCallback(
    (field: keyof Omit<SurveyFormData, 'questions'>, value: string | string[]) => {
      onFormDataChange({ ...formData, [field]: value });
    },
    [formData, onFormDataChange]
  );

  const handleQuestionChange = useCallback(
    (index: number, field: keyof SurveyQuestion, value: string | boolean | string[]) => {
      const newQuestions = [...formData.questions];
      // @ts-expect-error -- Please add a comment explaining the reason for this ignore
      newQuestions[index] = { ...newQuestions[index], [field]: value };
      onFormDataChange({ ...formData, questions: newQuestions });
    },
    [formData, onFormDataChange]
  );

  const addQuestion = useCallback(() => {
    const newQuestion: SurveyQuestion = {
      id: uuidv4(),
      text: '',
      type: 'text',
      isRequired: false,
      options: [],
    };
    onFormDataChange({
      ...formData,
      questions: [...formData.questions, newQuestion],
    });
  }, [formData, onFormDataChange]);

  const removeQuestion = useCallback(
    (index: number) => {
      const newQuestions = formData.questions.filter((_, i) => i !== index);
      onFormDataChange({ ...formData, questions: newQuestions });
    },
    [formData, onFormDataChange]
  );

  const [isLogicModalOpen, setIsLogicModalOpen] = useState(false);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);

  const openLogicModal = (index: number) => {
    setSelectedQuestionIndex(index);
    setIsLogicModalOpen(true);
  };

  const closeLogicModal = () => {
    setSelectedQuestionIndex(null);
    setIsLogicModalOpen(false);
  };

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="surveyName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Survey Name
          </label>
          <Input
            id="surveyName"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            required
          />
        </div>
        {(user?.role === 'admin' || user?.role === 'agent') && (
          <>
            <div>
              <label
                htmlFor="project"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Assign to Project
              </label>
              <select
                id="project"
                value={formData.projectId || ''}
                onChange={(e) => handleInputChange('projectId', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="company"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Assign to Company
              </label>
              <div className="mt-1 space-y-2">
                {companies.map((company) => (
                  <label key={company._id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={(formData.companyIds || []).includes(company._id)}
                      onChange={(e) => {
                        const selectedIds = formData.companyIds || [];
                        if (e.target.checked) {
                          handleInputChange('companyIds', [...selectedIds, company._id]);
                        } else {
                          handleInputChange('companyIds', selectedIds.filter(id => id !== company._id));
                        }
                      }}
                      className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    />
                    <span className="text-sm text-gray-700">{company.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}
        <div>
          <label
            htmlFor="projectDescription"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <textarea
            id="projectDescription"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            rows={3}
          />
        </div>
        {/* Questions Section */}
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-md font-semibold">Questions</h3>
          {(formData.questions || []).map((question, index) => (
            <div
              key={question.id || index}
              className="p-3 border rounded-md space-y-2 bg-gray-50"
            >
              <Input
                label={`Question ${index + 1} Text`}
                value={question.text}
                onChange={(e) =>
                  handleQuestionChange(index, 'text', e.target.value)
                }
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question Type
                </label>
                <select
                  value={question.type}
                  onChange={(e) =>
                    handleQuestionChange(
                      index,
                      'type',
                      e.target.value as QuestionType
                    )
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  <option value="text">Text</option>
                  <option value="textarea">Textarea</option>
                  <option value="single-choice">Single Choice (Radio)</option>
                  <option value="multiple-choice">
                    Multiple Choice (Checkbox)
                  </option>
                  <option value="rating">Rating (1-10)</option>
                  <option value="nps">Net Promoter Score (NPS)</option>
                  <option value="ces">Customer Effort Score (CES)</option>
                  <option value="image-choice">Image Choice</option>
                  <option value="file-upload">File Upload</option>
                  <option value="video">Video</option>
                </select>
              </div>
              <div className="mt-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={!!question.isRequired}
                    onChange={(e) =>
                      handleQuestionChange(index, 'isRequired', e.target.checked)
                    }
                    className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                  />
                  <span className="text-sm text-gray-700">Required</span>
                </label>
              </div>
              {(question.type === 'single-choice' ||
                question.type === 'multiple-choice' ||
                question.type === 'image-choice') && (
                <div className="mt-2 space-y-2 pl-4 border-l-2">
                  {(question.options || []).map((opt, optIndex) => (
                    <div key={optIndex} className="flex items-center space-x-2">
                      <Input
                        type="text"
                        value={opt}
                        placeholder={`Option ${optIndex + 1}`}
                        onChange={(e) => {
                          const newOptions = [...(question.options || [])];
                          newOptions[optIndex] = e.target.value;
                          handleQuestionChange(index, 'options', newOptions);
                        }}
                        className="flex-grow"
                      />
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          const newOptions = (question.options || []).filter(
                            (_, i) => i !== optIndex
                          );
                          handleQuestionChange(index, 'options', newOptions);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newOptions = [
                        ...(question.options || []),
                        'New Option',
                      ];
                      handleQuestionChange(index, 'options', newOptions);
                    }}
                    leftIcon={<Plus className="h-3 w-3" />}
                  >
                    Add Option
                  </Button>
                </div>
              )}
              {question.type === 'rating' && (
                <div className="mt-2">
                  <Input
                    label="Max Rating"
                    type="number"
                    value={question.maxRating || 5}
                    onChange={(e) =>
                      handleQuestionChange(
                        index,
                        'maxRating',
                        parseInt(e.target.value, 10)
                      )
                    }
                    min={2}
                    max={10}
                  />
                </div>
              )}
              {question.type === 'file-upload' && (
                <div className="mt-2">
                  <Input
                    label="Allowed File Types"
                    value={question.allowedFileTypes || ''}
                    onChange={(e) =>
                      handleQuestionChange(
                        index,
                        'allowedFileTypes',
                        e.target.value
                      )
                    }
                    placeholder="e.g., .pdf,.jpg,.png"
                  />
                </div>
              )}
              {question.type === 'video' && (
                <div className="mt-2">
                  <Input
                    label="Video URL"
                    value={question.videoUrl || ''}
                    onChange={(e) =>
                      handleQuestionChange(index, 'videoUrl', e.target.value)
                    }
                    placeholder="https://example.com/video.mp4"
                  />
                </div>
              )}
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => removeQuestion(index)}
                className="mt-2"
              >
                Remove Question
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => openLogicModal(index)}
                className="mt-2"
              >
                Conditional Logic
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addQuestion}
            leftIcon={<Plus className="h-4 w-4" />}
            className="mt-2"
          >
            Add Question
          </Button>
        </div>
        <div className="flex justify-end space-x-2 mt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {buttonText}
          </Button>
        </div>
      </form>
      {selectedQuestionIndex !== null && (
        <ConditionalLogicModal
          isOpen={isLogicModalOpen}
          onClose={closeLogicModal}
        />
      )}
    </>
  );
};

const SurveyFormWrapper: React.FC<SurveyFormProps> = (props) => {
  if (!props.formData || !Array.isArray(props.formData.questions)) {
    return <div>Loading survey form...</div>;
  }
  return <SurveyForm {...props} />;
};

export default SurveyFormWrapper;
