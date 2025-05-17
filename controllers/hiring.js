const Hiring = require('../models/Hiring');
const CaseRequest = require('../models/CaseRequest');

exports.addHiring = async (req, res, next) => {
  try {
    const acceptedCase = await CaseRequest.findById(req.params.id);

    if (!acceptedCase) {
      return res.status(404).json({
        success: false,
        message: "Case request not found",
      });
    }

    req.body.lawyer_id = req.user.id;
    req.body.case_id = req.params.id;

    const newHire = await Hiring.create(req.body);

    acceptedCase.status = "assigned";
    await acceptedCase.save();

    return res.status(201).json({
      success: true,
      data: newHire,
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({
      success: false,
      message: "Failed to create hiring",
      error: err.message,
    });
  }
};

exports.updateHiring = async (req, res, next) => {
  try {
    const hiring = await Hiring.findById(req.params.id);

    if (!hiring) {
      return res.status(404).json({
        success: false,
        message: "Hiring not found",
      });
    }

    if (req.user.role !== 'admin' && req.user.id !== hiring.lawyer_id.toString()) {
      return res.status(403).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this hiring`,
      });
    }

    if (req.body.task) hiring.task = req.body.task;
    if (req.body.note) hiring.note = req.body.note;
    if (req.body.start_date) hiring.start_date = req.body.start_date;
    if (req.body.end_date) hiring.end_date = req.body.end_date;

    await hiring.save();

    return res.status(200).json({
      success: true,
      data: hiring,
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

exports.cancelHiring = async (req, res, next) => {
  try {
    const hiring = await Hiring.findById(req.params.id);

    if (!hiring) {
      return res.status(404).json({
        success: false,
        message: "Hiring not found",
      });
    }

    if (req.user.role !== 'admin' && req.user.id !== hiring.lawyer_id.toString()) {
      return res.status(403).json({
        success: false,
        message: `User ${req.user.id} is not authorized to cancel this hiring`,
      });
    }

    hiring.status.status = 'cancelled';
    await hiring.save();

    const caseRequest = await CaseRequest.findById(hiring.case_id);
    if (caseRequest) {
      caseRequest.status = 'open';
      await caseRequest.save();
    }

    return res.status(200).json({
      success: true,
      message: "Hiring cancelled successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Failed to cancel hiring",
      error: err.message,
    });
  }
};
