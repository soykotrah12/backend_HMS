const sanitizeValue = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  if (value && typeof value === "object") {
    const sanitized = {};
    for (const key of Object.keys(value)) {
      if (key.includes("$") || key.includes(".")) continue;
      sanitized[key] = sanitizeValue(value[key]);
    }
    return sanitized;
  }

  if (typeof value === "string") {
    return value.trim().replace(/[<>]/g, "");
  }

  return value;
};

const sanitizeRequest = (req, res, next) => {
  req.body = sanitizeValue(req.body || {});

  if (req.query && typeof req.query === "object") {
    for (const key of Object.keys(req.query)) {
      if (key.includes("$") || key.includes(".")) {
        delete req.query[key];
        continue;
      }
      req.query[key] = sanitizeValue(req.query[key]);
    }
  }

  if (req.params && typeof req.params === "object") {
    for (const key of Object.keys(req.params)) {
      if (key.includes("$") || key.includes(".")) {
        delete req.params[key];
        continue;
      }
      req.params[key] = sanitizeValue(req.params[key]);
    }
  }

  next();
};

export default sanitizeRequest;
