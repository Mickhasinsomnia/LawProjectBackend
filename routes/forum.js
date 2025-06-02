const express = require('express');
const { createForum, getForums, getForum, updateForum, deleteForum } = require('../controllers/forum');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getForums);
router.get('/:id', getForum);
router.post('/', protect, authorize('user'), createForum);
router.put('/:id', protect, authorize('user','admin'), updateForum);
router.delete('/:id', protect, authorize('user','admin'), deleteForum);

module.exports = router;
