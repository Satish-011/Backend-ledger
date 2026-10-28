const { z } = require("zod");

const accountBalanceParamsSchema = z.object({
  accountId: z
    .string({ required_error: "Account ID is required" })
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid account ID format"),
});

module.exports = { accountBalanceParamsSchema };

