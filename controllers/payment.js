const Payment = require('../models/Payment');
const Hiring = require('../models/Hiring');


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

exports.payVerify = async (req,res) =>{

  const bill = await Payment.findById(req.params.id);

  if(!bill){
    return res.status(404).json({success:false , message: 'Payment not found',})
  }





}
