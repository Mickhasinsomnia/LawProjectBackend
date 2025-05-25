const Appointment = require("../models/Appointment");
const Hiring = require("../models/Hiring");

exports.createAppointment = async (req, res, next) => {
  try {
    const hiring = await Hiring.findById(req.params.id);

    if (!hiring) {
      return res.status(404).json({
        success: false,
        message: "Hiring not found",
      });
    }

    if (hiring.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Hiring is not active or has been canceled",
      });
    }

    const appointmentData = {
      ...req.body,
      hiringId: req.params.id,
      permission: req.body.permission
    };

    const newAppointment = await Appointment.create(appointmentData);

    return res.status(201).json({
      success: true,
      data: newAppointment,
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({
      success: false,
      message: "Failed to create appointment",
      error: err.message,
    });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    const hiring = await Hiring.findById(appointment.hiringId);
    if (!hiring) {
      return res.status(404).json({ success: false, message: "Associated hiring not found" });
    }

    if (appointment.status === "cancelled") {
      return res.status(400).json({ success: false, message: "Cannot update a cancelled appointment" });
    }

    if(permission==="shared" || permission==="lawyer"){
      if (req.user.role ==="user"){
        return res.status(403).json({
          success: false,
          message: "You are not authorized to update this appointment",
        });
      }
      if(req.user.id!=hiring.lawyer_id && req.user.role!="admin"){
        return res.status(403).json({
          success: false,
          message: "You are not authorized to update this appointment",
        });
      }
    }

    if(permission==="user"){
      if (req.user.role ==="lawyer"){
        return res.status(403).json({
          success: false,
          message: "You are not authorized to update this appointment",
        });
      }
      if(req.user.id!=hiring.client_id && req.user.role!="admin"){
        return res.status(403).json({
          success: false,
          message: "You are not authorized to update this appointment",
        });
      }
    }


    const { task, note, location, timeStamp } = req.body;
    if (task) appointment.task = task;
    if (note) appointment.note = note;
    if (location) appointment.location = location;
    if (timeStamp) appointment.timeStamp = timeStamp;

    await appointment.save();

    return res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Failed to update appointment",
      error: err.message,
    });
  }
};


exports.deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "No appointment found with the given id",
      });
    }

    if (appointment.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "This appointment is already cancelled",
      });
    }

    const hiring = await Hiring.findById(appointment.hiringId);
    if (!hiring) {
      return res.status(404).json({
        success: false,
        message: "Associated hiring not found",
      });
    }

    if(permission==="shared" || permission==="lawyer"){
      if (req.user.role ==="user"){
        return res.status(403).json({
          success: false,
          message: "You are not authorized to cancel this appointment",
        });
      }
      if(req.user.id!=hiring.lawyer_id && req.user.role!="admin"){
        return res.status(403).json({
          success: false,
          message: "You are not authorized to cancel this appointment",
        });
      }
    }

    if(permission==="user"){
      if (req.user.role ==="lawyer"){
        return res.status(403).json({
          success: false,
          message: "You are not authorized to cancel this appointment",
        });
      }
      if(req.user.id!=hiring.client_id && req.user.role!="admin"){
        return res.status(403).json({
          success: false,
          message: "You are not authorized to cancel this appointment",
        });
      }
    }

    appointment.status = "cancelled";
    await appointment.save();

    return res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Failed to cancel appointment",
      error: err.message,
    });
  }
};
