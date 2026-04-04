import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync.js";
import sendResponse from "../utils/sendResponse.js";
import { prescriptionService } from "../service/prescription.service.js";

export const createPrescription = catchAsync(async (req, res) => {
  const prescription = await prescriptionService.create({
    payload: req.body,
    user: req.user,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Prescription created",
    data: prescription,
  });
});

export const listPrescriptions = catchAsync(async (req, res) => {
  const result = await prescriptionService.list(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Prescriptions fetched",
    data: result.prescriptions,
    meta: result.meta,
  });
});

export const getPrescriptionById = catchAsync(async (req, res) => {
  const prescription = await prescriptionService.getById(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Prescription fetched",
    data: prescription,
  });
});
