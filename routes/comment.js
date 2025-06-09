const express = require('express');
const { addComment } = require('../controllers/comment');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.post('/:forumId/comment', protect,addComment);

module.exports = router;
