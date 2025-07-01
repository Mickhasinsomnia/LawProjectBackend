import express from 'express';
import { addComment, getCommentByForum, editComment, deleteComment } from '../controllers/comment.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/:forumId/comment', protect, addComment);
router.get('/:forumId/comment', getCommentByForum);
router.put('/:forumId/comment/:commentId', protect, editComment);
router.delete('/:forumId/comment/:commentId', protect, deleteComment);

export default router;
