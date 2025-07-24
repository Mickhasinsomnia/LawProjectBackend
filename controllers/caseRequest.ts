import CaseRequest from "../models/CaseRequest.js";
import Lawyer from "../models/Lawyer.js"
import Notification from "../models/Notification.js";
import { Request, Response, NextFunction } from "express";
import { generateFileName, uploadFile, getObjectSignedUrl, deleteFile } from "./s3.js";


//@desc  Create a new case request
//@route POST /api/v1/caseRequest
//@access Private
export const addCaseRequest = async (req:Request, res:Response ,next: NextFunction) => {
  try {



    if (req.file) {
      const fileName = generateFileName();
      console.log(fileName);
      await uploadFile(req.file, fileName, req.file.mimetype);
      req.body.summons = fileName;
    }


    const newCaseRequest = await CaseRequest.create({
      ...req.body,
      client_id: req.user?.id,
    });

    if (Array.isArray(req.body.offered_Lawyers)) {
      const notifications = req.body.offered_Lawyers.map((lawyerId: string) => ({
        user: lawyerId,
        type: "case_request",
        message: "คุณได้รับคำร้องขอว่าจ้างใหม่จากลูกค้า",
        link: `/case/${newCaseRequest._id}`, // adjust this route as needed
      }))
      await Notification.insertMany(notifications)
    }

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

    if (
      req.user?.role !== "admin" &&
      req.user?.id !== caseRequest.client_id?.toString()
    ) {
      res.status(403).json({
        success: false,
        message: `User is not authorized to update this case request`,
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
        message: `User is not authorized to update this case request`,
      });
      return;
    }

    if (req.body.title) caseRequest.title = req.body.title
    if (req.body.description) caseRequest.description = req.body.description;
    if (req.body.note) caseRequest.note = req.body.note;
    if (req.body.lawyer_id) caseRequest.lawyer_id = req.body.lawyer_id
    if (req.body.consultation_date) caseRequest.consultation_date = req.body.consultation_date;
    if (req.body.offered_Lawyers) {
          const offered_Lawyers = req.body.offered_Lawyers;
          if (!caseRequest.offered_Lawyers.includes(offered_Lawyers)) {
            caseRequest.offered_Lawyers.push(offered_Lawyers);
          }
        }

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


//@desc     Delete a case request
//@route    DELETE /api/v1/caseRequest/delete/:id
//@access   Private
export const deleteCaseRequest = async (req:Request, res:Response ,next: NextFunction) => {
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
        message: `User is not authorized to delete this case request`,
      });
      return;
    }

    if (caseRequest.files) {
      for (const file of caseRequest.files) {
        if (file) { // skips "", null, undefined, etc.
          await deleteFile(file);
        }
      }
    }

    if (caseRequest.summons && caseRequest.summons !== "") {
      await deleteFile(caseRequest.summons);
    }


    await CaseRequest.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: `Case request delete successfully`,
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

//@desc  Get a case request from id
//@route GET /api/v1/caseRequest/:id
//@access Private
export const getCaseRequestById = async (req:Request, res:Response ,next: NextFunction) => {
  try {
    const caseRequestId = req.params.id;

    const caseRequest = await CaseRequest.findById(caseRequestId)
      .populate({ path: 'client_id', model: 'User', select: 'name email' })
      .populate({ path: 'lawyer_id', model: 'User', select: 'name photo' })
      .populate({ path: 'offered_Lawyers', model: 'User', select: 'name photo' });
    if (!caseRequest) {
      res.status(404).json({
        success: false,
        message: "Case request not found",
      });
      return;
    }

     const allowedIds = caseRequest.offered_Lawyers.map(id => id.toString());

    if (req.user?.id) {
      if (req.user?.role !== "admin"
        && req.user?.id !== caseRequest.client_id?._id.toString()
        && req.user?.id != caseRequest.lawyer_id?._id.toString()
        && allowedIds.includes(req.user?.id)) {
        res.status(403).json({
          success: false,
          message: "You are not authorized to view this case request",
        });
        return;
      }
    }

    const user = caseRequest.lawyer_id as { photo?: string; };
    if (user && user.photo && !user.photo.startsWith("http")) {
      user.photo = await getObjectSignedUrl(user.photo);
    }

    if(caseRequest.summons && !caseRequest.summons.startsWith("http")){
      caseRequest.summons = await getObjectSignedUrl(caseRequest.summons);
    }



    if (caseRequest.offered_Lawyers && Array.isArray(caseRequest.offered_Lawyers)) {
      await Promise.all(
        caseRequest.offered_Lawyers.map(async (lawyer: any) => {
          if (lawyer.photo && !lawyer.photo.startsWith("http")) {
            lawyer.photo = await getObjectSignedUrl(lawyer.photo);
          }
        })
      );
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

//@desc  Delete file from case request
//@route Delete /api/v1/caseRequest/:id/file
//@access Private
export const deleteFileFromCase = async (req: Request, res: Response, next: NextFunction) => {
  const caseRequestId = req.params.id;
  const caseRequest = await CaseRequest.findById(caseRequestId);

  if (!caseRequest) {
    res.status(404).json({
      success: false,
      message: "Case request not found",
    });
    return;
  }

  if (req.user?.role !== "admin" && req.user?.id !== caseRequest.client_id?._id.toString()) {
    res.status(403).json({
      success: false,
      message: "You are not authorized to delete this file",
    });
    return;
  }

  const idx = parseInt(req.query.idx as string, 10);

  if (isNaN(idx) || idx < 0 || idx >= caseRequest.files.length) {
    res.status(400).json({ error: 'Invalid file selected.' });
    return;
  }

  await deleteFile(caseRequest.files[idx]);

  caseRequest.files.splice(idx, 1);

  await caseRequest.save();

  res.status(200).json({
    success: true,
    message: "Delete file success",
  });
};



//@desc  Add file to case request
//@route PUT /api/v1/caseRequest/:id/file
//@access Private
export const addFileToCase = async (req:Request, res:Response ,next: NextFunction) =>{
  const caseRequestId = req.params.id;
  const caseRequest = await CaseRequest.findById(caseRequestId);
  if (!caseRequest) {
    res.status(404).json({
      success: false,
      message: "Case request not found",
    });
    return;
  }

  if (req.user?.role !== "admin" && req.user?.id !== caseRequest.client_id?._id.toString()) {
    res.status(403).json({
      success: false,
      message: "You are not authorized to add file to this case",
    });
    return;
  }

  if (req.file) {
    const fileName = generateFileName();
    await uploadFile(req.file, fileName, req.file.mimetype);
     caseRequest.files.push(fileName);
     await caseRequest.save();
  }

  res.status(200).json({
    success: true,
    message: "Upload file success",
  });

}


//@desc  Get all case requests for a specific client
//@route GET /api/v1/caseRequest/client
//@access Private
export const getCaseRequestsByClientId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clientId = req.user?.id;

    const caseRequests = await CaseRequest.find({ client_id: clientId })
      .sort({ createdAt: -1 })
      .populate({
        path: 'lawyer_id',
        model: 'User',
        select: 'name photo',
      });

    if (caseRequests.length === 0) {
      res.status(404).json({
        success: false,
        message: "No case requests found for this client",
      });
      return;
    }

    // Process each caseRequest's lawyer photo
    for (const caseRequest of caseRequests) {
      const lawyer = caseRequest.lawyer_id as { photo?: string };
      if (lawyer && lawyer.photo && !lawyer.photo.startsWith("http")) {
        lawyer.photo = await getObjectSignedUrl(lawyer.photo);
      }
    }

    res.status(200).json({
      success: true,
      data: caseRequests,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve case requests",
      error: err.message,
    });
  }
};

//@desc  Get all case requests for a specific lawyer
//@route GET /api/v1/caseRequest/lawyer
//@access Private
export const getCaseRequestsByLawyerId = async (req:Request, res:Response ,next: NextFunction) => {
  try {
    const lawyerId = req.user?.id;

    const caseRequests = await CaseRequest.find({
          $or: [
            { lawyer_id: lawyerId },
            { offered_Lawyers: lawyerId }
          ]
        }).sort({ createdAt: -1}).populate({
          path: 'client_id',
          model: 'User',
          select: 'name photo',
        });

    if (caseRequests.length === 0) {
      res.status(404).json({
        success: false,
        message: "No case requests found for this lawyer",
      });
      return;
    }

    for (const caseRequest of caseRequests) {
      const lawyer = caseRequest.client_id as { photo?: string };
      if (lawyer && lawyer.photo && !lawyer.photo.startsWith("http")) {
        lawyer.photo = await getObjectSignedUrl(lawyer.photo);
      }
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


//@desc  Get all active case for a specific lawyer
//@route GET /api/v1/caseRequest/lawyer/active
//@access Private
export const getActiveCase = async (req:Request, res:Response ,next: NextFunction) => {
  try {
    const lawyerId = req.user?.id;

    const caseRequests = await CaseRequest.find({lawyer_id:lawyerId,consultation_status:'active'
        }).sort({ createdAt: -1}).populate({
          path: 'lawyer_id',
          model: 'User',
          select: 'name photo',
        });

    if (caseRequests.length === 0) {
      res.status(404).json({
        success: false,
        message: "No case requests found for this lawyer",
      });
      return;
    }

    for (const caseRequest of caseRequests) {
      const lawyer = caseRequest.lawyer_id as { photo?: string };
      if (lawyer && lawyer.photo && !lawyer.photo.startsWith("http")) {
        lawyer.photo = await getObjectSignedUrl(lawyer.photo);
      }
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
    acceptedCase.consultation_status = 'active';

    await acceptedCase.save();

    res.status(201).json({
      success: true,
      data: acceptedCase,
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
