import mongoose, { Schema } from "mongoose";

const medicalHistorySchema = new Schema(
  {
    condition: { type: String, trim: true, required: true },
    diagnosisDate: { type: Date, default: Date.now },
    notes: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const patientSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    dateOfBirth: { type: Date, default: null },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
      default: "prefer_not_to_say",
    },
    bloodGroup: { type: String, trim: true, default: "" },
    emergencyContact: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
    allergies: [{ type: String, trim: true }],
    chronicDiseases: [{ type: String, trim: true }],
    medicalHistory: [medicalHistorySchema],
  },
  { timestamps: true },
);

export const Patient = mongoose.model("Patient", patientSchema);
