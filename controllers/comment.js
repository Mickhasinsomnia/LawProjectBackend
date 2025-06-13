const Comment = require('../models/Comment');
const Forum = require('../models/Forum');


//@desc  Add new comment
//POST /api/v1/forum/:forumId/comment
//@access Private
exports.addComment = async (req, res, next) => {
  try {

    const forum_id = req.params.forumId;

    if (!forum_id) {
        return res.status(400).json({ error: 'Forum ID is required in the request body.' });
    }

    const forum = await Forum.findById(req.params.forumId);

    if (!forum) {
      return res.status(404).json({
        success: false,
        message: "Forum not found",
      });
    }

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


//@desc  Get comment from forum
//POST /api/v1/forum/:forumId/comment
//@access Private
exports.getCommentByForum = async (req,res,next) => {

  const forum_id = req.params.forumId;

  if (!forum_id) {
    return res.status(400).json({ success: false, error: 'Forum ID is required' });
  }

  try {
    const forum = await Forum.findById(forum_id);

    if (!forum) {
      return res.status(404).json({ success: false, error: 'Forum not found.' });
    }

    const comments = await Comment.find({ forum_id }).populate("user_id","name");

    if (!comments || comments.length === 0) {

      return res.status(404).json({ success: false, error: 'Comments not found' });


    }


    return res.status(200).json({ success: true, comments });

  } catch (error) {
    return res.status(500).json({ success: false, error: 'Server error' });
  }


}
