import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync.js";
import sendResponse from "../utils/sendResponse.js";
import { labService } from "../service/lab.service.js";

export const bookLabTest = catchAsync(async (req, res) => {
  const test = await labService.bookTest({
    payload: req.body,
    userId: req.user._id,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Lab test booked",
    data: test,
  });
});

export const listLabTests = catchAsync(async (req, res) => {
  const result = await labService.list(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Lab tests fetched",
    data: result.tests,
    meta: result.meta,
  });
});

export const getLabTestById = catchAsync(async (req, res) => {
  const test = await labService.getById(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Lab test fetched",
    data: test,
  });
});

export const updateLabTestStatus = catchAsync(async (req, res) => {
  const test = await labService.updateStatus({
    id: req.params.id,
    status: req.body.status,
    notes: req.body.notes,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Lab test status updated",
    data: test,
  });
});

export const uploadLabReport = catchAsync(async (req, res) => {
  const test = await labService.uploadReport({
    id: req.params.id,
    file: req.file,
    reportUrl: req.body.reportUrl,
    reportType: req.body.reportType,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Lab report uploaded",
    data: test,
  });
});
