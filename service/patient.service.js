import httpStatus from "http-status";
import AppError from "../errors/AppError.js";
import { Patient } from "../model/patient.model.js";
import { User } from "../model/user.model.js";
import { buildMeta, getPagination, getSort } from "../utils/queryHelper.js";

export const patientService = {
  createOrUpdateProfile: async ({ userId, payload }) => {
    const user = await User.findById(userId);
    if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");

    if (user.role !== "patient") {
      user.role = "patient";
      await user.save();
    }

    const patient = await Patient.findOneAndUpdate(
      { user: userId },
      {
        dateOfBirth: payload.dateOfBirth || null,
        gender: payload.gender || "prefer_not_to_say",
        bloodGroup: payload.bloodGroup || "",
        emergencyContact: payload.emergencyContact || "",
        address: payload.address || "",
        allergies: payload.allergies || [],
        chronicDiseases: payload.chronicDiseases || [],
      },
      { new: true, upsert: true, runValidators: true },
    ).populate("user", "fullName email phone role");

    return patient;
  },

  getMyProfile: async (userId) => {
    const patient = await Patient.findOne({ user: userId }).populate(
      "user",
      "fullName email phone role",
    );

    if (!patient) throw new AppError(httpStatus.NOT_FOUND, "Patient profile not found");
    return patient;
  },

  addMedicalHistory: async ({ patientId, payload }) => {
    const patient = await Patient.findById(patientId);
    if (!patient) throw new AppError(httpStatus.NOT_FOUND, "Patient not found");

    patient.medicalHistory.push({
      condition: payload.condition,
      diagnosisDate: payload.diagnosisDate || new Date(),
      notes: payload.notes || "",
    });

    await patient.save();
    return patient;
  },

  list: async (query) => {
    const { page, limit, skip } = getPagination(query);
    const sort = getSort(query, "-createdAt");

    const where = {};
    if (query.gender) where.gender = query.gender;
    if (query.bloodGroup) where.bloodGroup = query.bloodGroup;

    const [patients, total] = await Promise.all([
      Patient.find(where)
        .populate("user", "fullName email phone role")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Patient.countDocuments(where),
    ]);

    return { patients, meta: buildMeta(page, limit, total) };
  },

  getById: async (id) => {
    const patient = await Patient.findById(id).populate("user", "fullName email phone role");
    if (!patient) throw new AppError(httpStatus.NOT_FOUND, "Patient not found");
    return patient;
  },
};
