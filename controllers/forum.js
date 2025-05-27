const Forum = require("../models/Forum");

// Create a Forum
exports.createForum = async (req, res) => {
  try {
    const newForum = await Forum.create({
      ...req.body,
      user_id: req.user.id,
    });

    const populatedForum = await newForum.populate({
      path: "user_id",
      select: "name",
    });

    res.status(201).json({ success: true, data: populatedForum });
  } catch (err) {
    res
      .status(400)
      .json({
        success: false,
        message: "Failed to create Forum",
        error: err.message,
      });
  }
};

// Get all Forums
exports.getForums = async (req, res) => {
  try {
    const forums = await Forum.find().populate("user_id", "name");
    res.status(200).json({ success: true, data: forums });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch forums",
        error: err.message,
      });
  }
};

// Get single Forum
exports.getForum = async (req, res) => {
  try {
    const forum = await Forum.findById(req.params.id).populate("user_id", "name");
    if (!forum)
      return res
        .status(404)
        .json({ success: false, message: "Forum not found" });

    res.status(200).json({ success: true, data: forum });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch forum",
        error: err.message,
      });
  }
};

// Update a Forum (only owner)
exports.updateForum = async (req, res) => {
  try {
    const forum = await Forum.findById(req.params.id);
    if (!forum)
      return res.status(404).json({ success: false, message: "Forum not found" });

    if (forum.user_id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { title, description, tags } = req.body;

    if (title !== undefined) forum.title = title;
    if (description !== undefined) forum.description = description;
    if (tags !== undefined) forum.tags = tags;

    const updated = await forum.save();
    const populatedForum = await updated.populate("user_id", "name");

    res.status(200).json({ success: true, data: populatedForum });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update",
      error: err.message,
    });
  }
};


// Delete a Forum (only owner)
exports.deleteForum = async (req, res) => {
  try {
    const forum = await Forum.findById(req.params.id);
    if (!forum)
      return res
        .status(404)
        .json({ success: false, message: "Forum not found" });

    if (forum.user_id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await Forum.deleteOne({ _id: req.params.id });

    res.status(200).json({ success: true, message: "Forum deleted" });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete forum",
        error: err.message,
      });
  }
};
