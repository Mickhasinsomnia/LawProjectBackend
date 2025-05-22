const Lawyer = require("../models/Lawyer");

// @desc    Create a new lawyer profile
// @route   POST /api/v1/lawyers
// @access  Private
exports.addLawyer = async (req, res) => {
  try {

    const data = await Lawyer.findOne({ user_id: req.user.id });
    if(data){
      return res.status(400).json({ message: "Lawyer data already existed" });
    }

    const lawyerData = {
      ...req.body,
      user_id: req.user.id,
      name:req.user.name
    };

    const newLawyer = await Lawyer.create(lawyerData);

    return res.status(201).json({
      success: true,
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
    const lawyer = await Lawyer.findById(req.params.id).populate("user_id", "name email");

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

    if (req.user.role !== "admin" && req.user.id !== lawyer.user_id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this profile",
      });
    }

    Object.assign(lawyer, req.body);
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

    if (req.user.role !== "admin" && req.user.id !== lawyer.user_id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this profile",
      });
    }

    await lawyer.remove();

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
    const lawyers = await Lawyer.find().populate("user_id", "name email");

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
