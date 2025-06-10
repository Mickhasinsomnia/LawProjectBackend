const express = require('express');
const { addComment , getCommentByForum } = require('../controllers/comment');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.post('/:forumId/comment', protect,addComment);
router.get('/:forumId/comment', getCommentByForum);

module.exports = router;
