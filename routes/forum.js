const express = require('express');
const { createForum, getForums, getForum, updateForum, deleteForum } = require('../controllers/forum');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const router = express.Router();

router.get('/', getForums);
router.get('/:id', getForum);
router.post('/', protect, authorize('user'), upload.single('image'),createForum);
router.put('/:id', protect, authorize('user','admin'), upload.single('image'), updateForum);
router.delete('/:id', protect, authorize('user','admin'), deleteForum);

module.exports = router;
