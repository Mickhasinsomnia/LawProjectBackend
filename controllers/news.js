const News = require("../models/News");
const NewsLike = require('../models/NewsLike')
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

    for (let i = 0; i < news.length; i++) {
         const some = news[i];

         const obj = some.toObject();

         if (obj.image && !obj.image.startsWith("http")) {
           obj.image = await getObjectSignedUrl(obj.image);
         }

         obj.like_count = await NewsLike.countDocuments({ forum_id: obj._id });

         news[i] = obj;
       }

    res.status(200).json({ success: true, data: news });
  } catch (err) {
    res.status(500).json({
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

    news.view_count += 1;
    await news.save();

    if (news.image && !news.image.startsWith("http")) {
      news.image = await getObjectSignedUrl(news.image);
    }

    const obj = news.toObject();
    obj.like_count = await NewsLike.countDocuments({ news_id: obj._id });

    res.status(200).json({ success: true, data: obj });
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

    if (req.file) {
      const imageName = generateFileName();
      if (news.image) {
          await deleteFile(news.image);
      }
      await uploadFile(req.file, imageName, req.file.mimetype);
      news.image = imageName;
    }

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

// @desc    Like the news
// @route   POST /api/v1/news/:newsId/like
// @access  Private
exports.likeNews = async (req, res) => {
  const newsId = req.params.newsId;

  if (!newsId) {
    return res.status(400).json({ success: false, error: 'News ID is required' });
  }

  try {
    const news = await News.findById(newsId);

    if (!news) {
      return res.status(404).json({ success: false, error: 'News not found.' });
    }

    await NewsLike.create({
      news_id: newsId,
      user_id: req.user.id,
    });

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to like news",
      error: err.message,
    });
  }
};

//@desc  Unlike the news
//DELETE /api/v1/news/:newsId/like
//@access Private
exports.unlikeNews = async (req, res) => {
  const newsId = req.params.newsId;

  if (!newsId) {
    return res.status(400).json({ success: false, error: 'News ID is required' });
  }

  try {
    const result = await NewsLike.deleteOne({
      news_id: newsId,
      user_id: req.user.id,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Like not found.' });
    }

    res.status(200).json({ success: true, message: 'News unliked successfully.' });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to unlike news',
      error: err.message,
    });
  }
};
