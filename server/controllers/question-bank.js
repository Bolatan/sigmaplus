import db from '../utils/knex.js';

export const getQuestionBank = async (req, res, next) => {
  try {
    const questions = await db('question_bank').select('*');
    const parsedQuestions = questions.map(q => ({
      ...q,
      options: q.options ? JSON.parse(q.options) : null,
    }));
    res.json({ status: 'success', data: { questions: parsedQuestions } });
  } catch (error) {
    next(error);
  }
};
