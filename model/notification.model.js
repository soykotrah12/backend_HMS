import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, trim: true, required: true },
    message: { type: String, trim: true, required: true },
    type: {
      type: String,
      enum: ["general", "appointment", "billing", "lab", "prescription"],
      default: "general",
    },
    isRead: { type: Boolean, default: false, index: true },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

export const Notification = mongoose.model("Notification", notificationSchema);
