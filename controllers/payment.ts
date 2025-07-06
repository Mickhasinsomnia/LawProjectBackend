import Payment from '../models/Payment.js';
import Hiring from '../models/Hiring.js';
import Stripe from 'stripe'
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
dotenv.config({ path: "./config/config.env" });

export const addPayment = async (req: Request, res: Response) => {
  try {
    const hiring = await Hiring.findOne({ _id: req.params.id });
    if (!hiring) {
       res.status(404).json({success: false,message: 'Hiring not found'
      });
      return;
    }

    if (req.user?.role !== 'admin' && req.user?.id !== hiring.lawyer_id?.toString()) {
      res.status(403).json({
        success: false,
        message: `User is not authorized to add payment.`,
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
    const userId = req.user?.id;

    const payment = await Payment.findOne()
      .populate({
        path: "hiring_id",
        match:{
            $or: [
              { client_id: userId },
              { lawyer_id: userId }
            ]
          },
        select: "client_id lawyer_id"
      })
      .lean();

    if (!payment || !payment.hiring_id) {
      res.status(404).json({
        success: false,
        message: "Payment not found for this user",
      });
      return;
    }

    res.status(200).json({ success: true, data: payment });
  } catch (err: any) {
    console.error(err);
    res.status(400).json({
      success: false,
      message: "Failed to fetch payment",
      error: err.message,
    });
  }
};


export const handlePayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      res.status(500).json({ error: 'Stripe API key is not configured' });
      return;
    }

    const bill = await Payment.findById(req.params.id);
    if (!bill) {
      res.status(404).json({ success: false, message: 'Payment not found' });
      return;
    }

    if (bill.status==='paid'){
      res.status(400).json({ success: false, message: 'Payment already completed' });
      return;
    }

    const stripe = new Stripe(key);
    const amount = bill.amount;
    if (!amount || amount <= 0) {
      res.status(400).json({ success: false, message: 'Invalid payment amount' });
      return;
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['promptpay'],
      line_items: [
        {
          price_data:{
            currency:'thb',
            product_data:{
              name:"Law Payment"
            },
            unit_amount: amount*100,
          },
           quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://example.com/success',
      cancel_url: 'https://example.com/cancel',
    });

    bill.stripeSession_id = session.id;
    await bill.save();

    res.status(200).json({ url: session.url });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {


    const bill = await Payment.findById(req.params.id);
    if (!bill) {
      res.status(404).json({ success: false, message: 'Payment not found' });
      return;
    }

    const session_id = bill.stripeSession_id;

    if (!session_id || typeof session_id !== 'string') {
      res.status(400).json({ error: 'Missing or invalid session_id' });
      return;
    }

    const key = process.env.STRIPE_SECRET_KEY;

    if (!key) {
      res.status(500).json({ error: 'Stripe API key is not configured' });
      return;
    }

    const stripe = new Stripe(key);

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === 'paid') {

      bill.status = 'paid';

      await bill.save();

      res.status(200).json({ success: true, message: 'Payment completed' });
      return;
    } else {
      res.status(200).json({ success: false, message: 'Payment not completed' });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
};
