import Appointment, { IAppointment } from "../models/Appointment.js";
import CaseRequest from "../models/CaseRequest.js";
import Notification from "../models/Notification.js";
import { Request, Response, NextFunction } from 'express';

export const createAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hiring = await CaseRequest.findById(req.params.id);

    if (!hiring) {
      res.status(404).json({ success: false, message: "Case not found" });
      return;
    }

    if (hiring.consultation_status !== "active") {
      res.status(400).json({ success: false, message: "Case is not active or has been canceled" });
      return;
    }

    const { permission } = req.body;

    const userId = req.user?.id;
    const userRole = req.user?.role;


    if (userRole === 'user') {
      if (permission !== 'client') {
        res.status(403).json({ success: false, message: "Users can only create client appointments." });
        return;
      }
      if (hiring.client_id && userId !== hiring.client_id.toString()) {
        res.status(403).json({ success: false, message: "You are not the assigned client for this hiring." });
        return;
      }
    }

    if (userRole === 'lawyer') {
      if (permission === 'client') {
        res.status(403).json({ success: false, message: "Lawyers cannot create client appointments." });
        return;
      }
      if (hiring.lawyer_id && userId !== hiring.lawyer_id.toString()) {
        res.status(403).json({ success: false, message: "You are not the assigned lawyer for this hiring." });
        return;
      }
    }

    const appointmentData = {
      task: req.body.task,
      note: req.body.note,
      location: req.body.location,
      timeStamp: req.body.timeStamp,
      case_id: hiring._id,
      permission,
      client_id: hiring.client_id,
      lawyer_id: hiring.lawyer_id,
    };

    if (hiring.client_id) {
    const notification = await Notification.create({
      user: hiring.client_id,
      type: 'appointment',
      message: `ทนายความได้กำหนดวันนัดหมายสำหรับคุณ: ${new Date(appointmentData.timeStamp).toLocaleString('th-TH')}`,
      link: `/schedule`,
    });

    console.log("Notification created:", notification);
  }

    const newAppointment = await Appointment.create(appointmentData);

    res.status(201).json({
      success: true,
      data: newAppointment,
    });
    return;
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to create appointment",
      error: err.message,
    });
    return;
  }
};


export const deleteAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      res.status(404).json({ success: false, message: "No appointment found with the given id" });
      return;
    }

    const hiring = await CaseRequest.findById(appointment.case_id);
    if (!hiring) {
      res.status(404).json({ success: false, message: "Associated hiring not found" });
      return;
    }

    const { role, id: userId } = req.user!;
    const permission = appointment.permission;

    const isLawyer = userId === hiring.lawyer_id?.toString();
    const isClient = userId === hiring.client_id?.toString();
    const isAdmin = role === 'admin';

    if ((permission === "shared" || permission === "lawyer") && !isAdmin && !isLawyer) {
      res.status(403).json({ success: false, message: "You are not authorized to cancel this appointment" });
      return;
    }

    if (permission === "client" && !isAdmin && !isClient) {
      res.status(403).json({ success: false, message: "You are not authorized to cancel this appointment" });
      return;
    }

    await Appointment.deleteOne({_id:appointment._id})

    res.status(200).json({ success: true, message: "Appointment cancelled successfully" });
    return;
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to cancel appointment",
      error: err.message,
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
