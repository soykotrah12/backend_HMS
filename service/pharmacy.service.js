import httpStatus from "http-status";
import AppError from "../errors/AppError.js";
import { Medicine } from "../model/medicine.model.js";
import { buildMeta, getPagination, getSort } from "../utils/queryHelper.js";

export const pharmacyService = {
  createMedicine: async ({ payload, userId }) => {
    const medicine = await Medicine.create({
      ...payload,
      createdBy: userId,
    });

    return medicine;
  },

  listMedicines: async (query) => {
    const { page, limit, skip } = getPagination(query);
    const sort = getSort(query, "name");

    const where = {};
    if (query.search) where.name = { $regex: query.search, $options: "i" };
    if (query.lowStock === "true") {
      where.$expr = { $lte: ["$stock", "$reorderLevel"] };
    }

    const [medicines, total] = await Promise.all([
      Medicine.find(where)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate("createdBy", "fullName role"),
      Medicine.countDocuments(where),
    ]);

    return { medicines, meta: buildMeta(page, limit, total) };
  },

  getById: async (id) => {
    const medicine = await Medicine.findById(id).populate("createdBy", "fullName role");
    if (!medicine) throw new AppError(httpStatus.NOT_FOUND, "Medicine not found");
    return medicine;
  },

  updateMedicine: async ({ id, payload }) => {
    const medicine = await Medicine.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    if (!medicine) throw new AppError(httpStatus.NOT_FOUND, "Medicine not found");
    return medicine;
  },

  updateStock: async ({ id, delta }) => {
    const medicine = await Medicine.findById(id);
    if (!medicine) throw new AppError(httpStatus.NOT_FOUND, "Medicine not found");

    const updatedStock = medicine.stock + delta;
    if (updatedStock < 0) {
      throw new AppError(httpStatus.BAD_REQUEST, "Insufficient stock");
    }

    medicine.stock = updatedStock;
    await medicine.save();

    return medicine;
  },

  deleteMedicine: async (id) => {
    const medicine = await Medicine.findById(id);
    if (!medicine) throw new AppError(httpStatus.NOT_FOUND, "Medicine not found");

    await Medicine.findByIdAndDelete(id);
    return null;
  },
};
