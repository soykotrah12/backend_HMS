import httpStatus from "http-status";
import AppError from "../errors/AppError.js";
import { Appointment } from "../model/appointment.model.js";
import { Invoice } from "../model/invoice.model.js";
import { Patient } from "../model/patient.model.js";
import { uniqueTransactionId } from "../utils/commonMethod.js";
import { buildMeta, getPagination, getSort } from "../utils/queryHelper.js";

const calculateTotals = ({ items, tax = 0, discount = 0 }) => {
  const subtotal = items.reduce((sum, item) => sum + item.amount * item.quantity, 0);
  const total = Math.max(subtotal + tax - discount, 0);

  return { subtotal, total };
};

const getPaymentStatus = (paidAmount, total) => {
  if (paidAmount <= 0) return "unpaid";
  if (paidAmount >= total) return "paid";
  return "partially_paid";
};

export const invoiceService = {
  createInvoice: async ({ payload, userId }) => {
    const patient = await Patient.findById(payload.patientId);
    if (!patient) throw new AppError(httpStatus.NOT_FOUND, "Patient not found");

    if (payload.appointmentId) {
      const appointment = await Appointment.findById(payload.appointmentId);
      if (!appointment) {
        throw new AppError(httpStatus.NOT_FOUND, "Appointment not found");
      }
    }

    const totals = calculateTotals({
      items: payload.items,
      tax: payload.tax || 0,
      discount: payload.discount || 0,
    });

    const invoice = await Invoice.create({
      invoiceNo: `INV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      patient: payload.patientId,
      appointment: payload.appointmentId || null,
      items: payload.items,
      tax: payload.tax || 0,
      discount: payload.discount || 0,
      subtotal: totals.subtotal,
      total: totals.total,
      paidAmount: 0,
      status: "unpaid",
      createdBy: userId,
    });

    return Invoice.findById(invoice._id)
      .populate({ path: "patient", populate: { path: "user", select: "fullName email" } })
      .populate("appointment")
      .populate("createdBy", "fullName email role");
  },

  addPayment: async ({ invoiceId, payload }) => {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) throw new AppError(httpStatus.NOT_FOUND, "Invoice not found");

    if (invoice.status === "cancelled") {
      throw new AppError(httpStatus.BAD_REQUEST, "Cancelled invoice cannot accept payment");
    }

    const transactionId = payload.transactionId || uniqueTransactionId();
    invoice.payments.push({
      amount: payload.amount,
      method: payload.method || "cash",
      transactionId,
      notes: payload.notes || "",
      paidAt: new Date(),
    });

    invoice.paidAmount = Number(invoice.paidAmount || 0) + Number(payload.amount);
    invoice.status = getPaymentStatus(invoice.paidAmount, invoice.total);
    await invoice.save();

    return invoice;
  },

  listInvoices: async (query) => {
    const { page, limit, skip } = getPagination(query);
    const sort = getSort(query, "-createdAt");

    const where = {};
    if (query.status) where.status = query.status;
    if (query.patientId) where.patient = query.patientId;

    const [invoices, total] = await Promise.all([
      Invoice.find(where)
        .populate({ path: "patient", populate: { path: "user", select: "fullName email" } })
        .populate("appointment")
        .populate("createdBy", "fullName email role")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Invoice.countDocuments(where),
    ]);

    return { invoices, meta: buildMeta(page, limit, total) };
  },

  getById: async (id) => {
    const invoice = await Invoice.findById(id)
      .populate({ path: "patient", populate: { path: "user", select: "fullName email" } })
      .populate("appointment")
      .populate("createdBy", "fullName email role");

    if (!invoice) throw new AppError(httpStatus.NOT_FOUND, "Invoice not found");
    return invoice;
  },
};
