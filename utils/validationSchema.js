import Joi from "joi";

const objectId = Joi.string().hex().length(24);

const roleEnum = [
  "superAdmin",
  "hospitalAdmin",
  "doctor",
  "patient",
  "receptionist",
  "pharmacist",
  "labTechnician",
  "admin",
  "fisherman",
  "spotOwner",
];

export const authValidation = {
  register: Joi.object({
    fullName: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
    role: Joi.string()
      .valid(...roleEnum)
      .default("patient"),
    phone: Joi.string().allow(""),
    hospitalName: Joi.string().allow(""),
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
  forgotPassword: Joi.object({
    email: Joi.string().email().required(),
  }),
  resetPassword: Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
  }),
  verifyOtp: Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().required(),
  }),
  changePassword: Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required(),
  }),
  refreshToken: Joi.object({
    refreshToken: Joi.string().required(),
  }),
};

export const userValidation = {
  updateProfile: Joi.object({
    fullName: Joi.string().min(2).max(100),
    phone: Joi.string().allow(""),
    bio: Joi.string().max(500).allow(""),
  }),
  updateRole: Joi.object({
    role: Joi.string()
      .valid(...roleEnum)
      .required(),
  }),
};

export const doctorValidation = {
  createOrUpdate: Joi.object({
    userId: objectId.optional(),
    specialization: Joi.string().required(),
    registrationNumber: Joi.string().required(),
    qualification: Joi.string().allow(""),
    experienceYears: Joi.number().min(0),
    consultationFee: Joi.number().min(0),
  }),
  setAvailability: Joi.object({
    availability: Joi.array()
      .items(
        Joi.object({
          dayOfWeek: Joi.string()
            .valid(
              "sunday",
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
              "saturday",
            )
            .required(),
          startTime: Joi.string().required(),
          endTime: Joi.string().required(),
          isAvailable: Joi.boolean(),
        }),
      )
      .min(1)
      .required(),
  }),
};

export const patientValidation = {
  createOrUpdate: Joi.object({
    userId: objectId.optional(),
    dateOfBirth: Joi.date().allow(null),
    gender: Joi.string().valid("male", "female", "other", "prefer_not_to_say"),
    bloodGroup: Joi.string().allow(""),
    emergencyContact: Joi.string().allow(""),
    address: Joi.string().allow(""),
    allergies: Joi.array().items(Joi.string()),
    chronicDiseases: Joi.array().items(Joi.string()),
  }),
  addHistory: Joi.object({
    condition: Joi.string().required(),
    diagnosisDate: Joi.date(),
    notes: Joi.string().allow(""),
  }),
};

export const appointmentValidation = {
  book: Joi.object({
    doctorId: objectId.required(),
    patientId: objectId.required(),
    appointmentDate: Joi.date().required(),
    startTime: Joi.string().required(),
    endTime: Joi.string().required(),
    reason: Joi.string().allow(""),
    notes: Joi.string().allow(""),
  }),
  updateStatus: Joi.object({
    status: Joi.string().valid("pending", "confirmed", "cancelled", "completed").required(),
    notes: Joi.string().allow(""),
  }),
};

export const prescriptionValidation = {
  create: Joi.object({
    appointmentId: objectId.required(),
    diagnosis: Joi.string().allow(""),
    advice: Joi.string().allow(""),
    medicines: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required(),
          dosage: Joi.string().required(),
          frequency: Joi.string().required(),
          duration: Joi.string().required(),
          notes: Joi.string().allow(""),
        }),
      )
      .min(1)
      .required(),
  }),
};

export const medicineValidation = {
  create: Joi.object({
    name: Joi.string().required(),
    genericName: Joi.string().allow(""),
    manufacturer: Joi.string().allow(""),
    batchNo: Joi.string().required(),
    expiryDate: Joi.date().required(),
    price: Joi.number().min(0).required(),
    stock: Joi.number().integer().min(0).default(0),
    reorderLevel: Joi.number().integer().min(0).default(10),
    description: Joi.string().allow(""),
  }),
  updateStock: Joi.object({
    delta: Joi.number().integer().required(),
  }),
};

export const labValidation = {
  book: Joi.object({
    patientId: objectId.required(),
    doctorId: objectId.allow(null, ""),
    appointmentId: objectId.allow(null, ""),
    testName: Joi.string().required(),
    testDate: Joi.date().required(),
    notes: Joi.string().allow(""),
  }),
  updateStatus: Joi.object({
    status: Joi.string().valid("booked", "in_progress", "completed", "cancelled").required(),
    notes: Joi.string().allow(""),
  }),
  updateReportByUrl: Joi.object({
    reportUrl: Joi.string().uri().required(),
    reportType: Joi.string().valid("pdf", "image", "url").default("url"),
  }),
};

export const invoiceValidation = {
  create: Joi.object({
    patientId: objectId.required(),
    appointmentId: objectId.allow(null, ""),
    items: Joi.array()
      .items(
        Joi.object({
          title: Joi.string().required(),
          description: Joi.string().allow(""),
          quantity: Joi.number().integer().min(1).default(1),
          amount: Joi.number().min(0).required(),
        }),
      )
      .min(1)
      .required(),
    tax: Joi.number().min(0).default(0),
    discount: Joi.number().min(0).default(0),
  }),
  addPayment: Joi.object({
    amount: Joi.number().min(0.01).required(),
    method: Joi.string().valid("cash", "card", "mobile_banking", "bank_transfer", "other"),
    transactionId: Joi.string().allow(""),
    notes: Joi.string().allow(""),
  }),
};

export const notificationValidation = {
  create: Joi.object({
    userId: objectId.required(),
    title: Joi.string().required(),
    message: Joi.string().required(),
    type: Joi.string().valid("general", "appointment", "billing", "lab", "prescription"),
    metadata: Joi.object().unknown(true),
  }),
};
