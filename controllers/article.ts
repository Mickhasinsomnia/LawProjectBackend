import Article from "../models/Article.js";
import ArticleLike from "../models/ArticleLike.js";
import { generateFileName, uploadFile, getObjectSignedUrl, deleteFile } from "./s3.js";
import { Request, Response } from "express";


//@desc  Create an article
//POST /api/v1/article
//@access Private
export const createArticle = async (req: Request, res: Response) => {
  try {

    if (req.file) {
      const imageName = generateFileName();
      await uploadFile(req.file, imageName, req.file.mimetype);
      req.body.image = imageName;
    }

    const newArticle = await Article.create({
      ...req.body,
      poster_id: req.user?.id,
    });

    res.status(201).json({ success: true, data: newArticle });
  } catch (err: any) {
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
export const getArticles = async (req: Request, res: Response) => {
  try {
    const articles = await Article.find().populate("poster_id", "name photo").sort({ createdAt: -1 }).lean();

    const processedArticles = await Promise.all(
      articles.map(async (article) => {

        if (article.image && !article.image.startsWith("http")) {
          article.image = await getObjectSignedUrl(article.image);
        }



        const poster = article.poster_id as { photo?: string; };
        if (poster && poster.photo && !poster.photo.startsWith("http")) {
          poster.photo = await getObjectSignedUrl(poster.photo);
        }


        (article as any).like_count = await ArticleLike.countDocuments({ article_id: article._id });

        return article;
      })
    );

    res.status(200).json({ success: true, data: processedArticles });
  } catch (err: any) {
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
export const getArticle = async (req: Request, res: Response) => {
  try {

    const article = await Article.findById(req.params.id)
      .populate("poster_id", "name photo")
      .lean();

    if (!article) {
      res.status(404).json({ success: false, message: "Article not found" });
      return;
    }

    Article.updateOne({ _id: req.params.id }, { $inc: { view_count: 1 } }).exec();

    if (article.image && !article.image.startsWith("http")) {
      article.image = await getObjectSignedUrl(article.image);
    }

    const user = article.poster_id as {photo?:string}


    if (user.photo && !user.photo.startsWith("http")) {
      user.photo = await getObjectSignedUrl(user.photo);
    }

    const [likeCount] = await Promise.all([
      ArticleLike.countDocuments({ article_id: article._id }),
    ]);


    (article as any).like_count = likeCount;

    res.status(200).json({ success: true, data: article });
  } catch (err: any) {
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
export const updateArticle = async (req: Request, res: Response) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      res.status(404).json({ success: false, message: "Article not found" });
      return;
    }

    if (article.poster_id.toString() !== req.user?.id && req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: "Unauthorized" });
      return;
    }


    const { title, content ,category} = req.body;

    if (title !== undefined) article.title = title;
    if (content !== undefined) article.content = content;
    if (category !== undefined) article.category = category;

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
  } catch (err: any) {
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
export const deleteArticle = async (req: Request, res: Response) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      res.status(404).json({ success: false, message: "Article not found" });
      return;
    }

    if (article.poster_id.toString() !== req.user?.id && req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: "Unauthorized" });
      return;
    }

    if (article.image) {
      await deleteFile(article.image);
    }
    await Article.deleteOne({ _id: req.params.id });

    res.status(200).json({ success: true, message: "Article deleted" });
  } catch (err: any) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete article",
        error: err.message,
      });
  }
};

export const likeArticle = async (req: Request, res: Response) => {

  const articleId = req.params.articleId;
    if (!articleId) {
      res.status(400).json({ success: false, error: 'Article ID is required' });
      return;
    }
    try {

      const exists = await Article.exists({ _id: articleId });

      if (!exists) {
        res.status(404).json({ success: false, error: 'Article not found.' });
        return;
      }

      const like = await ArticleLike.create({
        article_id:articleId,
        user_id:req.user?.id
      });

    res.status(200).json({ success: true});
  } catch (err: any) {
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
export const unlikeArticle = async (req: Request, res: Response) => {
  const articleId = req.params.articleId;

  if (!articleId) {
    res.status(400).json({ success: false, error: 'Article ID is required' });
    return;
  }

  try {
    const result = await ArticleLike.deleteOne({
      article_id: articleId,
      user_id: req.user?.id,
    });

    if (result.deletedCount === 0) {
      res.status(404).json({ success: false, message: 'Like not found.' });
      return;
    }

    res.status(200).json({ success: true, message: 'Article unliked successfully.' });
  } catch (err: any) {
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
export const likeCheck = async (req: Request, res: Response) => {
  const articleId = req.params.articleId;

  if (!articleId) {
    res.status(400).json({ success: false, error: 'Article ID is required' });
    return;
  }

  try {
    const alreadyLiked = await ArticleLike.exists({ user_id: req.user?.id, article_id: articleId });

    res.status(200).json({
      // ...rest of the code
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

//@desc Get articles by specific lawyer
//GET /api/v1/article/lawyer/:lawyerId
//@access Public
export const getArticleByLawyer = async (req: Request, res: Response) => {
  try {
    const { lawyerId } = req.params // Get lawyer ID from URL params instead of req.user.id

    const articles = await Article.find({ poster_id: lawyerId })
      .populate("poster_id", "name photo")
      .sort({ createdAt: -1 })
      .lean()

    const processedArticles = await Promise.all(
      articles.map(async (article) => {
        if (article.image && !article.image.startsWith("http")) {
          article.image = await getObjectSignedUrl(article.image)
        }

        const poster = article.poster_id as { photo?: string }
        if (poster && poster.photo && !poster.photo.startsWith("http")) {
          poster.photo = await getObjectSignedUrl(poster.photo)
        }
        ;(article as any).like_count = await ArticleLike.countDocuments({
          article_id: article._id,
        })

        return article
      }),
    )

    res.status(200).json({ success: true, data: processedArticles })
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch articles",
      error: err.message,
    })
  }
}
