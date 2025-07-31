import Appointment, { IAppointment } from "../models/Appointment.js";
import CaseRequest from "../models/CaseRequest.js";
import Notification from "../models/Notification.js";
import { Request, Response, NextFunction } from 'express';

export const createAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { task, note, location, timeStamp, permission, case_id } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    let client_id: any = null;
    let lawyer_id: any = null;

    if (case_id) {
      const hiring = await CaseRequest.findById(case_id);
      if (!hiring) {
        res.status(404).json({ success: false, message: "Case not found" });
        return;
      }

      if (hiring.consultation_status !== "active") {
        res.status(400).json({ success: false, message: "Case is not active or has been canceled" });
        return;
      }

      client_id = hiring.client_id;
      lawyer_id = hiring.lawyer_id;

      // Ensure user is part of the case
      if ((userRole === "user" && userId !== client_id.toString()) ||
          (userRole === "lawyer" && userId !== lawyer_id.toString())) {
        res.status(403).json({ success: false, message: "You are not authorized for this case" });
        return;
      }
    } else {
      // Personal event: assign current user only
      if (userRole === 'user') client_id = userId;
      else if (userRole === 'lawyer') lawyer_id = userId;
      else {
        res.status(403).json({ success: false, message: "Only users or lawyers can create appointments" });
        return;
      }
        
    }

    const appointment = await Appointment.create({
      task,
      note,
      location,
      timeStamp,
      case_id: case_id || null,
      client_id,
      lawyer_id,
      permission,
    });

    res.status(201).json({ success: true, data: appointment });
    return;
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to create appointment", error: err.message });
    return;
  }
};



export const deleteAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      res.status(404).json({
        success: false,
        message: "ไม่พบนัดหมายที่ต้องการลบ",
      });
      return;
    }

    const { role, id: userId } = req.user!;
    const permission = appointment.permission;

    // If appointment has no case_id => personal event, allow owner or admin to delete
    if (!appointment.case_id) {
      // For personal events, check if the user owns the appointment or is admin
      const isOwner = appointment.client_id?.toString() === userId || appointment.lawyer_id?.toString() === userId;
      const isAdmin = role === "admin";

      if (!isOwner && !isAdmin) {
        res.status(403).json({
          success: false,
          message: "คุณไม่มีสิทธิ์ลบนัดหมายนี้",
        });
        return;
      }

      await Appointment.deleteOne({ _id: appointment._id });

      res.status(200).json({
        success: true,
        message: "ยกเลิกนัดหมายส่วนตัวเรียบร้อยแล้ว",
      });
      return;
    }

    // Otherwise, appointment is linked to a case — do normal permission checks
    const hiring = await CaseRequest.findById(appointment.case_id);
    if (!hiring) {
      res.status(404).json({
        success: false,
        message: "ไม่พบคดีที่เกี่ยวข้องกับนัดหมายนี้",
      });
      return;
    }

    const isLawyer = hiring.lawyer_id?.toString() === userId;
    const isClient = hiring.client_id?.toString() === userId;
    const isAdmin = role === "admin";

    if (
      (permission === "shared" || permission === "lawyer") &&
      !isAdmin &&
      !isLawyer
    ) {
      res.status(403).json({
        success: false,
        message: "คุณไม่มีสิทธิ์ลบนัดหมายนี้",
      });
      return;
    }

    if (permission === "client" && !isAdmin && !isClient) {
      res.status(403).json({
        success: false,
        message: "คุณไม่มีสิทธิ์ลบนัดหมายนี้",
      });
      return;
    }

    await Appointment.deleteOne({ _id: appointment._id });

    res.status(200).json({
      success: true,
      message: "ยกเลิกนัดหมายเรียบร้อยแล้ว",
    });
    return;

  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "ไม่สามารถยกเลิกนัดหมายได้",
      error: err instanceof Error ? err.message : "Unknown error",
    });
    return;
  }
};



export const getAppointments = async (req:Request, res:Response ,next: NextFunction) => {
  try {
    const user = req.user;
    let appointments: IAppointment[] = [];

    if (user?.role === 'user') {
      appointments = await Appointment.find({
        client_id: user.id,
        permission: { $in: ['shared', 'client'] }
      }).sort({ timeStamp: 1});
    }

    if (user?.role === 'lawyer') {
      appointments = await Appointment.find({
        lawyer_id: user.id,
        permission: { $in: ['shared', 'lawyer'] }
      }).sort({ timeStamp: 1});
    }

    res.status(200).json({
      success: true,
      data: appointments,
    });
    return;
  } catch (error:any) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to get appointments",
      error: error.message,
    });
    return;
  }
};

export const getAppointmentsByCaseId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    const { caseId } = req.params;

    if (!caseId) {
      res.status(400).json({
        success: false,
        message: "Case ID is required",
      });
      return;
    }

    let appointments: IAppointment[] = [];

    if (user?.role === "user") {
      appointments = await Appointment.find({
        case_id: caseId,
        client_id: user.id,
        permission: { $in: ["shared", "client"] },
      })
        .populate("lawyer_id", "name email photo")
        .populate("client_id", "name email photo")
        .sort({ timeStamp: 1 });
    }

    if (user?.role === "lawyer") {
      appointments = await Appointment.find({
        case_id: caseId,
        lawyer_id: user.id,
        permission: { $in: ["shared", "lawyer"] },
      })
        .populate("lawyer_id", "name email photo")
        .populate("client_id", "name email photo")
        .sort({ timeStamp: 1 });
    }

    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to get appointments for case",
      error: error.message,
    });
  }
};