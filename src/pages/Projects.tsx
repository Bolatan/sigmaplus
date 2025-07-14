import React, { useState, useCallback, useEffect } from 'react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/Select';
import { Textarea } from './ui/Textarea';
import { Plus, Trash2 } from 'lucide-react';
import { SurveyQuestion, QuestionType } from '../types'; // Assuming types are defined here
import { v4 as uuidv4 } from 'uuid';

// Re-using the ProjectFormData interface from Projects.tsx for consistency
interface SurveyFormData {
  title: string;
  description: string;
  questions: SurveyQuestion[];
  agentId?: string;
  companyIds?: string[];
  projectId?: string; // Added projectId to match Projects.tsx usage
}

interface SurveyFormProps {
  formData: SurveyFormData;
  onFormDataChange: (data: SurveyFormData) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
  buttonText: string;
  agents: any[]; // List of agents for dropdown
  companies: any[]; // List of companies for dropdown
  projects: any[]; // List of projects for dropdown (assuming surveys can be associated with projects)
  user: any; // Current authenticated user
}

const SurveyForm: React.FC<SurveyFormProps> = React.memo(({
  formData,
  onFormDataChange,
  onSubmit,
  onCancel,
  buttonText,
  agents,
  companies,
  projects, // Destructure the new 'projects' prop
  user,
}) => {
  const handleQuestionChange = useCallback((index: number, field: keyof SurveyQuestion, value: any) => {
    const newQuestions = [...formData.questions];
    (newQuestions[index] as any)[field] = value;
    onFormDataChange({ ...formData, questions: newQuestions });
  }, [formData, onFormDataChange]);

  const addQuestion = useCallback(() => {
    onFormDataChange({
      ...formData,
      questions: [
        ...formData.questions,
        { id: uuidv4(), text: '', type: 'text', options: [], isRequired: false },
      ],
    });
  }, [formData, onFormDataChange]);

  const removeQuestion = useCallback((index: number) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    onFormDataChange({ ...formData, questions: newQuestions });
  }, [formData, onFormDataChange]);

  const handleOptionChange = useCallback((qIndex: number, optIndex: number, value: string) => {
    const newQuestions = [...formData.questions];
    if (newQuestions[qIndex] && newQuestions[qIndex].options) {
      newQuestions[qIndex].options![optIndex] = value;
      onFormDataChange({ ...formData, questions: newQuestions });
    }
  }, [formData, onFormDataChange]);

  const addOption = useCallback((qIndex: number) => {
    const newQuestions = [...formData.questions];
    if (newQuestions[qIndex] && newQuestions[qIndex].options) {
      newQuestions[qIndex].options!.push('');
      onFormDataChange({ ...formData, questions: newQuestions });
    }
  }, [formData, onFormDataChange]);

  const removeOption = useCallback((qIndex: number, optIndex: number) => {
    const newQuestions = [...formData.questions];
    if (newQuestions[qIndex] && newQuestions[qIndex].options) {
      newQuestions[qIndex].options = newQuestions[qIndex].options!.filter((_, i) => i !== optIndex);
      onFormDataChange({ ...formData, questions: newQuestions });
    }
  }, [formData, onFormDataChange]);

  // Ensure formData.questions is initialized
  useEffect(() => {
    if (!formData.questions) {
      onFormDataChange({ ...formData, questions: [] });
    }
  }, [formData, onFormDataChange]);


  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Input
        label="Project Title"
        value={formData.title}
        onChange={(e) => onFormDataChange({ ...formData, title: e.target.value })}
        required
      />
      <Textarea
        label="Project Description"
        value={formData.description}
        onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
        rows={3}
      />

      {user?.role === 'admin' && (
        <Select
          label="Assign Agent (Optional)"
          value={formData.agentId || ''}
          onValueChange={(value) => onFormDataChange({ ...formData, agentId: value || undefined })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an agent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            {agents.map(agent => (
              <SelectItem key={agent.id} value={agent.id}>{agent.name || agent.email}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {user?.role === 'admin' && (
        <Select
          label="Assign Companies (Optional)"
          value={formData.companyIds && formData.companyIds.length > 0 ? formData.companyIds[0] : ''} // Assuming single select for simplicity, adjust for multi-select
          onValueChange={(value) => onFormDataChange({ ...formData, companyIds: value ? [value] : [] })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select companies" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            {companies.map(company => (
              <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* New: Project Association */}
      <Select
        label="Associate with Project (Optional)"
        value={formData.projectId || ''}
        onValueChange={(value) => onFormDataChange({ ...formData, projectId: value || undefined })}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a project" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">None</SelectItem>
          {projects.map(project => (
            <SelectItem key={project.id} value={project.id}>{project.title}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">Questions</h3>
      {formData.questions.map((q, index) => (
        <Card key={q.id} className="mb-4 p-4">
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <Input
                label={`Question ${index + 1} Text`}
                value={q.text}
                onChange={(e) => handleQuestionChange(index, 'text', e.target.value)}
                required
              />
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => removeQuestion(index)}
                className="ml-2"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <Select
              label="Question Type"
              value={q.type}
              onValueChange={(value: QuestionType) => handleQuestionChange(index, 'type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select question type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text Input</SelectItem>
                <SelectItem value="textarea">Long Text Input</SelectItem>
                <SelectItem value="single-choice">Single Choice</SelectItem>
                <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="nps">NPS (Net Promoter Score)</SelectItem>
                <SelectItem value="ces">CES (Customer Effort Score)</SelectItem>
                <SelectItem value="image-choice">Image Choice</SelectItem>
                <SelectItem value="file-upload">File Upload</SelectItem>
                <SelectItem value="video">Video</SelectItem>
              </SelectContent>
            </Select>

            {(q.type === 'single-choice' || q.type === 'multiple-choice' || q.type === 'image-choice') && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Options</label>
                {q.options?.map((option, optIndex) => (
                  <div key={optIndex} className="flex items-center space-x-2">
                    <Input
                      value={option}
                      onChange={(e) => handleOptionChange(index, optIndex, e.target.value)}
                      placeholder={`Option ${optIndex + 1}`}
                    />
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => removeOption(index, optIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={() => addOption(index)}>
                  <Plus className="h-4 w-4 mr-2" /> Add Option
                </Button>
              </div>
            )}

            {q.type === 'rating' && (
              <Input
                label="Max Rating Value (e.g., 5 or 10)"
                type="number"
                value={q.maxRating || ''}
                onChange={(e) => handleQuestionChange(index, 'maxRating', parseInt(e.target.value) || 0)}
              />
            )}

            {q.type === 'file-upload' && (
              <div className="mt-2">
                <Input
                  label="Allowed File Types (e.g., .pdf,.jpg,.png)"
                  value={q.allowedFileTypes || ''}
                  onChange={(e) => handleQuestionChange(index, 'allowedFileTypes', e.target.value)}
                />
              </div>
            )}

            {q.type === 'video' && (
              <div className="mt-2">
                <Input
                  label="Video URL"
                  value={q.videoUrl || ''}
                  onChange={(e) => handleQuestionChange(index, 'videoUrl', e.target.value)}
                  placeholder="e.g., https://example.com/video.mp4"
                />
              </div>
            )}

            <div className="flex items-center mt-2">
              <input
                id={`isRequired-${q.id}`}
                type="checkbox"
                checked={q.isRequired}
                onChange={(e) => handleQuestionChange(index, 'isRequired', e.target.checked)}
                className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor={`isRequired-${q.id}`} className="ml-2 block text-sm text-gray-900">
                Required
              </label>
            </div>
          </CardContent>
        </Card>
      ))}
      <Button type="button" variant="outline" onClick={addQuestion}>
        <Plus className="h-5 w-5 mr-2" /> Add Question
      </Button>

      <div className="flex justify-end space-x-2 mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {buttonText}
        </Button>
      </div>
    </form>
  );
});

export default SurveyForm;
