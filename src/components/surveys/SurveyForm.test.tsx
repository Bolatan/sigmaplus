import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SurveyForm from './SurveyForm';

const mockFormData = {
  title: '',
  description: '',
  questions: [],
};

const mockOnFormDataChange = jest.fn();
const mockOnSubmit = jest.fn();
const mockOnCancel = jest.fn();

const renderSurveyForm = () => {
  render(
    <SurveyForm
      formData={mockFormData}
      onFormDataChange={mockOnFormDataChange}
      onSubmit={mockOnSubmit}
      onCancel={mockOnCancel}
      buttonText="Create Survey"
      agents={[]}
      companies={[]}
      projects={[]}
      user={{ role: 'admin' }}
    />
  );
};

test('renders survey form', () => {
  renderSurveyForm();

  // Check if the initial form is rendered correctly
  expect(screen.getByText('Create Survey')).toBeInTheDocument();
  expect(screen.getByText('Multiple Choice')).toBeInTheDocument();
  expect(screen.getByText('Star Rating')).toBeInTheDocument();
  expect(screen.getByText('Ranking')).toBeInTheDocument();
  expect(screen.getByText('Matrix')).toBeInTheDocument();
  expect(screen.getByText('Open-Ended')).toBeInTheDocument();
});

test('adds a multiple-choice question', () => {
    renderSurveyForm();
    fireEvent.click(screen.getByText('Multiple Choice'));
    expect(screen.getByPlaceholderText('Enter your question')).toBeInTheDocument();
  });

  test('adds a star-rating question', () => {
    renderSurveyForm();
    fireEvent.click(screen.getByText('Star Rating'));
    expect(screen.getByPlaceholderText('Enter your question')).toBeInTheDocument();
  });

  test('adds a ranking question', () => {
    renderSurveyForm();
    fireEvent.click(screen.getByText('Ranking'));
    expect(screen.getByPlaceholderText('Enter your question')).toBeInTheDocument();
  });

  test('adds a matrix question', () => {
    renderSurveyForm();
    fireEvent.click(screen.getByText('Matrix'));
    expect(screen.getByPlaceholderText('Enter your question')).toBeInTheDocument();
  });

  test('adds an open-ended question', () => {
    renderSurveyForm();
    fireEvent.click(screen.getByText('Open-Ended'));
    expect(screen.getByPlaceholderText('Enter your question')).toBeInTheDocument();
  });
