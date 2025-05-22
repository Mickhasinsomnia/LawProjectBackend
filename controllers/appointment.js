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

exports.updateAppointment = async (req, res, next) => {
  try {
    let activity = await Appointment.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: `No appointment found with the id of ${req.params.id}`,
      });
    }

    if (
      req.user.role !== "admin" &&
      activity.lawyerId.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this appointment`,
      });
    }

    if (activity.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message:
          "This appointment has already been cancelled and cannot be updated.",
      });
    }

    const hiring = await Hiring.findById(activity.hiringId);
    if (!hiring || hiring.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "The associated hiring is no longer active",
      });
    }

    if (req.body.status) {
      delete req.body.status;
    }

    if (req.body.task) activity.task = req.body.task;
    if (req.body.note) activity.note = req.body.note;
    if (req.body.location) activity.location = req.body.location;
    if (req.body.timeStamp) activity.timeStamp = req.body.timeStamp;

    await activity.save();

    return res.status(200).json({
      success: true,
      data: activity,
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({
      success: false,
      message: "Failed to update appointment",
      error: err.message,
    });
  }
};

exports.deleteAppointment = async (req, res, next) => {
  try {
    const activity = await Appointment.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "No appointment found with the given id",
      });
    }

    if (activity.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "This appointment is already cancelled",
      });
    }

    activity.status = "cancelled";
    await activity.save();

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
