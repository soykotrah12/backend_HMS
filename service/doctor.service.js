import httpStatus from "http-status";
import AppError from "../errors/AppError.js";
import { Doctor } from "../model/doctor.model.js";
import { User } from "../model/user.model.js";
import { buildMeta, getPagination, getSort } from "../utils/queryHelper.js";

const ensureTimeRangeValid = (startTime, endTime) => {
  if (startTime >= endTime) {
    throw new AppError(httpStatus.BAD_REQUEST, "startTime must be before endTime");
  }
};

export const doctorService = {
  createOrUpdateProfile: async ({ userId, payload }) => {
    const user = await User.findById(userId);
    if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");

    if (user.role !== "doctor") {
      user.role = "doctor";
      await user.save();
    }

    const doc = await Doctor.findOneAndUpdate(
      { user: userId },
      {
        specialization: payload.specialization,
        registrationNumber: payload.registrationNumber,
        qualification: payload.qualification || "",
        experienceYears: payload.experienceYears || 0,
        consultationFee: payload.consultationFee || 0,
      },
      { new: true, upsert: true, runValidators: true },
    ).populate("user", "fullName email phone role");

    return doc;
  },

  setAvailability: async ({ doctorId, availability }) => {
    availability.forEach((slot) => ensureTimeRangeValid(slot.startTime, slot.endTime));

    const doctor = await Doctor.findByIdAndUpdate(
      doctorId,
      { availability },
      { new: true, runValidators: true },
    ).populate("user", "fullName email");

    if (!doctor) throw new AppError(httpStatus.NOT_FOUND, "Doctor profile not found");
    return doctor;
  },

  getMyProfile: async (userId) => {
    const doctor = await Doctor.findOne({ user: userId }).populate(
      "user",
      "fullName email phone role",
    );

    if (!doctor) throw new AppError(httpStatus.NOT_FOUND, "Doctor profile not found");
    return doctor;
  },

  getById: async (id) => {
    const doctor = await Doctor.findById(id).populate("user", "fullName email phone role");
    if (!doctor) throw new AppError(httpStatus.NOT_FOUND, "Doctor not found");
    return doctor;
  },

  list: async (query) => {
    const { page, limit, skip } = getPagination(query);
    const sort = getSort(query);

    const where = {};
    if (query.specialization) {
      where.specialization = { $regex: query.specialization, $options: "i" };
    }

    const [doctors, total] = await Promise.all([
      Doctor.find(where)
        .populate("user", "fullName email phone role")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Doctor.countDocuments(where),
    ]);

    const filtered = query.search
      ? doctors.filter((doctor) =>
          `${doctor.user?.fullName || ""} ${doctor.user?.email || ""}`
            .toLowerCase()
            .includes(String(query.search).toLowerCase()),
        )
      : doctors;

    return {
      doctors: filtered,
      meta: buildMeta(page, limit, query.search ? filtered.length : total),
    };
  },
};
