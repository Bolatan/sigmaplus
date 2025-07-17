export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  type: 'multiple-choice' | 'matrix' | 'text' | 'star-rating' | 'ranking';
  text: string;
  options?: Option[];
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}
