const Article = require("../models/Article.js");
const ArticleLike = require("../models/ArticleLike.js")

const {
  generateFileName,
  uploadFile,
  getObjectSignedUrl,
  deleteFile,
} = require("./s3.js");


//@desc  Create an article
//POST /api/v1/article
//@access Private
exports.createArticle = async (req, res) => {
  try {

    if (req.file) {
      const imageName = generateFileName();
      await uploadFile(req.file, imageName, req.file.mimetype);
      req.body.image = imageName;
    }

    const newArticle = await Article.create({
      ...req.body,
      poster_id: req.user.id,
    });

    res.status(201).json({ success: true, data: newArticle });
  } catch (err) {
    res
      .status(400)
      .json({
        success: false,
        message: "Failed to create Article",
        error: err.message,
      });
  }
};

//@desc Get all article
//GET /api/v1/article
//@access Public
exports.getArticles = async (req, res) => {
  try {
    const articles = await Article.find().populate("poster_id", "name photo").lean();

    const processedArticles = await Promise.all(
      articles.map(async (article) => {

        if (article.image && !article.image.startsWith("http")) {
          article.image = await getObjectSignedUrl(article.image);
        }


        if (article.poster_id && article.poster_id.photo &&!article.poster_id.photo.startsWith("http")) {
              article.poster_id.photo = await getObjectSignedUrl(article.poster_id.photo);
        }

        const [likeCount] = await Promise.all([
          ArticleLike.countDocuments({ article_id: article._id }),
        ]);


        article.like_count = likeCount;

        return article;
      })
    );

    res.status(200).json({ success: true, data: processedArticles });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch articles",
      error: err.message,
    });
  }
};


//@desc Get article by id
//GET /api/v1/article/:id
//@access Public
exports.getArticle = async (req, res) => {
  try {

    const article = await Article.findById(req.params.id)
      .populate("poster_id", "name")
      .lean();

    if (!article) {
      return res.status(404).json({ success: false, message: "Article not found" });
    }

    Article.updateOne({ _id: req.params.id }, { $inc: { view_count: 1 } }).exec();

    if (article.image && !article.image.startsWith("http")) {
      article.image = await getObjectSignedUrl(article.image);
    }

    const [likeCount] = await Promise.all([
      ArticleLike.countDocuments({ article_id: article._id }),
    ]);


    article.like_count = likeCount;

    res.status(200).json({ success: true, data: article });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch article",
      error: err.message,
    });
  }
};



//@desc Update an article
//PUT /api/v1/article/:id
//@access Private
exports.updateArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article)
      return res.status(404).json({ success: false, message: "Article not found" });

    if (article.poster_id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }


    const { title, content } = req.body;

    if (title !== undefined) article.title = title;
    if (content !== undefined) article.content = content;

    if (req.file) {
      const imageName = generateFileName();
      if (article.image) {
          await deleteFile(article.image);
      }
      await uploadFile(req.file, imageName, req.file.mimetype);
      article.image = imageName;
    }

    const updated = await article.save();
    const populatedArticle = await updated.populate("poster_id", "name");

    res.status(200).json({ success: true, data: populatedArticle });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update",
      error: err.message,
    });
  }
};


//@desc Delete an article
//DELETE /api/v1/article/:id
//@access Private
exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article)
      return res
        .status(404)
        .json({ success: false, message: "Article not found" });

    if (article.poster_id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (article.image) {
      await deleteFile(article.image);
    }
    await Article.deleteOne({ _id: req.params.id });

    res.status(200).json({ success: true, message: "Article deleted" });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete article",
        error: err.message,
      });
  }
};

exports.likeArticle = async (req, res) => {

  const articleId = req.params.articleId;
    if (!articleId) {
      return res.status(400).json({ success: false, error: 'Article ID is required' });
    }
    try {

      const exists = await Article.exists({ _id: articleId });

      if (!exists) {
        return res.status(404).json({ success: false, error: 'Article not found.' });
      }

      const like = await ArticleLike.create({
        article_id:articleId,
        user_id:req.user.id
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

//@desc  Unlike the article
//DELETE /api/v1/article/:articleId/like
//@access Private
exports.unlikeArticle = async (req, res) => {
  const articleId = req.params.articleId;

  if (!articleId) {
    return res.status(400).json({ success: false, error: 'Article ID is required' });
  }

  try {
    const result = await ArticleLike.deleteOne({
      article_id: articleId,
      user_id: req.user.id,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Like not found.' });
    }

    res.status(200).json({ success: true, message: 'Article unliked successfully.' });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to unlike article',
      error: err.message,
    });
  }
};

//@desc  Check if user already liked the article
//GET /api/v1/article/:articleId/like
//@access Private
exports.likeCheck = async (req, res) => {
  const articleId = req.params.articleId;

  if (!articleId) {
    return res.status(400).json({ success: false, error: 'Article ID is required' });
  }

  try {
    const alreadyLiked = await ArticleLike.exists({ user_id: req.user.id, article_id: articleId });

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
