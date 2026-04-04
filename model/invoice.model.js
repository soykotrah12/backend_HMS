import mongoose, { Schema } from "mongoose";

const invoiceItemSchema = new Schema(
  {
    title: { type: String, trim: true, required: true },
    description: { type: String, trim: true, default: "" },
    quantity: { type: Number, min: 1, default: 1 },
    amount: { type: Number, min: 0, required: true },
  },
  { _id: false },
);

const paymentSchema = new Schema(
  {
    amount: { type: Number, min: 0, required: true },
    method: {
      type: String,
      enum: ["cash", "card", "mobile_banking", "bank_transfer", "other"],
      default: "cash",
    },
    transactionId: { type: String, trim: true, default: "" },
    paidAt: { type: Date, default: Date.now },
    notes: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const invoiceSchema = new Schema(
  {
    invoiceNo: { type: String, required: true, unique: true, index: true },
    patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    appointment: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
    },
    items: [invoiceItemSchema],
    subtotal: { type: Number, min: 0, default: 0 },
    tax: { type: Number, min: 0, default: 0 },
    discount: { type: Number, min: 0, default: 0 },
    total: { type: Number, min: 0, default: 0 },
    paidAmount: { type: Number, min: 0, default: 0 },
    status: {
      type: String,
      enum: ["unpaid", "partially_paid", "paid", "cancelled"],
      default: "unpaid",
      index: true,
    },
    payments: [paymentSchema],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

export const Invoice = mongoose.model("Invoice", invoiceSchema);
