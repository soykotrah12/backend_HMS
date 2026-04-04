import httpStatus from "http-status";
import AppError from "../errors/AppError.js";
import sendResponse from "../utils/sendResponse.js";
import catchAsync from "../utils/catchAsync.js";
import { User } from "../model/user.model.js";

export const allUsers = catchAsync(async (req, res) => {
  const users = await User.find().select(
    "-password -refreshToken -password_reset_token -verificationInfo"
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users fetched",
    data: users,
  });
});

export const getUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id).select(
    "-password -refreshToken -password_reset_token -verificationInfo"
  );
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User fetched",
    data: user,
  });
});

export const updateUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id).select(
    "-password -refreshToken -password_reset_token -verificationInfo"
  );
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User updated",
    data: updatedUser,
  });
});

export const deleteUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  await User.findByIdAndDelete(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User deleted",
  });
});