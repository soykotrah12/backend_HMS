import mongoose from "mongoose";
import httpStatus from "http-status";
import AppError from "../errors/AppError.js";
import sendResponse from "../utils/sendResponse.js";
import catchAsync from "../utils/catchAsync.js";
import { userService } from "../service/user.service.js";

export const getProfile = catchAsync(async (req, res) => {
  const user = await userService.getProfile(req.user._id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile fetched",
    data: user,
  });
});

export const updateProfile = catchAsync(async (req, res) => {
  const user = await userService.updateProfile(req.user._id, req.body, req.file);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile updated",
    data: user,
  });
});

export const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    throw new AppError(httpStatus.BAD_REQUEST, "Passwords don't match");
  }

  await userService.changePassword({
    userId: req.user._id,
    currentPassword,
    newPassword,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password changed successfully",
    data: null,
  });
});

export const blockUser = catchAsync(async (req, res) => {
  const { userId } = req.params;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Valid userId is required");
  }

  const result = await userService.blockUser({ me: req.user._id, targetId: userId });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User blocked successfully",
    data: result,
  });
});

export const unblockUser = catchAsync(async (req, res) => {
  const { userId } = req.params;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Valid userId is required");
  }

  const result = await userService.unblockUser({ me: req.user._id, targetId: userId });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User unblocked successfully",
    data: result,
  });
});

export const listUsers = catchAsync(async (req, res) => {
  const result = await userService.listUsers(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users fetched",
    data: result.users,
    meta: result.meta,
  });
});

export const updateUserRole = catchAsync(async (req, res) => {
  const result = await userService.updateRole({
    userId: req.params.id,
    role: req.body.role,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User role updated",
    data: result,
  });
});
