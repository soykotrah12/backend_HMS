import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync.js";
import sendResponse from "../utils/sendResponse.js";
import { appointmentService } from "../service/appointment.service.js";

export const bookAppointment = catchAsync(async (req, res) => {
  const appointment = await appointmentService.book({
    payload: req.body,
    userId: req.user._id,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Appointment booked successfully",
    data: appointment,
  });
});

export const listAppointments = catchAsync(async (req, res) => {
  const result = await appointmentService.list(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Appointments fetched",
    data: result.appointments,
    meta: result.meta,
  });
});

export const getAppointmentById = catchAsync(async (req, res) => {
  const appointment = await appointmentService.getById(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Appointment fetched",
    data: appointment,
  });
});

export const updateAppointmentStatus = catchAsync(async (req, res) => {
  const appointment = await appointmentService.updateStatus({
    id: req.params.id,
    status: req.body.status,
    notes: req.body.notes,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Appointment status updated",
    data: appointment,
  });
});
