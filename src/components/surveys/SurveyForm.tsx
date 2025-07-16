import React, { useCallback } from 'react';
import { Survey, SurveyQuestion } from '../../types';
import { SurveyFormRenderer } from './SurveyFormRenderer';

interface SurveyFormData {
  title: string;
  description: string;
  questions: SurveyQuestion[];
  agentId?: string;
  companyIds?: string[];
}

const SurveyForm: React.FC<{
  formData: SurveyFormData;
  onFormDataChange: (data: SurveyFormData) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
  buttonText: string;
  companies: Record<string, unknown>[];
  surveys: Survey[];
  user: Record<string, unknown> | null;
}> = React.memo(({ formData, onFormDataChange, onSubmit, onCancel, buttonText, companies, user }) => {
  const handleInputChange = useCallback((field: keyof Omit<SurveyFormData, 'questions'>, value: string | string[]) => {
    onFormDataChange({ ...formData, [field]: value });
  }, [formData, onFormDataChange]);

  const handleQuestionChange = useCallback((index: number, field: keyof SurveyQuestion, value: string | boolean | string[]) => {
    const newQuestions = [...formData.questions];
    // @ts-expect-error -- Please add a comment explaining the reason for this ignore
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    onFormDataChange({ ...formData, questions: newQuestions });
  }, [formData, onFormDataChange]);

  if (!formData || !Array.isArray(formData.questions)) {
    return <div>Loading survey form...</div>;
  }

  return (
    <SurveyFormRenderer
      formData={formData}
      onFormDataChange={onFormDataChange}
      onSubmit={onSubmit}
      onCancel={onCancel}
      buttonText={buttonText}
      companies={companies}
      surveys={[]}
      user={user}
      handleInputChange={handleInputChange}
      handleQuestionChange={handleQuestionChange}
    />
  );
});

SurveyForm.displayName = 'SurveyForm';

export default SurveyForm;
