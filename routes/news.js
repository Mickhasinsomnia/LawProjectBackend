const express = require('express');
const { createNews, getAllNews, getNews, updateNews, deleteNews } = require('../controllers/forum');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getAllNews);
router.get('/:id', getNews);
router.post('/', protect, authorize('admin'), createNews);
router.put('/:id', protect, authorize('admin'), updateNews);
router.delete('/:id', protect, authorize('admin'), deleteNews);

module.exports = router;
