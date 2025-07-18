import News from "../models/News.js";
import NewsLike from "../models/NewsLike.js";
import { generateFileName, uploadFile, getObjectSignedUrl, deleteFile } from "./s3.js";
import { Request, Response ,NextFunction} from "express";

//@desc  Create a news
//POST /api/v1/news
//@access Private
export const createNews = async (req: Request, res: Response, next:NextFunction) => {
  try {

    if (req.file) {
      const imageName = generateFileName();
      await uploadFile(req.file, imageName, req.file.mimetype);
      req.body.image = imageName;
    }

    const newNews = await News.create({
      ...req.body,
      poster_id: req.user?.id,
    });

    res.status(201).json({ success: true, data: newNews });
  } catch (err: any) {
    res
      .status(400)
      .json({
        success: false,
        message: "Failed to create News",
        error: err.message,
      });
  }
};

//@desc Get all news
//GET /api/v1/news
//@access Public
export const getAllNews = async (req: Request, res: Response, next:NextFunction) => {
  try {
    const newsList = await News.find().populate("poster_id", "name").sort({ createdAt: -1 }).lean();

    const processedNews = await Promise.all(
      newsList.map(async (newsItem) => {


        if (newsItem.image && !newsItem.image.startsWith("http")) {
          newsItem.image = await getObjectSignedUrl(newsItem.image);
        }

        (newsItem as any).like_count = await NewsLike.countDocuments({ news_id: newsItem._id });


        return newsItem;
      })
    );

    res.status(200).json({ success: true, data: processedNews });
  } catch (err:any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch news",
      error: err.message,
    });
  }
};


//@desc Get news by id
//GET /api/v1/news/:id
//@access Public
export const getNews = async (req: Request, res: Response, next:NextFunction) => {
  try {

    const news = await News.findById(req.params.id)
      .populate("poster_id", "name")
      .lean();

    if (!news) {
      res.status(404).json({ success: false, message: "News not found" });
      return;
    }

    News.updateOne({ _id: req.params.id }, { $inc: { view_count: 1 } }).exec();

    if (news.image && !news.image.startsWith("http")) {
      news.image = await getObjectSignedUrl(news.image);
    }

    (news as any).like_count = await NewsLike.countDocuments({ news_id: news._id });

    res.status(200).json({ success: true, data: news });
  } catch (err:any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch news",
      error: err.message,
    });
  }
};

//@desc Update a news
//PUT /api/v1/news/:id
//@access Private
export const updateNews = async (req: Request, res: Response, next:NextFunction) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      res.status(404).json({ success: false, message: "News not found" });
      return;
    }


    const { title, content, category } = req.body;

    if (title !== undefined) news.title = title;
    if (content !== undefined) news.content = content;
    if (category !== undefined) news.category = category;

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
  } catch (err:any) {
    res.status(500).json({
      success: false,
      message: "Failed to update",
      error: err.message,
    });
  }
};


//@desc Delete a news
//DELETE /api/v1/news/:id
//@access Private
export const deleteNews = async (req: Request, res: Response, next:NextFunction) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      res.status(404).json({ success: false, message: "News not found" });
      return
    }

    await deleteFile(news.image);

    await News.deleteOne({ _id: req.params.id });

    res.status(200).json({ success: true, message: "News deleted" });
  } catch (err:any) {
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
export const likeNews = async (req: Request, res: Response, next:NextFunction) => {
  const newsId = req.params.newsId;

  if (!newsId) {
    res.status(400).json({ success: false, error: 'News ID is required' });
    return;
  }

  try {
    const news = await News.findById(newsId);

    if (!news) {
      res.status(404).json({ success: false, error: 'News not found.' });
      return;
    }

    await NewsLike.create({
      news_id: newsId,
      user_id: req.user?.id,
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
export const unlikeNews = async (req: Request, res: Response, next:NextFunction) => {
  const newsId = req.params.newsId;

  if (!newsId) {
    res.status(400).json({ success: false, error: 'News ID is required' });
    return;
  }

  try {
    const result = await NewsLike.deleteOne({
      news_id: newsId,
      user_id: req.user?.id,
    });

    if (result.deletedCount === 0) {
      res.status(404).json({ success: false, message: 'Like not found.' });
      return;
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
export const likeCheck = async (req: Request, res: Response, next:NextFunction) => {
  const newsId = req.params.newsId;

  if (!newsId) {
    res.status(400).json({ success: false, error: 'Forum ID is required' });
    return;
  }

  try {
    const alreadyLiked = await NewsLike.exists({ user_id: req.user?.id, news_id: newsId });
    console.log(alreadyLiked)

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
