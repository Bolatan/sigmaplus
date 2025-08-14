export const getMultiSurveyAnalysisData = async (req, res, next) => {
  try {
    res.json({ status: 'success', data: { message: 'Multi-survey analysis data will be here.' } });
  } catch (error) {
    next(error);
  }
};
