import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SurveyForm from './SurveyForm';

test('renders survey form', () => {
  render(<SurveyForm />);

  // Check if the initial form is rendered correctly
  expect(screen.getByText('Create Survey')).toBeInTheDocument();
  expect(screen.getByText('Add Multiple Choice')).toBeInTheDocument();
  expect(screen.getByText('Add Matrix')).toBeInTheDocument();
  expect(screen.getByText('Add Text Entry')).toBeInTheDocument();
});

test('adds a multiple-choice question', () => {
  render(<SurveyForm />);
  fireEvent.click(screen.getByText('Add Multiple Choice'));
  expect(screen.getByPlaceholderText('Enter your question')).toBeInTheDocument();
  expect(screen.getByText('Multiple Choice Options')).toBeInTheDocument();
});

test('adds a matrix question', () => {
  render(<SurveyForm />);
  fireEvent.click(screen.getByText('Add Matrix'));
  expect(screen.getByPlaceholderText('Enter your question')).toBeInTheDocument();
  expect(screen.getByText('Matrix Options')).toBeInTheDocument();
});

test('adds a text entry question', () => {
  render(<SurveyForm />);
  fireEvent.click(screen.getByText('Add Text Entry'));
  expect(screen.getByPlaceholderText('Enter your question')).toBeInTheDocument();
  expect(screen.getByText('Text Entry')).toBeInTheDocument();
});
