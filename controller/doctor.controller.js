import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync.js";
import sendResponse from "../utils/sendResponse.js";
import { doctorService } from "../service/doctor.service.js";

export const createOrUpdateDoctorProfile = catchAsync(async (req, res) => {
  const userId = req.body.userId || req.user._id;
  const doctor = await doctorService.createOrUpdateProfile({
    userId,
    payload: req.body,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Doctor profile upserted",
    data: doctor,
  });
});

export const setDoctorAvailability = catchAsync(async (req, res) => {
  const doctorId = req.params.id;
  const doctor = await doctorService.setAvailability({
    doctorId,
    availability: req.body.availability,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Doctor availability updated",
    data: doctor,
  });
});

export const getMyDoctorProfile = catchAsync(async (req, res) => {
  const doctor = await doctorService.getMyProfile(req.user._id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Doctor profile fetched",
    data: doctor,
  });
});

export const getDoctorById = catchAsync(async (req, res) => {
  const doctor = await doctorService.getById(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Doctor fetched",
    data: doctor,
  });
});

export const listDoctors = catchAsync(async (req, res) => {
  const result = await doctorService.list(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Doctors fetched",
    data: result.doctors,
    meta: result.meta,
  });
});
