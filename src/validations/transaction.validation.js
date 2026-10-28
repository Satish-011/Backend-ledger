const { z } = require("zod");

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format");

const createTransactionSchema = z.object({
  fromAccount: objectId.describe("Sender account ID"),
  toAccount: objectId.describe("Receiver account ID"),
  amount: z
    .number({ required_error: "Amount is required" })
    .positive("Amount must be a positive number"),
  idempotencyKey: z
    .string({ required_error: "Idempotency key is required" })
    .min(1, "Idempotency key cannot be empty"),
});

const initialFundsSchema = z.object({
  toAccount: objectId.describe("Receiver account ID"),
  amount: z
    .number({ required_error: "Amount is required" })
    .positive("Amount must be a positive number"),
  idempotencyKey: z
    .string({ required_error: "Idempotency key is required" })
    .min(1, "Idempotency key cannot be empty"),
});

module.exports = { createTransactionSchema, initialFundsSchema };

