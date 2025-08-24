const questionBank = [
    { text: 'What is your age?', type: 'single-choice', options: JSON.stringify(['Under 18', '18-24', '25-34', '35-44', '45+']) },
    { text: 'What is your gender?', type: 'single-choice', options: JSON.stringify(['Male', 'Female', 'Other']) },
    { text: 'What is your annual household income?', type: 'single-choice', options: JSON.stringify(['Less than $25,000', '$25,000 to $49,999', '$50,000 to $99,999', '$100,000 to $149,999', '$150,000 or more']) },
    { text: 'What is your highest level of education?', type: 'single-choice', options: JSON.stringify(['High school or less', 'Some college', 'Bachelor\'s degree', 'Master\'s degree', 'Doctoral degree']) },
    { text: 'Which of the following social media platforms do you use?', type: 'multiple-choice', options: JSON.stringify(['Facebook', 'Twitter', 'Instagram', 'LinkedIn', 'TikTok', 'Other']) },
    { text: 'How satisfied are you with our product?', type: 'matrix', options: JSON.stringify(['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied']) },
    { text: 'How likely are you to recommend our company to a friend or colleague?', type: 'nps', options: JSON.stringify(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10']) },
    { text: 'Please rank the following features in order of importance.', type: 'ranking', options: JSON.stringify(['Feature A', 'Feature B', 'Feature C', 'Feature D']) },
    { text: 'What is your employment status?', type: 'single-choice', options: JSON.stringify(['Employed full-time', 'Employed part-time', 'Self-employed', 'Unemployed', 'Student', 'Retired']) },
    { text: 'How often do you purchase our products?', type: 'single-choice', options: JSON.stringify(['Daily', 'Weekly', 'Monthly', 'A few times a year', 'Rarely']) },
    { text: 'What factors influence your purchasing decisions?', type: 'multiple-choice', options: JSON.stringify(['Price', 'Quality', 'Brand reputation', 'Customer service', 'Recommendations']) },
    { text: 'Please provide any additional feedback.', type: 'open-ended', options: null },
    { text: 'What is your marital status?', type: 'single-choice', options: JSON.stringify(['Single', 'Married', 'Divorced', 'Widowed']) },
    { text: 'How did you hear about us?', type: 'multiple-choice', options: JSON.stringify(['Social media', 'Search engine', 'Friend or colleague', 'Advertisement', 'Other']) },
    { text: 'On a scale of 1 to 5, how easy was it to use our website?', type: 'matrix', options: JSON.stringify(['1 (Very Difficult)', '2', '3', '4', '5 (Very Easy)']) }
];

exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('question_bank').del();
  // Inserts seed entries
  await knex('question_bank').insert(questionBank);
};
