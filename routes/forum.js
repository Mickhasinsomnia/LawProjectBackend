const express = require('express');
const { createForum, getForums, getForum, updateForum, deleteForum,likeForum,unlikeForum,likeCheck } = require('../controllers/forum');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const router = express.Router();

router.get('/', getForums);
router.get('/:id', getForum);
router.post('/', protect, authorize('user','admin'), upload.single('image'),createForum);
router.put('/:id', protect, authorize('user','admin'), upload.single('image'), updateForum);
router.delete('/:id', protect, authorize('user','admin'), deleteForum);
router.post('/:forumId/like', protect,likeForum);
router.delete('/:forumId/like', protect,unlikeForum);
router.get('/:forumId/like', protect,likeCheck);

module.exports = router;
