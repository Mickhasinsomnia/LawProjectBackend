const News = require("../models/News");
const {
  generateFileName,
  uploadFile,
  getObjectSignedUrl,
  deleteFile,
} = require("./s3.js");

exports.createNews = async (req, res) => {
  try {

    if (req.file) {
      const imageName = generateFileName();
      await uploadFile(req.file, imageName, req.file.mimetype);
      req.body.image = imageName;
    }

    const newNews = await News.create({
      ...req.body,
      poster_id: req.user.id,
    });

    res.status(201).json({ success: true, data: newNews });
  } catch (err) {
    res
      .status(400)
      .json({
        success: false,
        message: "Failed to create News",
        error: err.message,
      });
  }
};


exports.getAllNews = async (req, res) => {
  try {
    const news = await News.find().populate("poster_id", "name");

    for (const some of news) {

      if (some.image && !some.image.startsWith("http")) {
        some.image = await getObjectSignedUrl(some.image);
      }
    }

    res.status(200).json({ success: true, data: news });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch news",
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

    if (news.image && !news.image.startsWith("http")) {
      news.image = await getObjectSignedUrl(news.image);
    }

    res.status(200).json({ success: true, data: news });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch news",
        error: err.message,
      });
  }
};

exports.updateNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news)
      return res.status(404).json({ success: false, message: "News not found" });


    const { title, content } = req.body;

    if (title !== undefined) news.title = title;
    if (content !== undefined) news.content = content;

    const updated = await news.save();
    const populatedNews = await updated.populate("poster_id", "name");

    res.status(200).json({ success: true, data: populatedNews });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update",
      error: err.message,
    });
  }
};



exports.deleteNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news)
      return res
        .status(404)
        .json({ success: false, message: "News not found" });

    await deleteFile(news.image);

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
