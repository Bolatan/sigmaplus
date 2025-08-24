import express from 'express';

const router = express.Router();

// @route   GET api/collaboration/test
// @desc    Tests collaboration route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Collaboration route works' }));

export default router;
