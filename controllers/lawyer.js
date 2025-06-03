const Lawyer = require("../models/Lawyer");
const {
  generateFileName,
  uploadFile,
  getObjectSignedUrl,
  deleteFile,
} = require("./s3.js");

// @desc    Create a new lawyer profile
// @route   POST /api/v1/lawyers
// @access  Private
exports.addLawyer = async (req, res) => {
  try {
    const existing = await Lawyer.findOne({ _id: req.user.id });
    if (existing) {
      return res.status(400).json({ message: "Lawyer data already exists" });
    }

    const { slogan, summary, lawfirm_name, consultationRate,documentDeliveryRate, civilCase_specialized,criminalCase_specialized, verificationDocs } = req.body;

    const lawyerData = { _id: req.user.id, slogan, summary, lawfirm_name, consultationRate,documentDeliveryRate, civilCase_specialized, criminalCase_specialized,verificationDocs };

    const newLawyer = await Lawyer.create(lawyerData);

    return res.status(201).json({
      success: true,
      message: "Lawyer profile created successfully",
      data: newLawyer,
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({
      success: false,
      message: "Failed to create lawyer profile",
      error: err.message,
    });
  }
};

// @desc    Get a lawyer profile by ID
// @route   GET /api/v1/lawyers/:id
// @access  Public
exports.getLawyerById = async (req, res) => {
  try {
    const lawyer = await Lawyer.findById(req.params.id).populate({
      path: '_id',
      select: 'name tel location'
    });

    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: "Lawyer not found",
      });
    }


    return res.status(200).json({
      success: true,
      data: lawyer,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve lawyer",
      error: err.message,
    });
  }
};

// @desc    Update a lawyer profile
// @route   PUT /api/v1/lawyers/:id
// @access  Private
exports.updateLawyer = async (req, res) => {
  try {
    const lawyer = await Lawyer.findById(req.params.id);

    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: "Lawyer not found",
      });
    }

    if (req.user.role !== "admin" && req.user.id !== lawyer._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this profile",
      });
    }


    const { slogan, summary, lawfirm_name, consultationRate,documentDeliveryRate, civilCase_specialized,criminalCase_specialized, verificationDocs } = req.body;


    if (slogan !== undefined) lawyer.slogan = slogan;
    if (summary !== undefined) lawyer.summary = summary;
    if (lawfirm_name !== undefined) lawyer.lawfirm_name=lawfirm_name
    if (consultationRate !== undefined) lawyer.consultationRate = consultationRate;
    if (civilCase_specialized !== undefined) lawyer.civilCase_specialized = civilCase_specialized;
     if (criminalCase_specialized !== undefined) lawyer.criminalCase_specialized = criminalCase_specialized;
    if (verificationDocs !== undefined) lawyer.verificationDocs = verificationDocs;
    if (documentDeliveryRate !== undefined) lawyer.documentDeliveryRate = documentDeliveryRate;

    await lawyer.save();

    return res.status(200).json({
      success: true,
      message: "Lawyer profile updated successfully",
      data: lawyer,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Failed to update lawyer profile",
      error: err.message,
    });
  }
};

// @desc    Delete a lawyer profile
// @route   DELETE /api/v1/lawyers/:id
// @access  Private/Admin or Owner
exports.deleteLawyer = async (req, res) => {
  try {
    const lawyer = await Lawyer.findById(req.params.id);

    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: "Lawyer not found",
      });
    }

    if (
      req.user.role !== "admin" &&
      req.user.id !== lawyer._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this profile",
      });
    }



    await lawyer.deleteOne();



    return res.status(200).json({
      success: true,
      message: "Lawyer profile deleted successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete lawyer profile",
      error: err.message,
    });
  }
};

// @desc    Get all lawyers
// @route   GET /api/v1/lawyers
// @access  Public
exports.getAllLawyers = async (req, res) => {
  try {
    const lawyers = await Lawyer.find().populate("_id", "name email");

    return res.status(200).json({
      success: true,
      count: lawyers.length,
      data: lawyers,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch lawyers",
      error: err.message,
    });
  }
};

// @desc    Admin change verify status
// @route   DELETE /api/v1/lawyers/status/:id
// @access  Private/Admin
exports.changeVerifyStatus = async (req,res,next)=>{
  const lawyer = await Lawyer.findById(req.params.id);

  if (!lawyer) {
    return res.status(404).json({
      success: false,
      message: "Lawyer not found",
    });
  }

  const { is_verified_by_council, has_law_license } = req.body;

  if (is_verified_by_council !== undefined) lawyer.is_verified_by_council = is_verified_by_council;
  if (has_law_license !== undefined) lawyer.has_law_license = has_law_license;

  await lawyer.save();

  return res.status(200).json({ success: true, data: lawyer });


}
