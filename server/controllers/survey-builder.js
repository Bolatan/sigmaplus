export const getSurveyBuilderData = async (req, res, next) => {
  try {
    res.json({ status: 'success', data: { message: 'Survey builder data will be here.' } });
  } catch (error) {
    next(error);
  }
};
