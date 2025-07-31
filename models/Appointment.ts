import mongoose, { Document, Types } from "mongoose";

export interface IAppointment extends Document {
  case_id?: Types.ObjectId;
  client_id: Types.ObjectId;
  lawyer_id: Types.ObjectId;
  timeStamp: Date;
  task: string;
  note?: string;
  location: string;
  status?: "confirmed"  | "completed";
  permission?: "shared" | "lawyer" | "client";
}

const AppointmentSchema = new mongoose.Schema({
  case_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CaseRequest",
  },
  client_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  lawyer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lawyer',
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
