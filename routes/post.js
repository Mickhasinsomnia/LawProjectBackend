const express = require('express');
const { createPost, getPosts, getPost, updatePost, deletePost } = require('../controllers/post');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getPosts);
router.get('/:id', getPost);
router.post('/', protect, authorize('user'), createPost);
router.put('/:id', protect, authorize('user'), updatePost);
router.delete('/:id', protect, authorize('user'), deletePost);

module.exports = router;
