import mongoose from 'mongoose';

const LawyerSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  slogan : {
    type: String,
    required: true
  },
  summary : {
    type: String,
    required: true
  },
  lawfirm_name:{
    type: String,
    required: true
  },
  consultationRate: {
    min: { type: Number, required: true, min: 0 },
    max: { type: Number, required: true, min: 0 }
  },
  documentDeliveryRate: {
    min: { type: Number, required: false, min: 0 },
    max: { type: Number, required: false, min: 0 }
  },
  civilCase_specialized: {
    type: [String],
    default: []
  },
  criminalCase_specialized: {
    type: [String],
    default: []
  },
  has_law_license: {
    type: Boolean,
    default: false
  },
  is_verified_by_council: {
    type: Boolean,
    default: false
  },
  verificationDocs: {
    type: [String],
    default: [],
    required: true,
  },
  avgRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
    set: (val:number) => Math.round(val * 100) / 100,
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: 0,
  }

}, {
  timestamps: true,
  _id: false
});

export default mongoose.model('Lawyer', LawyerSchema);
