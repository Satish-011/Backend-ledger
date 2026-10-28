const { BadRequestError } = require("../errors");

/**
 * Creates an Express middleware that validates the request against a Zod schema.
 *
 * @param {import("zod").ZodSchema} schema - The Zod schema to validate against.
 * @param {"body" | "params" | "query"} source - Which part of the request to validate.
 * @returns {Function} Express middleware
 */
const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const details = result.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return next(
        new BadRequestError("Validation failed", "VALIDATION_ERROR", details),
      );
    }

    req[source] = result.data;
    return next();
  };
};

module.exports = validate;
