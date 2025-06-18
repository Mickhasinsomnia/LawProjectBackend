const express = require('express');
const { addComment , getCommentByForum , editComment, deleteComment  } = require('../controllers/comment');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.post('/:forumId/comment', protect,addComment);
router.get('/:forumId/comment', getCommentByForum);
router.put('/:forumId/comment/:commentId',protect,editComment)
router.delete('/:forumId/comment/:commentId',protect,deleteComment)

module.exports = router;
