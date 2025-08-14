export const getMarketResearchData = async (req, res, next) => {
  try {
    res.json({ status: 'success', data: { message: 'Market research data will be here.' } });
  } catch (error) {
    next(error);
  }
};
