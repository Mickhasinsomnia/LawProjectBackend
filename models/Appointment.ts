import mongoose, { Document, Types } from "mongoose";

export interface IAppointment extends Document {
  hiringId?: Types.ObjectId;
  client_id: Types.ObjectId;
  lawyer_id: Types.ObjectId;
  timeStamp: Date;
  task: string;
  note?: string;
  location: string;
  status?: "confirmed" | "cancelled" | "completed";
  permission?: "shared" | "lawyer" | "client";
}

const AppointmentSchema = new mongoose.Schema({
  hiringId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hiring",
  },
  client_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lawyer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lawyer',
    required: true
  },
  timeStamp: {
    type: Date,
    required: true,
  },
  task: {
    type: String,
    required: true,
  },
  note: {
    type: String,
    default: "",
  },
  location: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["confirmed", "cancelled", "completed"],
    default: "confirmed",
  },
  permission: {
    type: String,
    enum: ["shared", "lawyer", "client"],
    default: "shared",
  },
}, { timestamps: true });

export default mongoose.model<IAppointment>("Appointment", AppointmentSchema);
