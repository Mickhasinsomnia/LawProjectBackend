const Hiring = require('../models/Hiring');
const CaseRequest = require('../models/CaseRequest')

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
      message: "Failed to create case request",
      error: err.message
    });
  }
};

exports.updateHiring = async (req, res, next) => {
  try {
    let caseRequest = await CaseRequest.findById(req.params.id);

    if (!caseRequest) {
      return res.status(404).json({
        success: false,
        message: "Case request not found",
      });
    }

    if(req.user.role!='admin' && req.user.id != caseRequest.client_id){
      return res.status(403).json({
        success:false,
        message:"User ${req.user.id} is not authorized to update this case request",
      })
    }

    // if (req.body.description) caseRequest.description = req.body.description;
    // if (req.body.note) caseRequest.note = req.body.note;

    // await caseRequest.save();

    return res.status(200).json({
      success: true,
      data: caseRequest,
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
    const caseRequest = await Hiring.findById(req.params.id);

    if (!caseRequest) {
      return res.status(404).json({
        success: false,
        message: "Hiring not found",
      });
    }

    if(req.user.role!='admin' && req.user.id != caseRequest.lawyer_id){
      return res.status(403).json({
        success:false,
        message:"User ${req.user.id} is not authorized to cancel this hiring",
      })
    }

    await Hiring.deleteOne({ _id: req.params.id });

    return res.status(200).json({
      success: true,
      message: "Hiring canceled successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Failed to cancel hiring",
      error: err.message
    });
  }
};
