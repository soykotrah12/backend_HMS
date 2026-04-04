import mongoose, { Schema } from "mongoose";

const medicineSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      index: true,
    },
    genericName: { type: String, trim: true, default: "" },
    manufacturer: { type: String, trim: true, default: "" },
    batchNo: { type: String, trim: true, required: true, unique: true },
    expiryDate: { type: Date, required: true },
    price: { type: Number, min: 0, required: true },
    stock: { type: Number, min: 0, default: 0 },
    reorderLevel: { type: Number, min: 0, default: 10 },
    description: { type: String, trim: true, default: "" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

export const Medicine = mongoose.model("Medicine", medicineSchema);
