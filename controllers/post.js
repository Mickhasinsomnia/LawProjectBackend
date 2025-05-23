const Post = require("../models/Post");

// Create a Post
exports.createPost = async (req, res) => {
  try {
    const newPost = await Post.create({
      ...req.body,
      user_id: req.user.id,
    });

    const populatedPost = await newPost.populate({
      path: "user_id",
      select: "name",
    });

    res.status(201).json({ success: true, data: populatedPost });
  } catch (err) {
    res
      .status(400)
      .json({
        success: false,
        message: "Failed to create post",
        error: err.message,
      });
  }
};

// Get all Posts
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate("user_id", "name");
    res.status(200).json({ success: true, data: posts });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch posts",
        error: err.message,
      });
  }
};

// Get single Post
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("user_id", "name");
    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });

    res.status(200).json({ success: true, data: post });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch post",
        error: err.message,
      });
  }
};

// Update a Post (only owner)
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });

    if (post.user_id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    Object.assign(post, req.body);
    const updated = await post.save();
    const populatedPost = await updated.populate("user_id", "name");

    res.status(200).json({ success: true, data: populatedPost });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to update post",
        error: err.message,
      });
  }
};

// Delete a Post (only owner)
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });

    if (post.user_id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await Post.deleteOne({ _id: req.params.id });

    res.status(200).json({ success: true, message: "Post deleted" });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete post",
        error: err.message,
      });
  }
};
