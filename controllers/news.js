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
    const newsList = await News.find().populate("poster_id", "name").lean();

    const processedNews = await Promise.all(
      newsList.map(async (newsItem) => {


        if (newsItem.image && !newsItem.image.startsWith("http")) {
          newsItem.image = await getObjectSignedUrl(newsItem.image);
        }

        return newsItem;
      })
    );

    res.status(200).json({ success: true, data: processedNews });
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

    const news = await News.findById(req.params.id)
      .populate("poster_id", "name")
      .lean();

    if (!news) {
      return res.status(404).json({ success: false, message: "News not found" });
    }

    News.updateOne({ _id: req.params.id }, { $inc: { view_count: 1 } }).exec();

    if (news.image && !news.image.startsWith("http")) {
      news.image = await getObjectSignedUrl(news.image);
    }

    news.like_count = await NewsLike.countDocuments({ news_id: news._id });

    res.status(200).json({ success: true, data: news });
  } catch (err) {
    res.status(500).json({
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

    });
  }
};


//@desc  Check if user already liked the news
//GET /api/v1/news/:newsId/like
//@access Private
exports.likeCheck = async (req, res) => {
  const newsId = req.params.newsId;

  if (!newsId) {
    return res.status(400).json({ success: false, error: 'Forum ID is required' });
  }

  try {
    const alreadyLiked = await NewsLike.exists({ user_id: req.user.id, news_id: newsId });
    console.log(alreadyLiked)

    res.status(200).json({
      success: true,
      liked: Boolean(alreadyLiked)
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to check like status',
      error: err.message,
    });
  }
};
