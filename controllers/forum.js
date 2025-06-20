const Forum = require("../models/Forum");
const Comment = require("../models/Comment");
const {
  generateFileName,
  uploadFile,
  getObjectSignedUrl,
  deleteFile,
} = require("./s3.js");
// Create a Forum
exports.createForum = async (req, res) => {
  try {

    if (req.file) {
      const imageName = generateFileName();
      await uploadFile(req.file, imageName, req.file.mimetype);
      req.body.image = imageName;
    }

    const newForum = await Forum.create({
      ...req.body,
      poster_id: req.user.id,
    });

    res.status(201).json({ success: true, data: newForum });
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

    const forums = await Forum.find().populate("poster_id", "name");

    for (let i = 0; i < forums.length; i++) {
         const forum = forums[i];

         const obj = forum.toObject();

         if (obj.image && !obj.image.startsWith("http")) {
           obj.image = await getObjectSignedUrl(obj.image);
         }

         obj.comment_count = await Comment.countDocuments({ forum_id: obj._id });

         forums[i] = obj;
       }


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


exports.getForum = async (req, res) => {
  try {
    const forum = await Forum.findById(req.params.id).populate("poster_id", "name");
    if (!forum)
      return res
        .status(404)
        .json({ success: false, message: "Forum not found" });

    forum.view_count += 1;
    await forum.save();

    if (forum.image && !forum.image.startsWith("http")) {
      forum.image = await getObjectSignedUrl(forum.image);
    }

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

    if (forum.poster_id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Unauthorized" });
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

    if (forum.poster_id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (forum.image) {
      await deleteFile(forum.image);
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
