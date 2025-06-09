const Comment = require('../models/Comment');



//@desc  Add new comment
//POST /api/v1/posts/:postId/comment
//@access Private
exports.addComment = async (req, res, next) => {
  try {

    const comment = await Comment.create( {
      ...req.body,
      user_id : req.user.id,
      forum_id : req.params.forumId

    });
    return res.status(201).json({
      success: true,
      data: comment,
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({
      success: false,
      message: "Failed to add comment",
      error: err.message,
    });
  }
};
