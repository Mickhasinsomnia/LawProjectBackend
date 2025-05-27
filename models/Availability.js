const mongoose = require('mongoose');

const AvailabilitySchema = new mongoose.Schema({
  lawyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lawyer',
    required: true
  },
  weeklyAvailability: {
    Monday: {
      type: [String],
      default: [],
      validate: {
        validator: times =>
          times.every(time => /^([01]\d|2[0-3]):([0-5]\d)$/.test(time)),
        message: 'Invalid time format in Monday'
      }
    },
    Tuesday: {
      type: [String],
      default: [],
      validate: {
        validator: times =>
          times.every(time => /^([01]\d|2[0-3]):([0-5]\d)$/.test(time)),
        message: 'Invalid time format in Tuesday'
      }
    },
    Wednesday: {
      type: [String],
      default: [],
      validate: {
        validator: times =>
          times.every(time => /^([01]\d|2[0-3]):([0-5]\d)$/.test(time)),
        message: 'Invalid time format in Wednesday'
      }
    },
    Thursday: {
      type: [String],
      default: [],
      validate: {
        validator: times =>
          times.every(time => /^([01]\d|2[0-3]):([0-5]\d)$/.test(time)),
        message: 'Invalid time format in Thursday'
      }
    },
    Friday: {
      type: [String],
      default: [],
      validate: {
        validator: times =>
          times.every(time => /^([01]\d|2[0-3]):([0-5]\d)$/.test(time)),
        message: 'Invalid time format in Friday'
      }
    },
    Saturday: {
      type: [String],
      default: [],
      validate: {
        validator: times =>
          times.every(time => /^([01]\d|2[0-3]):([0-5]\d)$/.test(time)),
        message: 'Invalid time format in Saturday'
      }
    },
    Sunday: {
      type: [String],
      default: [],
      validate: {
        validator: times =>
          times.every(time => /^([01]\d|2[0-3]):([0-5]\d)$/.test(time)),
        message: 'Invalid time format in Sunday'
      }
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LawyerAvailability', AvailabilitySchema);
