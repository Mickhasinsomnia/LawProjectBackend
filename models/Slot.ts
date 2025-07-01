import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema({
  lawyer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Lawyer', required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true }
});

export default mongoose.model('Slot', slotSchema);
