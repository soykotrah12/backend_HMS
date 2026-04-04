import httpStatus from "http-status";
import AppError from "../errors/AppError.js";
import { Notification } from "../model/notification.model.js";
import { User } from "../model/user.model.js";
import { buildMeta, getPagination, getSort } from "../utils/queryHelper.js";

export const notificationService = {
  create: async (payload) => {
    const user = await User.findById(payload.userId).select("_id");
    if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");

    return Notification.create({
      user: payload.userId,
      title: payload.title,
      message: payload.message,
      type: payload.type || "general",
      metadata: payload.metadata || {},
    });
  },

  listForUser: async ({ userId, query }) => {
    const { page, limit, skip } = getPagination(query);
    const sort = getSort(query, "-createdAt");

    const where = { user: userId };
    if (typeof query.isRead !== "undefined") {
      where.isRead = query.isRead === "true";
    }

    const [notifications, total] = await Promise.all([
      Notification.find(where).sort(sort).skip(skip).limit(limit),
      Notification.countDocuments(where),
    ]);

    return { notifications, meta: buildMeta(page, limit, total) };
  },

  markAsRead: async ({ id, userId }) => {
    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: userId },
      { isRead: true },
      { new: true },
    );

    if (!notification) throw new AppError(httpStatus.NOT_FOUND, "Notification not found");
    return notification;
  },
};
