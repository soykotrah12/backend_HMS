import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

const roleValues = [
  "superAdmin",
  "hospitalAdmin",
  "doctor",
  "patient",
  "receptionist",
  "pharmacist",
  "labTechnician",
  "admin",
  "fisherman",
  "spotOwner",
];

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      trim: true,
      required: [true, "Full name is required"],
      maxlength: 100,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: [true, "Email is required"],
      index: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },

    authProvider: {
      type: String,
      enum: ["LOCAL", "GOOGLE"],
      default: "LOCAL",
    },

    googleId: {
      type: String,
      default: null,
      index: true,
    },

    password: {
      type: String,
      minlength: [6, "Password must be at least 6 characters"],
      required: function () {
        return this.authProvider === "LOCAL";
      },
      select: false,
    },

    refreshTokenHash: {
      type: String,
      default: "",
      select: false,
    },
    refreshToken: {
      type: String,
      default: "",
    },
    blockedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        index: true,
      },
    ],

    role: {
      type: String,
      enum: roleValues,
      default: "patient",
      required: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    phone: { type: String, trim: true, default: "" },
    bio: { type: String, maxlength: 500, default: "" },
    avatar: {
      public_id: { type: String, default: "" },
      url: { type: String, default: "" },
    },

    otp: {
      hash: { type: String, default: "" },
      expiresAt: { type: Date, default: null },
      attempts: { type: Number, default: 0 },
      lastSentAt: { type: Date, default: null },
    },
    password_reset_token: {
      type: String,
      default: "",
      select: false,
    },
    resetPasswordOTP: {
      type: String,
      default: "",
      select: false,
    },
    resetPasswordOTPExpiry: {
      type: Date,
      default: null,
      select: false,
    },
    verificationInfo: {
      token: { type: String, default: "" },
      verified: { type: Boolean, default: false },
    },
    hospitalName: {
      type: String,
      trim: true,
      default: "",
    },
    paymentInfo: {
      type: {
        onboarded: { type: Boolean, default: false },
        bankAccount: { type: String, default: "" },
        accountHolderName: { type: String, default: "" },
        taxInfo: { type: String, default: "" },
        onboardedAt: { type: Date, default: null },
        accountId: { type: String, default: "" },
        payoutMethod: {
          type: String,
          enum: ["bank_transfer", "paypal", "none"],
          default: "none",
        },
      },
      default: {},
    },
  },
  { timestamps: true },
);

userSchema.statics.roles = roleValues;

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  if (!this.password) return next();

  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

userSchema.methods.isPasswordMatched = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.isOtpValid = async function (enteredOtp) {
  if (!this.otp.hash || !this.otp.expiresAt) return false;
  if (this.otp.expiresAt < new Date()) return false;
  return bcrypt.compare(String(enteredOtp), this.otp.hash);
};

userSchema.methods.setRefreshToken = async function (token) {
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
  this.refreshTokenHash = await bcrypt.hash(token, saltRounds);
  await this.save();
};

userSchema.methods.isRefreshTokenValid = async function (token) {
  if (!this.refreshTokenHash) return false;
  return bcrypt.compare(token, this.refreshTokenHash);
};

userSchema.methods.clearRefreshToken = async function () {
  this.refreshTokenHash = "";
  this.refreshToken = "";
  await this.save();
};

userSchema.statics.isUserExistsByEmail = async function (email) {
  return this.findOne({ email }).select("+password +password_reset_token");
};

userSchema.statics.isPasswordMatched = async function (
  enteredPassword,
  savedPassword,
) {
  return bcrypt.compare(enteredPassword, savedPassword);
};

userSchema.statics.isOTPVerified = async function (userId) {
  const user = await this.findById(userId).select(
    "isEmailVerified verificationInfo.verified",
  );
  if (!user) return false;
  return Boolean(user.isEmailVerified || user?.verificationInfo?.verified);
};

export const User = mongoose.model("User", userSchema);
