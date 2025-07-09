import Appointment, { IAppointment } from "../models/Appointment.js";
import Hiring from "../models/Hiring.js";
import { Request, Response, NextFunction } from 'express';

export const createAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hiring = await Hiring.findById(req.params.id);

    if (!hiring) {
      return res.status(404).json({ success: false, message: "Hiring not found" });
    }

    if (hiring.status !== "active") {
      return res.status(400).json({ success: false, message: "Hiring is not active or has been canceled" });
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
      hiringId: hiring._id,
      permission,
      client_id: hiring.client_id,
      lawyer_id: hiring.lawyer_id,
    };

    const newAppointment = await Appointment.create(appointmentData);

    return res.status(201).json({
      success: true,
      data: newAppointment,
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Failed to create appointment",
      error: err.message,
    });
  }
};

export const updateAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      res.status(404).json({ success: false, message: "Appointment not found" });
      return;
    }

    const hiring = await Hiring.findById(appointment.hiringId);
    if (!hiring) {
      res.status(404).json({ success: false, message: "Associated hiring not found" });
      return;
    }

    if (appointment.status === "cancelled") {
      res.status(400).json({ success: false, message: "Cannot update a cancelled appointment" });
      return;
    }

    const { role, id: userId } = req.user!;
    const permission = appointment.permission;

    const isLawyer = userId === hiring.lawyer_id?.toString();
    const isClient = userId === hiring.client_id?.toString();
    const isAdmin = role === 'admin';

    if ((permission === "shared" || permission === "lawyer") && !isAdmin && !isLawyer) {
      res.status(403).json({ success: false, message: "You are not authorized to update this appointment" });
      return;
    }

    if (permission === "client" && !isAdmin && !isClient) {
      res.status(403).json({ success: false, message: "You are not authorized to update this appointment" });
      return;
    }

    const { task, note, location, timeStamp } = req.body;

    if (task !== undefined) appointment.task = task;
    if (note !== undefined) appointment.note = note;
    if (location !== undefined) appointment.location = location;
    if (timeStamp !== undefined) appointment.timeStamp = timeStamp;

    await appointment.save();

    res.status(200).json({ success: true, data: appointment });
    return;
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to update appointment",
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

    if (appointment.status === "cancelled") {
      res.status(400).json({ success: false, message: "This appointment is already cancelled" });
      return;
    }

    const hiring = await Hiring.findById(appointment.hiringId);
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

    appointment.status = "cancelled";
    await appointment.save();

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
      });
    }

    if (user?.role === 'lawyer') {
      appointments = await Appointment.find({
        lawyer_id: user.id,
        permission: { $in: ['shared', 'lawyer'] }
      });
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
