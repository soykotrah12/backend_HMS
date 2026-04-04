import mongoose, { Schema } from "mongoose";

const medicineSchema = new Schema(
  {
    name: { type: String, trim: true, required: true },
    dosage: { type: String, trim: true, required: true },
    frequency: { type: String, trim: true, required: true },
    duration: { type: String, trim: true, required: true },
    notes: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const prescriptionSchema = new Schema(
  {
    appointment: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true,
      index: true,
    },
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
    diagnosis: { type: String, trim: true, default: "" },
    advice: { type: String, trim: true, default: "" },
    medicines: [medicineSchema],
    pdfUrl: { type: String, default: "" },
  },
  { timestamps: true },
);

export const Prescription = mongoose.model("Prescription", prescriptionSchema);
