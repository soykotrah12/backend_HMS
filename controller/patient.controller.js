import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync.js";
import sendResponse from "../utils/sendResponse.js";
import { patientService } from "../service/patient.service.js";

export const createOrUpdatePatientProfile = catchAsync(async (req, res) => {
  const userId = req.body.userId || req.user._id;
  const patient = await patientService.createOrUpdateProfile({
    userId,
    payload: req.body,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient profile upserted",
    data: patient,
  });
});

export const getMyPatientProfile = catchAsync(async (req, res) => {
  const patient = await patientService.getMyProfile(req.user._id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient profile fetched",
    data: patient,
  });
});

export const addPatientMedicalHistory = catchAsync(async (req, res) => {
  const patient = await patientService.addMedicalHistory({
    patientId: req.params.id,
    payload: req.body,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Medical history added",
    data: patient,
  });
});

export const getPatientById = catchAsync(async (req, res) => {
  const patient = await patientService.getById(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient fetched",
    data: patient,
  });
});

export const listPatients = catchAsync(async (req, res) => {
  const result = await patientService.list(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patients fetched",
    data: result.patients,
    meta: result.meta,
  });
});
