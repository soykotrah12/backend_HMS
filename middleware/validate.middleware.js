import httpStatus from "http-status";
import AppError from "../errors/AppError.js";

const validateRequest = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true,
  });

  if (error) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      error.details.map((item) => item.message).join(", "),
    );
  }

  req.body = value;
  next();
};

export default validateRequest;
