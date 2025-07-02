import CaseRequest from "../models/CaseRequest.js";
import { Request, Response, NextFunction } from "express";
import { generateFileName, uploadFile, getObjectSignedUrl, deleteFile } from "./s3.js";


//@desc  Create a new case request
//@route POST /api/v1/caseRequest
//@access Private
export const addCaseRequest = async (req:Request, res:Response ,next: NextFunction) => {
  try {

    const uploadedFileNames: string[] = [];

    if (req.files && Array.isArray(req.files)) {
          for (const file of req.files as Express.Multer.File[]) {
            const fileName = generateFileName();
            await uploadFile(file, fileName, file.mimetype);
            uploadedFileNames.push(fileName);
          }
        }

    const newCaseRequest = await CaseRequest.create({
      ...req.body,
      client_id: req.user?.id,
      files: uploadedFileNames,
    });


    res.status(201).json({
      success: true,
      data: newCaseRequest,
    });
    return;
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: "Failed to create case request",
      error: err.message,
    });
    return;
  }
};

//@desc     Cancel a case request
//@route    DELETE /api/v1/caseRequest/:id
//@access   Private
export const cancelCaseRequest = async (req:Request, res:Response ,next: NextFunction) => {
  try {
    const caseRequest = await CaseRequest.findById(req.params.id);

    if (!caseRequest) {
      res.status(404).json({
        success: false,
        message: "Case request not found",
      });
      return;
    }

    caseRequest.consultation_status = req.user?.role === "lawyer" ? "rejected" : "cancelled";
    await caseRequest.save();

    res.status(200).json({
      success: true,
      message: `Case request ${caseRequest.consultation_status} successfully`,
    });
    return;
  } catch (err:any) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to update case request status",
      error: err.message,
    });
    return;
  }
};


//@desc     Update a case request
//@route    PUT /api/v1/caseRequest/:id
//@access   Private
export const updateCaseRequest = async (req:Request, res:Response ,next: NextFunction) => {
  try {
    const caseRequest = await CaseRequest.findById(req.params.id);

    if (!caseRequest) {
      res.status(404).json({
        success: false,
        message: "Case request not found",
      });
      return;
    }

    if (
      req.user?.role !== "admin" &&
      req.user?.id !== caseRequest.client_id?.toString()
    ) {
      res.status(403).json({
        success: false,
        message: `User ${req.user?.id} is not authorized to update this case request`,
      });
      return;
    }

    if (req.body.description) caseRequest.description = req.body.description;
    if (req.body.note) caseRequest.note = req.body.note;
    if (req.body.lawyer_id) caseRequest.lawyer_id = req.body.lawyer_id

    await caseRequest.save();

    res.status(200).json({
      success: true,
      message: "Case request updated successfully",
    });
    return;
  } catch (err:any) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to update case request",
      error: err.message,
    });
    return;
  }
};

//@desc  Get a case request from id
//@route GET /api/v1/caseRequest/:id
//@access Private
export const getCaseRequestById = async (req:Request, res:Response ,next: NextFunction) => {
  try {
    const caseRequestId = req.params.id;

    const caseRequest = await CaseRequest.findById(caseRequestId)
      .populate({ path: "client_id", select: "name email" })
      .populate({ path: "lawyer_id", select: "name email" })
    if (!caseRequest) {
      res.status(404).json({
        success: false,
        message: "Case request not found",
      });
      return;
    }

    if (
      req.user?.role !== "admin" &&
      req.user?.id !== caseRequest.client_id?._id.toString() &&
      req.user?.id != caseRequest.lawyer_id?._id.toString()
    ) {
      res.status(403).json({
        success: false,
        message: "You are not authorized to view this case request",
      });
      return;
    }

    if (caseRequest.files && Array.isArray(caseRequest.files)) {
         const signedUrls = await Promise.all(
           caseRequest.files.map(async (fileName) => {
             if (!fileName.startsWith("http")) {
               return await getObjectSignedUrl(fileName);
             }
             return fileName;
           })
         );
         caseRequest.files = signedUrls;
       }

    res.status(200).json({
      success: true,
      data: caseRequest,
    });
    return;
  } catch (err:any) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve case request",
      error: err.message,
    });
    return;
  }
};

//@desc  Get all case requests for a specific client
//@route GET /api/v1/caseRequest/client/clientId
//@access Private
export const getCaseRequestsByClientId = async (req:Request, res:Response ,next: NextFunction) => {
  try {
    const clientId = req.params.id;

    const caseRequests = await CaseRequest.find({ client_id: clientId });

    if (caseRequests.length === 0) {
      res.status(404).json({
        success: false,
        message: "No case requests found for this client",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: caseRequests,
    });
    return;
  } catch (err:any) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve case requests",
      error: err.message,
    });
    return;
  }
};

//@desc  Get all case requests for a specific lawyer
//@route GET /api/v1/caseRequest/lawyer/lawyerId
//@access Private
export const getCaseRequestsByLawyerId = async (req:Request, res:Response ,next: NextFunction) => {
  try {
    const lawyerId = req.params.id;

    const caseRequests = await CaseRequest.find({ lawyer_id: lawyerId });

    if (caseRequests.length === 0) {
      res.status(404).json({
        success: false,
        message: "No case requests found for this lawyer",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: caseRequests,
    });
    return;
  } catch (err:any) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve case requests",
      error: err.message,
    });
    return;
  }
};

//@desc  Get all case request
//@route GET /api/v1/caseRequest
//@access Private
export const getAllCaseRequest = async (req:Request, res:Response ,next: NextFunction) => {
  try {

    const caseRequest = await CaseRequest.find()
      .populate({ path: "client_id", select: "name" })
      .populate({ path: "lawyer_id", select: "name" })
    if (!caseRequest) {
      res.status(404).json({
        success: false,
        message: "Case request not found",
      });
      return;
    }
;

    res.status(200).json({
      success: true,
      data: caseRequest,
    });
    return;
  } catch (err:any) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve case request",
      error: err.message,
    });
    return;
  }
};
