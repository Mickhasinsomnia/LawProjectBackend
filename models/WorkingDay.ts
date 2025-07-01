import mongoose from 'mongoose';

const timeRangeSchema = {
  start: {
    type: String,
    required: true,
    validate: {
      validator: (time: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(time),
      message: 'Invalid start time format (HH:mm expected)'
    }
  },
  end: {
    type: String,
    required: true,
    validate: {
      validator: (time: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(time),
      message: 'Invalid end time format (HH:mm expected)'
    }
  }
};

const WorkingDaySchema = new mongoose.Schema({
  lawyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lawyer',
    required: true
  },
  Monday: {
    type: timeRangeSchema,
    required: true
  },
  Tuesday: {
    type: timeRangeSchema,
    required: true
  },
  Wednesday: {
    type: timeRangeSchema,
    required: true
  },
  Thursday: {
    type: timeRangeSchema,
    required: true
  },
  Friday: {
    type: timeRangeSchema,
    required: true
  },
  Saturday: {
    type: timeRangeSchema,
    required: true
  },
  Sunday: {
    type: timeRangeSchema,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('WorkingDay', WorkingDaySchema);
