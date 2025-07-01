import Appointment, { IAppointment } from "../models/Appointment.js";
import Hiring from "../models/Hiring.js";
import { Request, Response, NextFunction } from 'express';

export const createAppointment = async (req:Request, res:Response ,next: NextFunction) => {
  try {
    const hiring = await Hiring.findById(req.params.id);

    if (!hiring) {
      res.status(404).json({
        success: false,
        message: "Hiring not found",
      });
      return;
    }

    if (hiring.status !== "active") {
      res.status(400).json({
        success: false,
        message: "Hiring is not active or has been canceled",
      });
      return;
    }

    const { permission } = req.body;


    if (req.user?.role === 'user' && permission !== 'client') {
      res.status(403).json({
        success: false,
        message: "Users can only create client appointments.",
      });
      return;
    }

    if (req.user?.role === 'lawyer' && permission === 'client') {
      res.status(403).json({
        success: false,
        message: "Lawyers cannot create client appointments.",
      });
      return;
    }
    const client = hiring.client_id;
    const lawyer = hiring.lawyer_id;

    const appointmentData = {
      ...req.body,
      hiringId: req.params.id,
      permission: req.body.permission,
      client_id:client,
      lawyer_id:lawyer

    };

    const newAppointment = await Appointment.create(appointmentData);

    res.status(201).json({
      success: true,
      data: newAppointment,
    });
    return;
  } catch (err:any) {
    console.error(err);
    res.status(400).json({
      success: false,
      message: "Failed to create appointment",
      error: err.message,
    });
    return;
  }
};

export const updateAppointment = async (req:Request, res:Response ,next: NextFunction) => {
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

    const permission = appointment.permission;

    if(permission==="shared" || permission==="lawyer"){
      if (req.user?.role ==="user"){
        res.status(403).json({
          success: false,
          message: "You are not authorized to update this appointment",
        });
        return;
      }
      if(req.user?.id!=hiring.lawyer_id && req.user?.role!="admin"){
        res.status(403).json({
          success: false,
          message: "You are not authorized to update this appointment",
        });
        return;
      }
    }

    if(permission==="client"){
      if (req.user?.role ==="lawyer"){
        res.status(403).json({
          success: false,
          message: "You are not authorized to update this appointment",
        });
        return;
      }
      if(req.user?.id!=hiring.client_id && req.user?.role!="admin"){
        res.status(403).json({
          success: false,
          message: "You are not authorized to update this appointment",
        });
        return;
      }
    }


    const { task, note, location, timeStamp } = req.body;
    if (task) appointment.task = task;
    if (note) appointment.note = note;
    if (location) appointment.location = location;
    if (timeStamp) appointment.timeStamp = timeStamp;

    await appointment.save();

    res.status(200).json({
      success: true,
      data: appointment,
    });
    return;
  } catch (err:any) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to update appointment",
      error: err.message,
    });
    return;
  }
};


export const deleteAppointment = async (req:Request, res:Response ,next: NextFunction) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      res.status(404).json({
        success: false,
        message: "No appointment found with the given id",
      });
      return;
    }

    if (appointment.status === "cancelled") {
      res.status(400).json({
        success: false,
        message: "This appointment is already cancelled",
      });
      return;
    }

    const hiring = await Hiring.findById(appointment.hiringId);
    if (!hiring) {
      res.status(404).json({
        success: false,
        message: "Associated hiring not found",
      });
      return;
    }
    const permission = appointment.permission

    if(permission==="shared" || permission==="lawyer"){
      if (req.user?.role ==="user"){
        res.status(403).json({
          success: false,
          message: "You are not authorized to cancel this appointment",
        });
        return;
      }
      if(req.user?.id!=hiring.lawyer_id && req.user?.role!="admin"){
        res.status(403).json({
          success: false,
          message: "You are not authorized to cancel this appointment",
        });
        return;
      }
    }

    if(permission==="client"){
      if (req.user?.role ==="lawyer"){
        res.status(403).json({
          success: false,
          message: "You are not authorized to cancel this appointment",
        });
        return;
      }
      if(req.user?.id!=hiring.client_id && req.user?.role!="admin"){
        res.status(403).json({
          success: false,
          message: "You are not authorized to cancel this appointment",
        });
        return;
      }
    }

    appointment.status = "cancelled";
    await appointment.save();

    res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
    });
    return;
  } catch (err:any) {
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
