const WorkingDay = require('../models/WorkingDay');

exports.createWorkingDay = async (req, res) => {
  try {
    const existing = await WorkingDay.findOne({ lawyerId: req.user.id });
    if (existing) {
      return res.status(400).json({ message: "Working day data already exists" });
    }


    const {Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday} = req.body;


    const workingDay = await WorkingDay.create({
      lawyerId: req.user.id,
      Monday,
      Tuesday,
      Wednesday,
      Thursday,
      Friday,
      Saturday,
      Sunday
    });

    res.status(201).json(workingDay);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateWorkingDay = async (req, res) => {
  try {
    const {
      Monday,
      Tuesday,
      Wednesday,
      Thursday,
      Friday,
      Saturday,
      Sunday
    } = req.body;

    const workingDay = await WorkingDay.findOne({ lawyerId: req.user.id });
    if (!workingDay) {
      return res.status(404).json({ error: 'WorkingDay not found' });
    }

    if (Monday !== undefined) workingDay.Monday = Monday;
    if (Tuesday !== undefined) workingDay.Tuesday = Tuesday;
    if (Wednesday !== undefined) workingDay.Wednesday = Wednesday;
    if (Thursday !== undefined) workingDay.Thursday = Thursday;
    if (Friday !== undefined) workingDay.Friday = Friday;
    if (Saturday !== undefined) workingDay.Saturday = Saturday;
    if (Sunday !== undefined) workingDay.Sunday = Sunday;

    await workingDay.save();

    res.json(workingDay);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
