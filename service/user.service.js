import httpStatus from "http-status";
import AppError from "../errors/AppError.js";
import { User } from "../model/user.model.js";
import { uploadOnCloudinary } from "../utils/commonMethod.js";
import { buildMeta, getPagination, getSort } from "../utils/queryHelper.js";

const safeProjection = "-password -refreshToken -verificationInfo -password_reset_token -resetPasswordOTP -resetPasswordOTPExpiry";

export const userService = {
  getProfile: async (userId) => {
    const user = await User.findById(userId).select(safeProjection);
    if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");
    return user;
  },

  updateProfile: async (userId, payload, file) => {
    const user = await User.findById(userId);
    if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");

    if (typeof payload.fullName !== "undefined") user.fullName = payload.fullName;
    if (typeof payload.phone !== "undefined") user.phone = payload.phone;
    if (typeof payload.bio !== "undefined") user.bio = payload.bio;

    if (file?.buffer) {
      const upload = await uploadOnCloudinary(file.buffer);
      user.avatar = { public_id: upload.public_id, url: upload.secure_url };
    }

    await user.save();
    return User.findById(userId).select(safeProjection);
  },

  listUsers: async (query) => {
    const { page, limit, skip } = getPagination(query);
    const sort = getSort(query, "-createdAt");

    const where = {};
    if (query.role) where.role = query.role;
    if (query.search) {
      where.$or = [
        { fullName: { $regex: query.search, $options: "i" } },
        { email: { $regex: query.search, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(where).select(safeProjection).sort(sort).skip(skip).limit(limit),
      User.countDocuments(where),
    ]);

    return { users, meta: buildMeta(page, limit, total) };
  },

  updateRole: async ({ userId, role }) => {
    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true },
    ).select(safeProjection);

    if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");
    return user;
  },

  changePassword: async ({ userId, currentPassword, newPassword }) => {
    const user = await User.findById(userId).select("+password");
    if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");

    const matched = await user.isPasswordMatched(currentPassword);
    if (!matched) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Current password is incorrect");
    }

    user.password = newPassword;
    await user.save();

    return null;
  },

  blockUser: async ({ me, targetId }) => {
    if (String(me) === String(targetId)) {
      throw new AppError(httpStatus.BAD_REQUEST, "You can't block yourself");
    }

    const target = await User.findById(targetId).select("_id");
    if (!target) throw new AppError(httpStatus.NOT_FOUND, "User not found");

    await User.findByIdAndUpdate(me, { $addToSet: { blockedUsers: targetId } }, { new: true });
    return { blocked: true, userId: targetId };
  },

  unblockUser: async ({ me, targetId }) => {
    const target = await User.findById(targetId).select("_id");
    if (!target) throw new AppError(httpStatus.NOT_FOUND, "User not found");

    await User.findByIdAndUpdate(me, { $pull: { blockedUsers: targetId } }, { new: true });
    return { blocked: false, userId: targetId };
  },
};
