import Comment from '../models/Comment.js';
import Forum from '../models/Forum.js';
import Notification from '../models/Notification.js';
import { getObjectSignedUrl } from "./s3.js";
import { Request, Response, NextFunction } from "express";

//@desc  Add new comment
//POST /api/v1/forum/:forumId/comment
//@access Private
export const addComment = async (req: Request, res: Response , next: NextFunction) => {
  try {
    const forum_id = req.params.forumId;

    if (!forum_id) {
      res.status(400).json({ error: 'Forum ID is required in the request body.' });
      return;
    }

    const forum = await Forum.findById(forum_id);
    if (!forum) {
      res.status(404).json({ success: false, message: "Forum not found" });
      return;
    }

    const comment = await Comment.create({
      ...req.body,
      user_id: req.user?.id,
      forum_id,
    });

    const notification = await Notification.create({
      user: forum.poster_id,  
      type: "comment",
      message: `มีคนแสดงความคิดเห็นในกระทู้ของคุณ: "${forum.title}"`,
      link: `/forum/${forum_id}`,
    });

    console.log("Notification created:", notification);

    res.status(201).json({
      success: true,
      data: comment,
    });
  } catch (err: any) {
    console.error(err);
    res.status(400).json({
      success: false,
      message: "Failed to add comment",
      error: err.message,
    });
  }
};


//@desc  Get comment from forum
//GET /api/v1/forum/:forumId/comment
//@access Private
export const getCommentByForum = async (req: Request, res: Response , next:NextFunction) => {

  const forum_id = req.params.forumId;

  if (!forum_id) {
    res.status(400).json({ success: false, error: 'Forum ID is required' });
    return;
  }

  try {
    const forumExists = await Forum.exists({ _id: forum_id });

    if (!forumExists) {
      res.status(404).json({ success: false, error: 'Forum does not exist.' });
      return;
    }

    const comments = await Comment.find({ forum_id }).populate("user_id","name photo");


    if (!comments || comments.length === 0) {

      res.status(404).json({ success: false, error: 'Comments not found' });
      return;
    }

    for (const comment of comments) {
          const user = comment.user_id as { photo?: string; };
          if (user && user.photo && !user.photo.startsWith("http")) {
            user.photo = await getObjectSignedUrl(user.photo);
          }
    }

    res.status(200).json({ success: true, comments });
    return;

  } catch (error) {
    res.status(500).json({ success: false, error:"server error" });
    return;
  }


}

//@desc  Edit comment in forum
//PUT /api/v1/forum/:forumId/comment/:commentId
//@access Private
export const editComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    const { content } = req.body;

    if (!comment) {
      res.status(404).json({ success: false, message: "Comment not found" });
      return;
    }

    if (comment.user_id.toString() !== req.user?.id && req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: "Unauthorized" });
      return;
    }

    if (content !== undefined) comment.content = content;
    await comment.save();

    res.status(200).json({ success: true, comment });
    return;
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};


//@desc  Delete comment in forum
//DELETE /api/v1/forum/:forumId/comment/:commentId
//@access Private
export const deleteComment = async(req: Request, res: Response , next:NextFunction) => {
  try{
    const comment = await Comment.findById(req.params.commentId);


    if (!comment) {
      res.status(404).json({ success: false, message: "Comment not found" });
      return;
    }


    if (comment.user_id.toString() !== req.user?.id && req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: "Unauthorized" });
      return;
    }

    await Comment.deleteOne({_id:req.params.commentId});

    res.status(200).json({ success: true,  message: "Comment deleted" });
    return;
  }
  catch(error){
    res.status(500).json({ success: false, error: 'Server error' });
    return;
  }
}
