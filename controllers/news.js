const News = require("../models/News");


exports.createNews = async (req, res) => {
  try {
    const newNews = await Forum.create({
      ...req.body,
      poster_id: req.user.id,
    });

    res.status(201).json({ success: true, data: newNews });
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


exports.getAllNews = async (req, res) => {
  try {
    const news = await News.find().populate("poster_id", "name");
    res.status(200).json({ success: true, data: news });
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


exports.getNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id).populate("poster_id", "name");
    if (!news)
      return res
        .status(404)
        .json({ success: false, message: "News not found" });

    res.status(200).json({ success: true, data: news });
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

exports.updateForum = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news)
      return res.status(404).json({ success: false, message: "News not found" });


    const { title, content } = req.body;

    if (title !== undefined) forum.title = title;
    if (content !== undefined) forum.content = content;

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
    const forum = await News.findById(req.params.id);
    if (!forum)
      return res
        .status(404)
        .json({ success: false, message: "News not found" });



    await News.deleteOne({ _id: req.params.id });

    res.status(200).json({ success: true, message: "News deleted" });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete news",
        error: err.message,
      });
  }
};
