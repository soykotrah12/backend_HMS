import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync.js";
import sendResponse from "../utils/sendResponse.js";
import { invoiceService } from "../service/invoice.service.js";

export const createInvoice = catchAsync(async (req, res) => {
  const invoice = await invoiceService.createInvoice({
    payload: req.body,
    userId: req.user._id,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Invoice generated",
    data: invoice,
  });
});

export const addInvoicePayment = catchAsync(async (req, res) => {
  const invoice = await invoiceService.addPayment({
    invoiceId: req.params.id,
    payload: req.body,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment added successfully",
    data: invoice,
  });
});

export const listInvoices = catchAsync(async (req, res) => {
  const result = await invoiceService.listInvoices(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Invoices fetched",
    data: result.invoices,
    meta: result.meta,
  });
});

export const getInvoiceById = catchAsync(async (req, res) => {
  const invoice = await invoiceService.getById(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Invoice fetched",
    data: invoice,
  });
});
