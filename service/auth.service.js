import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import AppError from "../errors/AppError.js";
import { User } from "../model/user.model.js";
import { createToken, verifyToken } from "../utils/authToken.js";
import { sendEmail } from "../utils/sendEmail.js";

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const issueTokenPair = async (user) => {
  const jwtPayload = {
    _id: user._id,
    email: user.email,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    process.env.JWT_ACCESS_SECRET,
    process.env.JWT_ACCESS_EXPIRES_IN,
  );

  const refreshToken = createToken(
    jwtPayload,
    process.env.JWT_REFRESH_SECRET,
    process.env.JWT_REFRESH_EXPIRES_IN,
  );

  user.refreshToken = refreshToken;
  await user.save();

  return { accessToken, refreshToken };
};

const sendOtpByEmail = async (email, otp, purpose) => {
  const body = `Your ${purpose} OTP is ${otp}. This OTP expires in 10 minutes.`;

  try {
    await sendEmail(email, `${purpose} OTP`, body);
  } catch (error) {
    console.error("Unable to send OTP email. Mock flow enabled.", error.message);
  }
};

export const authService = {
  registerUser: async (payload) => {
    const existingUser = await User.findOne({ email: payload.email });
    if (existingUser) {
      throw new AppError(httpStatus.BAD_REQUEST, "Email already exists");
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);

    const user = await User.create({
      fullName: payload.fullName,
      email: payload.email,
      password: payload.password,
      role: payload.role,
      phone: payload.phone || "",
      hospitalName: payload.hospitalName || "",
      resetPasswordOTP: otpHash,
      resetPasswordOTPExpiry: new Date(Date.now() + 10 * 60 * 1000),
      isEmailVerified: false,
      verificationInfo: {
        token: "email-otp",
        verified: false,
      },
    });

    await sendOtpByEmail(user.email, otp, "Email Verification");

    const safeUser = await User.findById(user._id).select("-password -refreshToken");
    return {
      user: safeUser,
      otp: process.env.NODE_ENV === "development" ? otp : undefined,
    };
  },

  loginUser: async ({ email, password }) => {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    const isPasswordValid = await user.isPasswordMatched(password);
    if (!isPasswordValid) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Invalid credentials");
    }

    if (!user.isEmailVerified) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Email is not verified. Please verify OTP first.",
      );
    }

    const tokens = await issueTokenPair(user);

    return {
      ...tokens,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    };
  },

  verifyEmailOtp: async ({ email, otp }) => {
    const user = await User.findOne({ email }).select(
      "+resetPasswordOTP +resetPasswordOTPExpiry",
    );

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    if (!user.resetPasswordOTP || !user.resetPasswordOTPExpiry) {
      throw new AppError(httpStatus.BAD_REQUEST, "OTP not found");
    }

    if (user.resetPasswordOTPExpiry.getTime() < Date.now()) {
      throw new AppError(httpStatus.BAD_REQUEST, "OTP expired");
    }

    const isOtpValid = await bcrypt.compare(String(otp), user.resetPasswordOTP);
    if (!isOtpValid) {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid OTP");
    }

    user.isEmailVerified = true;
    user.verificationInfo = { token: "", verified: true };
    user.resetPasswordOTP = "";
    user.resetPasswordOTPExpiry = null;
    await user.save();

    return { email: user.email, verified: true };
  },

  forgotPassword: async ({ email }) => {
    const user = await User.findOne({ email }).select(
      "+resetPasswordOTP +resetPasswordOTPExpiry",
    );
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    const otp = generateOtp();
    user.resetPasswordOTP = await bcrypt.hash(otp, 10);
    user.resetPasswordOTPExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOtpByEmail(email, otp, "Password Reset");

    return {
      email,
      otp: process.env.NODE_ENV === "development" ? otp : undefined,
    };
  },

  resetPassword: async ({ email, otp, password }) => {
    const user = await User.findOne({ email }).select(
      "+resetPasswordOTP +resetPasswordOTPExpiry +password",
    );

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    if (!user.resetPasswordOTP || !user.resetPasswordOTPExpiry) {
      throw new AppError(httpStatus.BAD_REQUEST, "Reset OTP is invalid");
    }

    if (user.resetPasswordOTPExpiry.getTime() < Date.now()) {
      throw new AppError(httpStatus.BAD_REQUEST, "Reset OTP expired");
    }

    const isOtpValid = await bcrypt.compare(String(otp), user.resetPasswordOTP);
    if (!isOtpValid) {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid OTP");
    }

    user.password = password;
    user.resetPasswordOTP = "";
    user.resetPasswordOTPExpiry = null;
    await user.save();

    return null;
  },

  refreshToken: async ({ refreshToken }) => {
    let decoded;

    try {
      decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Invalid refresh token");
    }

    const user = await User.findById(decoded._id);
    if (!user || user.refreshToken !== refreshToken) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Invalid refresh token");
    }

    const tokens = await issueTokenPair(user);
    return tokens;
  },

  logout: async (userId) => {
    await User.findByIdAndUpdate(userId, { refreshToken: "" }, { new: true });
    return null;
  },

  changePassword: async ({ userId, oldPassword, newPassword }) => {
    const user = await User.findById(userId).select("+password");
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    const matched = await user.isPasswordMatched(oldPassword);
    if (!matched) {
      throw new AppError(httpStatus.BAD_REQUEST, "Old password is incorrect");
    }

    user.password = newPassword;
    await user.save();

    return null;
  },
};
