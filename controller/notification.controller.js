import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync.js";
import sendResponse from "../utils/sendResponse.js";
import { notificationService } from "../service/notification.service.js";

export const createNotification = catchAsync(async (req, res) => {
  const notification = await notificationService.create(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Notification created",
    data: notification,
  });
});

export const listMyNotifications = catchAsync(async (req, res) => {
  const result = await notificationService.listForUser({
    userId: req.user._id,
    query: req.query,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Notifications fetched",
    data: result.notifications,
    meta: result.meta,
  });
});

export const markNotificationAsRead = catchAsync(async (req, res) => {
  const notification = await notificationService.markAsRead({
    id: req.params.id,
    userId: req.user._id,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Notification marked as read",
    data: notification,
  });
});
