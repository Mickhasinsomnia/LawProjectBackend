import Payment from '../models/Payment.js';
import Hiring from '../models/Hiring.js';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { Request, Response, NextFunction } from 'express';

export const addPayment = async (req: Request, res: Response) => {
  try {
    const hiring = await Hiring.exists({ _id: req.params.id });
    if (!hiring) {
       res.status(404).json({success: false,message: 'Hiring not found'
      });
      return;
    }

    const payment = await Payment.create({
      ...req.body,
      hiring_id: req.params.id
    });

    res.status(201).json({ success: true, data: payment });

  }
  catch (err: any) {
    console.error(err);
    res.status(400).json({
      success: false,
      message: "Failed to create payment",
      error: err.message,
    });
  }
}

export const getPayment = async (req: Request, res: Response) => {
  try {

    const payment = await Payment.find();

    res.status(201).json({ success: true, data: payment });

  }
  catch (err:any) {
    console.error(err);
    res.status(400).json({
      success: false,
      message: "Failed to create payment",
      error: err.message,
    });
  }
}

export const payVerify = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const bill = await Payment.findById(req.params.id);
    if (!bill) {
      res.status(404).json({ success: false, message: 'Payment not found' });
      return;
    }

    if (!req.file) {
      res.status(401).json({ success: false, message: 'Please upload slip' });
      return;
    }

    const formData = new FormData();
    formData.append('file', req.file.buffer, req.file.originalname);

    if (!process.env.SLIP_API || !process.env.SLIP_API) {
      res.status(500).json({ success: false, message: 'Missing API configuration' });
      return;
    }

    const response = await fetch(process.env.SLIP_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SLIP_API}`,
        ...formData.getHeaders(),
      },
      body: formData,
    });

    const data = await response.json();

    if (response.status === 200) {

      bill.status = 'paid';
      await bill.save();

      res.status(200).json({ success: true, message: 'Payment verified and updated', data });
    } else {
      res.status(response.status).json({ success: false, message: 'Verification failed', data });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
