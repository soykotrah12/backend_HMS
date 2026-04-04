import mongoose, { Schema } from "mongoose";

const availabilitySchema = new Schema(
  {
    dayOfWeek: {
      type: String,
      enum: [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ],
      required: true,
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
  },
  { _id: false },
);

const doctorSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    specialization: {
      type: String,
      trim: true,
      required: [true, "Specialization is required"],
      index: true,
    },
    registrationNumber: {
      type: String,
      trim: true,
      required: [true, "Registration number is required"],
      unique: true,
      index: true,
    },
    qualification: { type: String, trim: true, default: "" },
    experienceYears: { type: Number, default: 0, min: 0 },
    consultationFee: { type: Number, default: 0, min: 0 },
    availability: [availabilitySchema],
  },
  { timestamps: true },
);

export const Doctor = mongoose.model("Doctor", doctorSchema);
