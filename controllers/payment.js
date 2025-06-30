const Payment = require('../models/Payment');
const Hiring = require('../models/Hiring');
const fetch = require('node-fetch');
const FormData = require('form-data');


exports.addPayment = async (req, res) => {
  try {

    const hiring = await Hiring.exists({ _id: req.params.id });
    if (!hiring) {
      return res.status(404).json({
        success: false,
        message: 'Hiring not found',
      });
    }

    const payment = await Payment.create({
      ...req.body,
      hiring_id: req.params.id
    })

    return res.status(201).json({ success: true, data: payment });

  }
  catch (err) {
    console.error(err);
    return res.status(400).json({
      success: false,
      message: "Failed to create payment",
      error: err.message,
    });
  }
}

exports.getPayment = async (req, res) => {
  try {

    const payment = await Payment.find();

    return res.status(201).json({ success: true, data: payment });

  }
  catch (err) {
    console.error(err);
    return res.status(400).json({
      success: false,
      message: "Failed to create payment",
      error: err.message,
    });
  }
}

exports.payVerify = async (req, res) => {
  try {

    const bill = await Payment.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (!req.file) {
      return res.status(401).json({ success: false, message: 'Please upload slip' });
    }

    const formData = new FormData();
    formData.append('file', req.file.buffer, req.file.originalname);


    const response = await fetch(process.env.SLIP_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SLIP_TOKEN}`,
        ...formData.getHeaders(),
      },
      body: formData,
    });

    const data = await response.json();

    if (response.status === 200) {

      bill.status = 'paid';
      await bill.save();

      return res.status(200).json({ success: true, message: 'Payment verified and updated', data });
    } else {
      return res.status(response.status).json({ success: false, message: 'Verification failed', data });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
