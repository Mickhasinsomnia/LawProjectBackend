const Hiring = require('../models/Hiring');
const CaseRequest = require('../models/CaseRequest');
const Lawyer = require('../models/Lawyer')

//@desc  Get hiring by ID
//@route GET /api/v1/hiring/:id
//@access Private
exports.getHiring = async (req, res, next) => {
  try {
    const hiring = await Hiring.findById(req.params.id).populate('case_id');

    if (!hiring) {
      return res.status(404).json({
        success: false,
        message: "Hiring not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: hiring,
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({
      success: false,
      message: "Failed to get hiring",
      error: err.message,
    });
  }
};

//@desc  Get all hiring for specific client
//@route GET /api/v1/hiring/client/:clientId
//@access Private
exports.getHiringByClientId = async (req, res, next) => {
  try {
    const hiring = await Hiring.find({ client_id: req.user.id });

    if (hiring.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No hiring found for this client",
      });
    }

    return res.status(200).json({
      success: true,
      data: hiring,
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({
      success: false,
      message: "Failed to get hiring",
      error: err.message,
    });
  }
};

//@desc  Get all hiring for specific client
//@route GET /api/v1/hiring/lawyer/:lawyerId
//@access Private
exports.getHiringByLawyerId = async (req, res, next) => {
  try {
    const hiring = await Hiring.find({ lawyer_id: req.user.id });

    if (hiring.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No hiring found for this lawyer",
      });
    }

    return res.status(200).json({
      success: true,
      data: hiring,
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({
      success: false,
      message: "Failed to get hiring",
      error: err.message,
    });
  }
};

//@desc  Create new job Hiring
//@route POST /api/v1/hiring
//@access Private
exports.addHiring = async (req, res, next) => {
  try {
    const lawyer = await Lawyer.findOne({ user_id: req.user.id });
    if (!lawyer) {
      return res.status(403).json({
        success: false,
        message: 'User must complete lawyer profile before creating a hiring',
      });
    }

    const acceptedCase = await CaseRequest.findById(req.params.id);
    if (!acceptedCase) {
      return res.status(404).json({
        success: false,
        message: "Case request not found",
      });
    }

    if(acceptedCase.lawyer_id.toString()!=req.user.id){
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this case request",
      });
    }

    if (acceptedCase.status !== "open") {
      return res.status(400).json({
        success: false,
        message: "Case is not available for hiring. Status must be 'open'.",
      });
    }


    const hiringData = {
      ...req.body,
      lawyer_id: acceptedCase.lawyer_id,
      client_id:acceptedCase.client_id,
      case_id: req.params.id,
    };

    const newHire = await Hiring.create(hiringData);

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


//@desc     Update job hiring
//@route    DELETE /api/v1/hiring/:id
//@access   Private
exports.updateHiring = async (req, res, next) => {
  try {
    const lawyer = await Lawyer.findOne({ user: req.user.id });
    if (!lawyer && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'User must complete lawyer profile before updating a hiring',
      });
    }

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



//@desc     Cancel job hiring
//@route    DELETE /api/v1/hiring/:id
//@access   Private
exports.cancelHiring = async (req, res, next) => {
  try {
    const lawyer = await Lawyer.findOne({ user_id: req.user.id });
    if (!lawyer && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'User must complete lawyer profile before cancelling a hiring',
      });
    }

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

    hiring.status = 'cancelled';
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
