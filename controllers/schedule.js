const Schedule = require("../models/Schedule");

exports.addSchedule = async (req, res, next) => {
  const newSchedule = await Schedule.create(req.body);
  try {
    res.status(201).json({
      success: true,
      data: newSchedule,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      success: false,
      message: "Failed to create camp",
    });
  }
};

exports.updateSchedule = async (req, res, next) => {

};
