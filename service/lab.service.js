import path from "path";
import httpStatus from "http-status";
import AppError from "../errors/AppError.js";
import { Appointment } from "../model/appointment.model.js";
import { Doctor } from "../model/doctor.model.js";
import { LabTest } from "../model/labTest.model.js";
import { Patient } from "../model/patient.model.js";
import { buildMeta, getPagination, getSort } from "../utils/queryHelper.js";
import { uploadFileWithFallback } from "../utils/fileStorage.js";

const getReportTypeFromMime = (mime) => {
  if (!mime) return "none";
  if (mime.includes("pdf")) return "pdf";
  if (mime.includes("image")) return "image";
  return "none";
};

export const labService = {
  bookTest: async ({ payload, userId }) => {
    const patient = await Patient.findById(payload.patientId);
    if (!patient) throw new AppError(httpStatus.NOT_FOUND, "Patient not found");

    if (payload.doctorId) {
      const doctor = await Doctor.findById(payload.doctorId);
      if (!doctor) throw new AppError(httpStatus.NOT_FOUND, "Doctor not found");
    }

    if (payload.appointmentId) {
      const appointment = await Appointment.findById(payload.appointmentId);
      if (!appointment) {
        throw new AppError(httpStatus.NOT_FOUND, "Appointment not found");
      }
    }

    const lab = await LabTest.create({
      patient: payload.patientId,
      doctor: payload.doctorId || null,
      appointment: payload.appointmentId || null,
      testName: payload.testName,
      testDate: new Date(payload.testDate),
      notes: payload.notes || "",
      bookedBy: userId,
      status: "booked",
    });

    return LabTest.findById(lab._id)
      .populate({ path: "patient", populate: { path: "user", select: "fullName email" } })
      .populate({ path: "doctor", populate: { path: "user", select: "fullName email" } })
      .populate("appointment");
  },

  list: async (query) => {
    const { page, limit, skip } = getPagination(query);
    const sort = getSort(query, "-testDate");

    const where = {};
    if (query.status) where.status = query.status;
    if (query.patientId) where.patient = query.patientId;
    if (query.doctorId) where.doctor = query.doctorId;

    const [tests, total] = await Promise.all([
      LabTest.find(where)
        .populate({ path: "patient", populate: { path: "user", select: "fullName email" } })
        .populate({ path: "doctor", populate: { path: "user", select: "fullName email" } })
        .populate("appointment")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      LabTest.countDocuments(where),
    ]);

    return { tests, meta: buildMeta(page, limit, total) };
  },

  getById: async (id) => {
    const test = await LabTest.findById(id)
      .populate({ path: "patient", populate: { path: "user", select: "fullName email" } })
      .populate({ path: "doctor", populate: { path: "user", select: "fullName email" } })
      .populate("appointment");

    if (!test) throw new AppError(httpStatus.NOT_FOUND, "Lab test not found");
    return test;
  },

  updateStatus: async ({ id, status, notes }) => {
    const test = await LabTest.findById(id);
    if (!test) throw new AppError(httpStatus.NOT_FOUND, "Lab test not found");

    test.status = status;
    if (typeof notes !== "undefined") test.notes = notes;
    await test.save();

    return LabTest.findById(id);
  },

  uploadReport: async ({ id, file, reportUrl, reportType }) => {
    const test = await LabTest.findById(id);
    if (!test) throw new AppError(httpStatus.NOT_FOUND, "Lab test not found");

    if (file?.buffer) {
      const ext = path.extname(file.originalname) || ".bin";
      const filename = `lab-report-${id}-${Date.now()}${ext}`;
      const uploaded = await uploadFileWithFallback({
        buffer: file.buffer,
        folder: "reports",
        filename,
        resourceType: getReportTypeFromMime(file.mimetype) === "image" ? "image" : "raw",
      });

      test.reportUrl = uploaded;
      test.reportType = getReportTypeFromMime(file.mimetype);
    } else if (reportUrl) {
      test.reportUrl = reportUrl;
      test.reportType = reportType || "url";
    } else {
      throw new AppError(httpStatus.BAD_REQUEST, "File or reportUrl is required");
    }

    if (test.status !== "cancelled") {
      test.status = "completed";
    }

    await test.save();
    return test;
  },
};
