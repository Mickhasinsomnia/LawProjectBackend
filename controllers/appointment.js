const Appointment = require("../models/Appointment");

exports.createAppointment = async (req, res, next) => {
  try {
    const newAppointment = await Appointment.create(req.body);

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
    let activity = await Appointment.findById(req.params.id);  // Use await here

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: `No appointment found with the id of ${req.params.id}`,
      });
    }

    // if(req.user.role != 'admin' && activity.lawyerId != req.user.id){
    //   return res.status(403).json({
    //     success: false,
    //     message: `User ${req.user.id} is not authorized to update this appointment`,
    //   });
    // }

    activity = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

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

    await Appointment.deleteOne({ _id: req.params.id });

    return res.status(200).json({
      success: true,
      message: "Appointment deleted successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete appointment",
      error: err.message,
    });
  }
};
