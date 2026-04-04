import httpStatus from "http-status";
import AppError from "../errors/AppError.js";
import { Appointment } from "../model/appointment.model.js";
import { Doctor } from "../model/doctor.model.js";
import { Patient } from "../model/patient.model.js";
import { buildMeta, getPagination, getSort } from "../utils/queryHelper.js";

const toMinutes = (time) => {
  const [h, m] = String(time).split(":").map((v) => parseInt(v, 10));
  return h * 60 + m;
};

const validateSlotInsideAvailability = (doctor, date, startTime, endTime) => {
  const dayNames = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  const day = dayNames[new Date(date).getDay()];
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);

  if (start >= end) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid time slot");
  }

  const available = doctor.availability.some((slot) => {
    if (!slot.isAvailable || slot.dayOfWeek !== day) return false;
    const slotStart = toMinutes(slot.startTime);
    const slotEnd = toMinutes(slot.endTime);
    return start >= slotStart && end <= slotEnd;
  });

  if (!available) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Doctor is not available in selected time slot",
    );
  }
};

const validateSlotConflict = async (doctorId, date, startTime, endTime, appointmentId) => {
  const query = {
    doctor: doctorId,
    appointmentDate: new Date(date),
    status: { $in: ["pending", "confirmed", "completed"] },
  };

  if (appointmentId) query._id = { $ne: appointmentId };

  const existing = await Appointment.find(query).select("startTime endTime");

  const newStart = toMinutes(startTime);
  const newEnd = toMinutes(endTime);

  const hasConflict = existing.some((item) => {
    const currentStart = toMinutes(item.startTime);
    const currentEnd = toMinutes(item.endTime);
    return newStart < currentEnd && currentStart < newEnd;
  });

  if (hasConflict) {
    throw new AppError(httpStatus.CONFLICT, "Selected slot is already booked");
  }
};

export const appointmentService = {
  book: async ({ payload, userId }) => {
    const doctor = await Doctor.findById(payload.doctorId);
    if (!doctor) throw new AppError(httpStatus.NOT_FOUND, "Doctor not found");

    const patient = await Patient.findById(payload.patientId);
    if (!patient) throw new AppError(httpStatus.NOT_FOUND, "Patient not found");

    validateSlotInsideAvailability(
      doctor,
      payload.appointmentDate,
      payload.startTime,
      payload.endTime,
    );

    await validateSlotConflict(
      doctor._id,
      payload.appointmentDate,
      payload.startTime,
      payload.endTime,
    );

    const appointment = await Appointment.create({
      doctor: doctor._id,
      patient: patient._id,
      appointmentDate: new Date(payload.appointmentDate),
      startTime: payload.startTime,
      endTime: payload.endTime,
      reason: payload.reason || "",
      notes: payload.notes || "",
      bookedBy: userId,
      status: "pending",
    });

    return Appointment.findById(appointment._id)
      .populate({ path: "doctor", populate: { path: "user", select: "fullName email" } })
      .populate({ path: "patient", populate: { path: "user", select: "fullName email" } })
      .populate("bookedBy", "fullName email role");
  },

  list: async (query) => {
    const { page, limit, skip } = getPagination(query);
    const sort = getSort(query, "-appointmentDate");

    const where = {};
    if (query.status) where.status = query.status;
    if (query.doctorId) where.doctor = query.doctorId;
    if (query.patientId) where.patient = query.patientId;

    if (query.dateFrom || query.dateTo) {
      where.appointmentDate = {};
      if (query.dateFrom) where.appointmentDate.$gte = new Date(query.dateFrom);
      if (query.dateTo) where.appointmentDate.$lte = new Date(query.dateTo);
    }

    const [appointments, total] = await Promise.all([
      Appointment.find(where)
        .populate({ path: "doctor", populate: { path: "user", select: "fullName email" } })
        .populate({ path: "patient", populate: { path: "user", select: "fullName email" } })
        .populate("bookedBy", "fullName email role")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Appointment.countDocuments(where),
    ]);

    return { appointments, meta: buildMeta(page, limit, total) };
  },

  getById: async (id) => {
    const appointment = await Appointment.findById(id)
      .populate({ path: "doctor", populate: { path: "user", select: "fullName email" } })
      .populate({ path: "patient", populate: { path: "user", select: "fullName email" } })
      .populate("bookedBy", "fullName email role");

    if (!appointment) throw new AppError(httpStatus.NOT_FOUND, "Appointment not found");
    return appointment;
  },

  updateStatus: async ({ id, status, notes }) => {
    const appointment = await Appointment.findById(id);
    if (!appointment) throw new AppError(httpStatus.NOT_FOUND, "Appointment not found");

    appointment.status = status;
    if (typeof notes !== "undefined") appointment.notes = notes;

    await appointment.save();

    return Appointment.findById(id)
      .populate({ path: "doctor", populate: { path: "user", select: "fullName email" } })
      .populate({ path: "patient", populate: { path: "user", select: "fullName email" } });
  },
};
