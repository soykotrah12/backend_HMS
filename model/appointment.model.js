import mongoose, { Schema } from "mongoose";

const appointmentSchema = new Schema(
  {
    doctor: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      index: true,
    },
    patient: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
      index: true,
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    reason: { type: String, trim: true, default: "" },
    notes: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
      index: true,
    },
    bookedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

appointmentSchema.index(
  { doctor: 1, appointmentDate: 1, startTime: 1, endTime: 1 },
  { unique: true },
);

export const Appointment = mongoose.model("Appointment", appointmentSchema);
