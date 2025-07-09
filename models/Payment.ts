import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  case_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CaseRequest',
  },
  status: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  },
  amount: {
    type: Number
  },
  stripeSession_id: {
    type: String,
  },
  },{ timestamps: true });

export default mongoose.model('Payment', PaymentSchema);
