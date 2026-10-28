const { ZodError } = require("zod");

/**
 * Creates an Express middleware that validates the request against a Zod schema.
 *
 * @param {import("zod").ZodSchema} schema - The Zod schema to validate against.
 * @param {"body" | "params" | "query"} source - Which part of the request to validate.
 * @returns {Function} Express middleware
 *
 * @example
 *   router.post("/register", validate(registerSchema), controller.register);
 *   router.get("/balance/:accountId", validate(paramsSchema, "params"), controller.balance);
 */
const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return res.status(400).json({
        message: "Validation failed",
        errors,
      });
    }

    // Replace with parsed (and coerced) data
    req[source] = result.data;
    return next();
  };
};

module.exports = validate;

