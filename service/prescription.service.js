import httpStatus from "http-status";
import AppError from "../errors/AppError.js";
import { Appointment } from "../model/appointment.model.js";
import { Doctor } from "../model/doctor.model.js";
import { Prescription } from "../model/prescription.model.js";
import { buildMeta, getPagination, getSort } from "../utils/queryHelper.js";
import { generatePrescriptionPdf } from "../utils/pdfGenerator.js";

export const prescriptionService = {
  create: async ({ payload, user }) => {
    const appointment = await Appointment.findById(payload.appointmentId)
      .populate({ path: "doctor", populate: { path: "user", select: "fullName email" } })
      .populate({ path: "patient", populate: { path: "user", select: "fullName email" } });

    if (!appointment) {
      throw new AppError(httpStatus.NOT_FOUND, "Appointment not found");
    }

    if (!["completed", "confirmed"].includes(appointment.status)) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Prescription can be added only for confirmed/completed appointments",
      );
    }

    const doctor = await Doctor.findOne({ user: user._id });
    if (!doctor) {
      throw new AppError(httpStatus.FORBIDDEN, "Doctor profile not found for current user");
    }

    if (String(appointment.doctor._id) !== String(doctor._id)) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You can only prescribe for your own appointments",
      );
    }

    const existing = await Prescription.findOne({ appointment: appointment._id });
    if (existing) {
      throw new AppError(httpStatus.CONFLICT, "Prescription already exists for this appointment");
    }

    const prescription = await Prescription.create({
      appointment: appointment._id,
      doctor: appointment.doctor._id,
      patient: appointment.patient._id,
      diagnosis: payload.diagnosis || "",
      advice: payload.advice || "",
      medicines: payload.medicines,
    });

    const pdfUrl = await generatePrescriptionPdf({
      prescriptionId: prescription._id,
      doctorName: appointment.doctor.user.fullName,
      patientName: appointment.patient.user.fullName,
      diagnosis: payload.diagnosis,
      advice: payload.advice,
      medicines: payload.medicines,
    });

    prescription.pdfUrl = pdfUrl;
    await prescription.save();

    return Prescription.findById(prescription._id)
      .populate({ path: "doctor", populate: { path: "user", select: "fullName email" } })
      .populate({ path: "patient", populate: { path: "user", select: "fullName email" } })
      .populate("appointment");
  },

  getById: async (id) => {
    const prescription = await Prescription.findById(id)
      .populate({ path: "doctor", populate: { path: "user", select: "fullName email" } })
      .populate({ path: "patient", populate: { path: "user", select: "fullName email" } })
      .populate("appointment");

    if (!prescription) throw new AppError(httpStatus.NOT_FOUND, "Prescription not found");
    return prescription;
  },

  list: async (query) => {
    const { page, limit, skip } = getPagination(query);
    const sort = getSort(query, "-createdAt");

    const where = {};
    if (query.doctorId) where.doctor = query.doctorId;
    if (query.patientId) where.patient = query.patientId;

    const [prescriptions, total] = await Promise.all([
      Prescription.find(where)
        .populate({ path: "doctor", populate: { path: "user", select: "fullName email" } })
        .populate({ path: "patient", populate: { path: "user", select: "fullName email" } })
        .populate("appointment")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Prescription.countDocuments(where),
    ]);

    return { prescriptions, meta: buildMeta(page, limit, total) };
  },
};
