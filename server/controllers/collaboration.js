export const getCollaborationData = async (req, res, next) => {
  try {
    res.json({ status: 'success', data: { message: 'Collaboration data will be here.' } });
  } catch (error) {
    next(error);
  }
};
