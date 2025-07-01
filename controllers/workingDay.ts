import WorkingDay from '../models/WorkingDay.js';
import { Request, Response, NextFunction } from 'express';

export const createWorkingDay = async (req: Request, res: Response, next:NextFunction) => {
  try {
    const existing = await WorkingDay.findOne({ lawyerId: req.user?.id });
    if (existing) {
      res.status(400).json({ message: "Working day data already exists" });
    }

    const { Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday } = req.body;

    const workingDay = await WorkingDay.create({
      lawyerId: req.user?.id,
      Monday,
      Tuesday,
      Wednesday,
      Thursday,
      Friday,
      Saturday,
      Sunday
    });

    res.status(201).json({ success: true, data: workingDay });
  } catch (err: any) {
    res.status(400).json({ success: false, message: "Failed to create working day", error: err.message });
  }
};

export const updateWorkingDay = async (req: Request, res: Response, next:NextFunction) => {
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

    const workingDay = await WorkingDay.findOne({ lawyerId: req.user?.id });
    if (!workingDay) {
      res.status(404).json({ error: 'WorkingDay not found' });
      return;
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
  } catch (error:any) {
    res.status(400).json({ error: error.message });
  }
};
