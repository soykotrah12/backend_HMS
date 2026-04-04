import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync.js";
import sendResponse from "../utils/sendResponse.js";
import { pharmacyService } from "../service/pharmacy.service.js";

export const createMedicine = catchAsync(async (req, res) => {
  const medicine = await pharmacyService.createMedicine({
    payload: req.body,
    userId: req.user._id,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Medicine created",
    data: medicine,
  });
});

export const listMedicines = catchAsync(async (req, res) => {
  const result = await pharmacyService.listMedicines(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Medicines fetched",
    data: result.medicines,
    meta: result.meta,
  });
});

export const getMedicineById = catchAsync(async (req, res) => {
  const medicine = await pharmacyService.getById(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Medicine fetched",
    data: medicine,
  });
});

export const updateMedicine = catchAsync(async (req, res) => {
  const medicine = await pharmacyService.updateMedicine({
    id: req.params.id,
    payload: req.body,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Medicine updated",
    data: medicine,
  });
});

export const updateMedicineStock = catchAsync(async (req, res) => {
  const medicine = await pharmacyService.updateStock({
    id: req.params.id,
    delta: req.body.delta,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Medicine stock updated",
    data: medicine,
  });
});

export const deleteMedicine = catchAsync(async (req, res) => {
  await pharmacyService.deleteMedicine(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Medicine deleted",
    data: null,
  });
});
