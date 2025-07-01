import Lawyer from "../models/Lawyer.js";
import { getObjectSignedUrl } from "./s3.js";
import { Request, Response ,NextFunction } from "express";

// @desc    Create a new lawyer profile
// @route   POST /api/v1/lawyers
// @access  Private
export const addLawyer = async (req: Request, res: Response, next:NextFunction) => {
  try {
    const existing = await Lawyer.findOne({ _id: req.user?.id });
    if (existing) {
      res.status(400).json({ message: "Lawyer data already exists" });
      return;
    }

    const { slogan, summary, lawfirm_name, consultationRate,documentDeliveryRate, civilCase_specialized,criminalCase_specialized, verificationDocs } = req.body;

    const lawyerData = { _id: req.user?.id, slogan, summary, lawfirm_name, consultationRate,documentDeliveryRate, civilCase_specialized, criminalCase_specialized,verificationDocs };

    const newLawyer = await Lawyer.create(lawyerData);

    res.status(201).json({
      success: true,
      message: "Lawyer profile created successfully",
      data: newLawyer,
    });
    return;
  } catch (err: any) {
    console.error(err);
    res.status(400).json({
      success: false,
      message: "Failed to create lawyer profile",
      error: err.message,
    });
    return;
  }
};

// @desc    Get a lawyer profile by ID
// @route   GET /api/v1/lawyers/:id
// @access  Public
export const getLawyerById = async (req: Request, res: Response, next:NextFunction) => {
  try {
    const lawyer = await Lawyer.findById(req.params.id).populate({
      path: '_id',
      select: 'name tel location photo'
    });

    if (!lawyer) {
      res.status(404).json({
        success: false,
        message: "Lawyer not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: lawyer,
    });
    return;
  } catch (err: any) {
    console.error(err);
    res.status(400).json({
      success: false,
      message: "Failed to get lawyers",
      error: err.message,
    });
    return;
  }
};

// @desc    Update a lawyer profile
// @route   PUT /api/v1/lawyers/:id
// @access  Private
export const updateLawyer = async (req: Request, res: Response, next:NextFunction) => {
  try {
    const lawyer = await Lawyer.findById(req.params.id);

    if (!lawyer) {
      res.status(404).json({
        success: false,
        message: "Lawyer not found",
      });
      return;
    }

    if (lawyer._id?.toString() !== req.user?.id && req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const { slogan, summary, lawfirm_name, consultationRate,documentDeliveryRate, civilCase_specialized,criminalCase_specialized, verificationDocs } = req.body;

    if (slogan !== undefined) lawyer.slogan = slogan;
    if (summary !== undefined) lawyer.summary = summary;
    if (lawfirm_name !== undefined) lawyer.lawfirm_name = lawfirm_name;
    if (consultationRate !== undefined) lawyer.consultationRate = consultationRate;
    if (documentDeliveryRate !== undefined) lawyer.documentDeliveryRate = documentDeliveryRate;
    if (civilCase_specialized !== undefined) lawyer.civilCase_specialized = civilCase_specialized;
    if (criminalCase_specialized !== undefined) lawyer.criminalCase_specialized = criminalCase_specialized;
    if (verificationDocs !== undefined) lawyer.verificationDocs = verificationDocs;

    const updated = await lawyer.save();

    res.status(200).json({
      success: true,
      data: updated,
    });
    return;
  } catch (err: any) {
    console.error(err);
    res.status(400).json({
      success: false,
      message: "Failed to update lawyer",
      error: err.message,
    });
    return;
  }
};

// @desc    Delete a lawyer profile
// @route   DELETE /api/v1/lawyers/:id
// @access  Private/Admin or Owner
export const deleteLawyer = async (req: Request, res: Response, next:NextFunction) => {
  try {
    const lawyer = await Lawyer.findById(req.params.id);

    if (!lawyer) {
      res.status(404).json({
        success: false,
        message: "Lawyer not found",
      });
      return;
    }

    if (
      req.user?.role !== "admin" &&
      req.user?.id !== lawyer._id?.toString()
    ) {
      res.status(403).json({
        success: false,
        message: "You are not authorized to delete this profile",
      });
      return;
    }



    await lawyer.deleteOne();



    res.status(200).json({
      success: true,
      message: "Lawyer profile deleted successfully",
    });
    return;
  } catch (err:any) {
    console.error(err);
    res.status(400).json({
      success: false,
      message: "Failed to change verify status",
      error: err.message,
    });
    return;
  }
};

// @desc    Get all lawyers
// @route   GET /api/v1/lawyers
// @access  Public
export const getAllLawyers = async (req: Request, res: Response, next:NextFunction) => {
  try {
    const lawyers = await Lawyer.find().populate({
      path: "_id",
      select: "name tel location photo"
    });

    for (const lawyer of lawyers) {
      const user = lawyer._id as { photo?: string; };;

      if (user.photo && !user.photo.startsWith("http")) {
        user.photo = await getObjectSignedUrl(user.photo);
      }
    }

    res.status(200).json({
      success: true,
      data: lawyers,
    });
    return;
  } catch (err: any) {
    console.error(err);
    res.status(400).json({
      success: false,
      message: "Failed to delete lawyer",
      error: err.message,
    });
    return;
  }
};


// @desc    Admin change verify status
// @route   DELETE /api/v1/lawyers/status/:id
// @access  Private/Admin
export const changeVerifyStatus = async (req: Request, res: Response, next:NextFunction)=>{
  const lawyer = await Lawyer.findById(req.params.id);

  if (!lawyer) {
    res.status(404).json({
      success: false,
      message: "Lawyer not found",
    });
    return;
  }

  const { is_verified_by_council, has_law_license } = req.body;

  if (is_verified_by_council !== undefined) lawyer.is_verified_by_council = is_verified_by_council;
  if (has_law_license !== undefined) lawyer.has_law_license = has_law_license;

  await lawyer.save();

  res.status(200).json({ success: true, data: lawyer });
  return;


}
