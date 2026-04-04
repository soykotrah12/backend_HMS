import mongoose, { Schema } from "mongoose";

const labTestSchema = new Schema(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      default: null,
    },
    appointment: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
    },
    testName: { type: String, trim: true, required: true, index: true },
    testDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["booked", "in_progress", "completed", "cancelled"],
      default: "booked",
      index: true,
    },
    notes: { type: String, trim: true, default: "" },
    reportUrl: { type: String, default: "" },
    reportType: {
      type: String,
      enum: ["pdf", "image", "url", "none"],
      default: "none",
    },
    bookedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

export const LabTest = mongoose.model("LabTest", labTestSchema);
