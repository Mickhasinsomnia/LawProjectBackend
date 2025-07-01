import Forum from "../models/Forum.js";
import ForumLike from "../models/ForumLike.js";
import Comment from "../models/Comment.js";
import { generateFileName, uploadFile, getObjectSignedUrl, deleteFile } from "./s3.js";
import { Request, Response, NextFunction } from "express";

//@desc  Create a forum
//POST /api/v1/forum
//@access Private
export const createForum = async (req: Request, res: Response, next:NextFunction) => {
  try {

    if (req.file) {
      const imageName = generateFileName();
      await uploadFile(req.file, imageName, req.file.mimetype);
      req.body.image = imageName;
    }

    const newForum = await Forum.create({
      ...req.body,
      poster_id: req.user?.id,
    });

    res.status(201).json({ success: true, data: newForum });
  } catch (err: any) {
    res
      .status(400)
      .json({
        success: false,
        message: "Failed to create Forum",
        error: err.message,
      });
  }
};

//@desc Get all forum
//GET /api/v1/forum
//@access Public
export const getForums = async (req: Request, res: Response, next:NextFunction) => {
  try {
    const forums = await Forum.find().populate("poster_id", "name photo").lean();

    const processedForums = await Promise.all(
      forums.map(async (forum) => {

        if (forum.image && !forum.image.startsWith("http")) {
          forum.image = await getObjectSignedUrl(forum.image);
        }


        const poster = forum.poster_id as { photo?: string; };
        if (poster && poster.photo &&!poster.photo.startsWith("http")) {
              poster.photo = await getObjectSignedUrl(poster.photo);
        }

        const [commentCount, likeCount] = await Promise.all([
          Comment.countDocuments({ forum_id: forum._id }),
          ForumLike.countDocuments({ forum_id: forum._id }),
        ]);

        (forum as any).comment_count = commentCount;
        (forum as any).like_count = likeCount;

        return forum;
      })
    );

    res.status(200).json({ success: true, data: processedForums });
  } catch (err:any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch forums",
      error: err.message,
    });
  }
};



//@desc Get forum by id
//GET /api/v1/forum/:id
//@access Public
export const getForum = async (req: Request, res: Response, next:NextFunction) => {
  try {

    const forum = await Forum.findById(req.params.id)
      .populate("poster_id", "name")
      .lean();

    if (!forum) {
      res.status(404).json({ success: false, message: "Forum not found" });
      return;
    }

    Forum.updateOne({ _id: req.params.id }, { $inc: { view_count: 1 } }).exec();

    if (forum.image && !forum.image.startsWith("http")) {
      forum.image = await getObjectSignedUrl(forum.image);
    }

    const [commentCount, likeCount] = await Promise.all([
      Comment.countDocuments({ forum_id: forum._id }),
      ForumLike.countDocuments({ forum_id: forum._id }),
    ]);

    (forum as any).comment_count = commentCount;
    (forum as any).like_count = likeCount;

    res.status(200).json({ success: true, data: forum });
  } catch (err:any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch forum",
      error: err.message,
    });
  }
};


//@desc Update an forum
//PUT /api/v1/forum/:id
//@access Private
export const updateForum = async (req: Request, res: Response, next:NextFunction) => {
  try {
    const forum = await Forum.findById(req.params.id);
    if (!forum){
      res.status(404).json({ success: false, message: "Forum not found" });
      return;
    }


    if (forum.poster_id.toString() !== req.user?.id && req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: "Unauthorized" });
      return;
    }


    const { title, content } = req.body;

    if (title !== undefined) forum.title = title;
    if (content !== undefined) forum.content = content;

    if (req.file) {
      const imageName = generateFileName();
      if (forum.image) {
          await deleteFile(forum.image);
      }
      await uploadFile(req.file, imageName, req.file.mimetype);
      forum.image = imageName;
    }

    const updated = await forum.save();
    const populatedForum = await updated.populate("poster_id", "name");

    res.status(200).json({ success: true, data: populatedForum });
  } catch (err:any) {
    res.status(500).json({
      success: false,
      message: "Failed to update",
      error: err.message,
    });
  }
};


//@desc Delete a forum
//DELETE /api/v1/forum/:id
//@access Private
export const deleteForum = async (req: Request, res: Response, next:NextFunction) => {
  try {
    const forum = await Forum.findById(req.params.id);
    if (!forum){
      res.status(404).json({ success: false, message: "Forum not found" });
      return;
    }

    if (forum.poster_id.toString() !== req.user?.id && req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: "Unauthorized" });
      return;
    }

    if (forum.image) {
      await deleteFile(forum.image);
    }
    await Forum.deleteOne({ _id: req.params.id });

    res.status(200).json({ success: true, message: "Forum deleted" });
  } catch (err:any) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete forum",
        error: err.message,
      });
  }
};

//@desc  Like the forum
//POST /api/v1/forum/:forumId/like
//@access Private
export const likeForum = async (req: Request, res: Response, next:NextFunction) => {

  const forumId = req.params.forumId;
    if (!forumId) {
      res.status(400).json({ success: false, error: 'Forum ID is required' });
      return;
    }
    try {

      const exists = await Forum.exists({ _id: forumId });

      if (!exists) {
        res.status(404).json({ success: false, error: 'Forum not found.' });
        return;
      }

      const like = await ForumLike.create({
        forum_id:forumId,
        user_id:req.user?.id
      });

    res.status(200).json({ success: true});
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to add like",
      });
  }
};

//@desc  Unlike the forum
//DELETE /api/v1/forum/:forumId/like
//@access Private
export const unlikeForum = async (req: Request, res: Response, next:NextFunction) => {
  const forumId = req.params.forumId;

  if (!forumId) {
    res.status(400).json({ success: false, error: 'Forum ID is required' });
    return;
  }

  try {
    const result = await ForumLike.deleteOne({
      forum_id: forumId,
      user_id: req.user?.id,
    });

    if (result.deletedCount === 0) {
      res.status(404).json({ success: false, message: 'Like not found.' });
      return;
    }

    res.status(200).json({ success: true, message: 'Forum unliked successfully.' });
  } catch (err:any) {
    res.status(500).json({
      success: false,
      message: 'Failed to unlike forum',
      error: err.message,
    });
  }
};

//@desc  Check if user already liked the forum
//GET /api/v1/forum/:forumId/like
//@access Private
export const likeCheck = async (req: Request, res: Response, next:NextFunction) => {
  const forumId = req.params.forumId;

  if (!forumId) {
    res.status(400).json({ success: false, error: 'Forum ID is required' });
    return;
  }

  try {
    const alreadyLiked = await ForumLike.exists({ user_id: req.user?.id, forum_id: forumId });

    res.status(200).json({
      success: true,
      liked: Boolean(alreadyLiked)
    });

  } catch (err:any) {
    res.status(500).json({
      success: false,
      message: 'Failed to check like status',
      error: err.message,
    });
  }
};
