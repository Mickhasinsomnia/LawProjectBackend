import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  hiring_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hiring',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'completed'],
    default: 'pending'
  },
  amount: {
    type: Number
  },
});

export default mongoose.model('Payment', PaymentSchema);
