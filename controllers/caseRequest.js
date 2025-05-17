const CaseRequest = require("../models/CaseRequest");

exports.addCaseRequest = async (req, res, next) => {
  try {
    const newCaseRequest = await CaseRequest.create(req.body);
    newCaseRequest.client_id = req.user.id;
    await newCaseRequest.save();

    return res.status(201).json({
      success: true,
      data: newCaseRequest,
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({
      success: false,
      message: "Failed to create case request",
      error: err.message,
    });
  }
};

exports.cancelCaseRequest = async (req, res, next) => {
  try {
    const caseRequest = await CaseRequest.findById(req.params.id);

    if (!caseRequest) {
      return res.status(404).json({
        success: false,
        message: "Case request not found",
      });
    }

    if (
      req.user.role !== "admin" &&
      req.user.id !== caseRequest.client_id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: `User ${req.user.id} is not authorized to cancel this case request`,
      });
    }

    caseRequest.status = "cancelled";
    await caseRequest.save();

    return res.status(200).json({
      success: true,
      message: "Case request cancelled successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Failed to cancel case request",
      error: err.message,
    });
  }
};

exports.updateCaseRequest = async (req, res, next) => {
  try {
    const caseRequest = await CaseRequest.findById(req.params.id);

    if (!caseRequest) {
      return res.status(404).json({
        success: false,
        message: "Case request not found",
      });
    }

    if (
      req.user.role !== "admin" &&
      req.user.id !== caseRequest.client_id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this case request`,
      });
    }

    if (req.body.description) caseRequest.description = req.body.description;
    if (req.body.note) caseRequest.note = req.body.note;

    await caseRequest.save();

    return res.status(200).json({
      success: true,
      message: "Case request updated successfully",
      data: caseRequest,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Failed to update case request",
      error: err.message,
    });
  }
};

exports.getCaseRequestById = async (req, res, next) => {
  try {
    const caseRequestId = req.params.id;

    const caseRequest = await CaseRequest.findById(caseRequestId);

    if (!caseRequest) {
      return res.status(404).json({
        success: false,
        message: "Case request not found",
      });
    }

    if (
      req.user.role !== "admin" &&
      req.user.id !== caseRequest.client_id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this case request",
      });
    }

    return res.status(200).json({
      success: true,
      data: caseRequest,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve case request",
      error: err.message,
    });
  }
};

exports.getCaseRequestsByClientId = async (req, res, next) => {
  try {
    const clientId = req.params.clientId;

    if (req.user.role !== "admin" && req.user.id !== clientId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view case requests for this client",
      });
    }

    const caseRequests = await CaseRequest.find({ client_id: clientId });

    if (caseRequests.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No case requests found for this client",
      });
    }

    return res.status(200).json({
      success: true,
      data: caseRequests,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve case requests",
      error: err.message,
    });
  }
};
