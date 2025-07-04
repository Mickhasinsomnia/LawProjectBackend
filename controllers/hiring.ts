import Hiring from '../models/Hiring.js';
import CaseRequest from '../models/CaseRequest.js';
import Lawyer from '../models/Lawyer.js';
import { Request, Response, NextFunction } from 'express';

//@desc  Get hiring by ID
//@route GET /api/v1/hiring/:id
//@access Private
export const getHiring = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hiring = await Hiring.findById(req.params.id);

      if (!hiring) {
        res.status(404).json({
          success: false,
          message: "Hiring not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: hiring,
      });
      return;
    } catch (err: any) {
      console.error(err);
      res.status(400).json({
        success: false,
        message: "Failed to get hiring",
        error: err.message,
      });
      return;
    }
  };

//@desc  Get all hiring for specific client
//@route GET /api/v1/hiring/client
//@access Private
export const getHiringByClientId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hiring = await Hiring.find({ client_id: req.user?.id });

      if (hiring.length === 0) {
        res.status(404).json({
          success: false,
          message: "No hiring found for this client",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: hiring,
      });
      return;
    } catch (err: any) {
      console.error(err);
      res.status(400).json({
        success: false,
        message: "Failed to get hiring by client",
        error: err.message,
      });
      return;
    }
  };

//@desc  Get all hiring for specific client
//@route GET /api/v1/hiring/lawyer/:lawyerId
//@access Private
export const getHiringByLawyerId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hiring = await Hiring.find({ lawyer_id: req.user?.id });

    if (hiring.length === 0) {
      res.status(404).json({
        success: false,
        message: "No hiring found for this lawyer",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: hiring,
    });
    return;
  } catch (err: any) {
    console.error(err);
    res.status(400).json({
      success: false,
      message: "Failed to get hiring",
      error: err.message,
    });
    return;
  }
};

//@desc  Create new job Hiring
//@route POST /api/v1/hiring
//@access Private
export const addHiring = async (req: Request, res: Response, next:NextFunction) => {
  try {
    const lawyer = await Lawyer.exists({ _id: req.user?.id });
    if (!lawyer) {
      res.status(403).json({
        success: false,
        message: 'User must complete lawyer profile before creating a hiring',
      });
      return;
    }

    const acceptedCase = await CaseRequest.findById(req.params.id);
    if (!acceptedCase) {
      res.status(404).json({
        success: false,
        message: "Case request not found",
      });
      return;
    }

    const lawyer_id = req.user?.id;


    if (acceptedCase.offered_Lawyers) {
      const allowedIds = acceptedCase.offered_Lawyers.map(id => id.toString());

      if (lawyer_id && !allowedIds.includes(lawyer_id)) {
        res.status(403).json({
          success: false,
          message: "You are not authorized to access this case request",
        });
        return;
      }
    }

    if (acceptedCase.consultation_status !== "pending") {
      res.status(400).json({
        success: false,
        message: "Case is not available for hiring. Status must be 'pending'.",
      });
      return;
    }

    (acceptedCase as { lawyer_id: typeof lawyer_id }).lawyer_id = lawyer_id;

    const hiringData = {
      ...req.body,
      lawyer_id: lawyer_id,
      client_id:acceptedCase.client_id,
      case_id: req.params.id,
    };

    const newHire = await Hiring.create(hiringData);

    acceptedCase.consultation_status = "confirmed";
    await acceptedCase.save();

    res.status(201).json({
      success: true,
      data: newHire,
    });
    return;
  } catch (err: any) {
    console.error(err);
    res.status(400).json({
      success: false,
      message: "Failed to create hiring",
      error: err.message,
    });
    return;
  }
};


//@desc     Update job hiring
//@route    DELETE /api/v1/hiring/:id
//@access   Private
export const updateHiring = async (req: Request, res: Response, next:NextFunction) => {
  try {
    const lawyer = await Lawyer.findOne({ _id: req.user?.id });
    if (!lawyer && req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'User must complete lawyer profile before updating a hiring',
      });
      return;
    }

    const hiring = await Hiring.findById(req.params.id);
    if (!hiring) {
      res.status(404).json({
        success: false,
        message: "Hiring not found",
      });
      return;
    }

    if (req.user?.role !== 'admin' && req.user?.id !== hiring.lawyer_id?.toString()) {
      res.status(403).json({
        success: false,
        message: `User ${req.user?.id} is not authorized to update this hiring`,
      });
      return;
    }


    if (req.body.detail) hiring.detail = req.body.detail;


    await hiring.save();

    res.status(200).json({
      success: true,
      data: hiring,
    });
    return;
  } catch (err: any) {
    console.error(err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
    return;
  }
};



//@desc     Cancel job hiring
//@route    DELETE /api/v1/hiring/:id
//@access   Private
export const cancelHiring = async (req: Request, res: Response, next:NextFunction) => {
  try {
    const lawyer = await Lawyer.findOne({ _id: req.user?.id });
    if (!lawyer && req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'User must complete lawyer profile before cancelling a hiring',
      });
      return;
    }

    const hiring = await Hiring.findById(req.params.id);
    if (!hiring) {
      res.status(404).json({
        success: false,
        message: "Hiring not found",
      });
      return;
    }

    if (req.user?.role !== 'admin' && req.user?.id !== hiring.lawyer_id?.toString()) {
      res.status(403).json({
        success: false,
        message: `User ${req.user?.id} is not authorized to cancel this hiring`,
      });
      return;
    }

    hiring.status = 'cancelled';
    await hiring.save();


    res.status(200).json({
      success: true,
      message: "Hiring cancelled successfully",
    });
    return;
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to cancel hiring",
      error: err.message,
    });
    return;
  }
}
