const CaseRequest = require("../models/CaseRequest");
const Slot = require('../models/Slot');
//new damn big fix

//@desc  Create a new case request
//@route POST /api/v1/caseRequest
//@access Private
exports.addCaseRequest = async (req, res, next) => {
  try {

    // const { consultation_date, consultation_start_time, consultation_end_time, lawyer_id } = req.body;

    // const date = new Date(consultation_date);
    // date.setHours(0, 0, 0, 0);

    // const conflictingSlot = await Slot.findOne({
    //   lawyer_id: lawyer_id,
    //   date,
    //   $or: [
    //     {
    //       startTime: { $lt: consultation_end_time },
    //       endTime: { $gt: consultation_start_time }
    //     }
    //   ]
    // });

    // if (conflictingSlot) {
    //   return res.status(400).json({ success: false, message: "Requested time overlaps with an unavailable slot" });
    // }

    const newCaseRequest = await CaseRequest.create({
      ...req.body,
      client_id: req.user.id,
    });



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

//@desc     Cancel a case request
//@route    DELETE /api/v1/caseRequest/:id
//@access   Private
exports.cancelCaseRequest = async (req, res, next) => {
  try {
    const caseRequest = await CaseRequest.findById(req.params.id);

    if (!caseRequest) {
      return res.status(404).json({
        success: false,
        message: "Case request not found",
      });
    }

    caseRequest.consultation_status = req.user.role === "lawyer" ? "rejected" : "cancelled";
    await caseRequest.save();

    return res.status(200).json({
      success: true,
      message: `Case request ${caseRequest.consultation_status} successfully`,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Failed to update case request status",
      error: err.message,
    });
  }
};


//@desc     Update a case request
//@route    PUT /api/v1/caseRequest/:id
//@access   Private
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

//@desc  Get a case request from id
//@route GET /api/v1/caseRequest/:id
//@access Private
exports.getCaseRequestById = async (req, res, next) => {
  try {
    const caseRequestId = req.params.id;

    const caseRequest = await CaseRequest.findById(caseRequestId)
      .populate({ path: "client_id", select: "name email" })
      .populate({ path: "lawyer_id", select: "name email" })
    if (!caseRequest) {
      return res.status(404).json({
        success: false,
        message: "Case request not found",
      });
    }

    if (
      req.user.role !== "admin" &&
      req.user.id !== caseRequest.client_id._id.toString() &&
      req.user.id != caseRequest.lawyer_id._id.toString()
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

//@desc  Get all case requests for a specific client
//@route GET /api/v1/caseRequest/client/clientId
//@access Private
exports.getCaseRequestsByClientId = async (req, res, next) => {
  try {
    const clientId = req.params.id;

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

//@desc  Get all case requests for a specific lawyer
//@route GET /api/v1/caseRequest/lawyer/lawyerId
//@access Private
exports.getCaseRequestsByLawyerId = async (req, res, next) => {
  try {
    const lawyerId = req.params.id;

    const caseRequests = await CaseRequest.find({ lawyer_id: lawyerId });

    if (caseRequests.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No case requests found for this lawyer",
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
