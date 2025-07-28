import Review from "../models/Review.js";
import Lawyer from "../models/Lawyer.js";
import { Request, Response, NextFunction } from "express";
import { getObjectSignedUrl } from "./s3.js";


// @desc Get review with given ID
// @route   GET /api/v1/review/:id
// @access  Public
export const getReview = async (req:Request, res:Response, next:NextFunction) => {
  try {

    const review = await Review.find({ _id: req.params.id })

    if (review.length == 0) {
       res.status(400).json({
        message: "No reviews found",
      });
      return;
    }
    res.status(200).json({ success: true, data: review });


  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
    });
  }
};

// @desc Get all reviews of the camp with the given ID
// @route   GET /api/v1/review/lawyer/:id
// @access  Public
export const getAllReview = async (req: Request, res: Response, next: NextFunction) => {
  const lawyer_id = req.params.id;

  if (!lawyer_id) {
    res.status(400).json({ success: false, error: 'Lawyer ID is required' });
    return;
  }

  try {
    const reviews = await Review.find({ lawyer_id }).populate("user_id", "name photo");

    if (!reviews || reviews.length === 0) {
      res.status(404).json({ success: false, error: 'No reviews found for this lawyer' });
      return;
    }

    for (const review of reviews) {
      const user = review.user_id as { photo?: string };
      if (user && user.photo && !user.photo.startsWith("http")) {
        user.photo = await getObjectSignedUrl(user.photo);
      }
    }

    res.status(200).json({ success: true, data: reviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
// @desc Create a new review
// @route   POST /api/v1/review
// @access Private
export const createReview = async (req:Request, res:Response, next:NextFunction)=> {
  try {


    req.body.user_id = req.user?.id;


    const review = await Review.create(req.body);

    const lawyer = await Lawyer.findById(review.lawyer_id);

    if(!lawyer){
      res.status(404).json({
       success: false,
       message: `Cannot find lawyer`,
     });
   return;
   }

    const total = lawyer.avgRating ? lawyer.avgRating * lawyer.reviewCount : 0;
    const newCount = lawyer.reviewCount + 1;
    const newAvg = (total + review.rating) / newCount;

    lawyer.reviewCount = newCount;
    lawyer.avgRating = newAvg;

    await lawyer.save();

    console.log('Review Create' + review)

    res.status(201).json({
      success: true,
      data: review,
    });


  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error creating review. Please try again",
    });
  }
};

// @desc    Update a review by ID
// @route   PUT /api/v1/review/:id
// @access  Private
export const updateReview = async (req:Request, res:Response, next:NextFunction) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
       res.status(404).json({
        success: false,
        message: `Cannot find review`,
      });
    return;
    }


    if (req.user?.id !== review.user_id.toString() && req.user?.role != "admin") {
       res.status(403).json({
        message: "You are not authorized to edit this review.",
      });
      return;
    }


    const lawyer = await Lawyer.findById(review.lawyer_id);

    if(!lawyer){
      res.status(404).json({
       success: false,
       message: `Cannot find lawyer`,
     });
   return;
   }

    const total = lawyer.avgRating ? lawyer.avgRating * lawyer.reviewCount : 0;
    const newAvg = (total + (req.body.rating - review.rating)) / lawyer.reviewCount;

    lawyer.avgRating = newAvg;

    await lawyer.save();

    if (req.body.rating !== undefined) review.rating = req.body.rating;
    if (req.body.comment !== undefined) review.comment = req.body.comment;


    await review.save();


    res.status(200).json({
      success: true,
      message: "Review updated successfully.",
      review,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error updating review. Please try again",
    });
  }
};


// @desc    Delete a review by ID
// @route   DELETE /api/v1/review/:id
// @access  Private
export const deleteReview = async (req:Request, res:Response, next:NextFunction) => {
  try {

    const review = await Review.findById(req.params.id);
    if (!review) {
       res.status(404).json({
        success: false,
        message: `Cannot find review`,
      });
      return;
    }

    if (req.user?.id !== review.user_id.toString() && req.user?.role != "admin") {
       res.status(403).json({
        message: "You are not authorized to delete this review.",
      });
      return;
    }

    const lawyer = await Lawyer.findById(review.lawyer_id);

    if(!lawyer){
      res.status(404).json({
       success: false,
       message: `Cannot find lawyer`,
     });
   return;
   }

   const totalRating = lawyer.avgRating * lawyer.reviewCount;
      const newCount = Math.max(lawyer.reviewCount - 1, 0);
      const newAvg = newCount === 0 ? 0 : (totalRating - review.rating) / newCount;

      lawyer.reviewCount = newCount;
      lawyer.avgRating = Math.round(newAvg * 100) / 100;

      await lawyer.save();

      await review.deleteOne();

       res.status(200).json({
        success: true,
        message: 'Review deleted successfully.',
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error deleting review. Please try again",
    });
  }
};
