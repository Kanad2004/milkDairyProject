import express from "express";
import {
  deleteTransactionById,
  getAllTransactions,
  saveTransaction,
  updateTransactionById,
} from "../controllers/transactionController.js";
import {
  authenticateAdmin,
  authenticateSubAdmin,
  authorizeRoleAdmin,
  authorizeRoleSubAdmin,
} from "../middlewares/auth.js";

const transactionRouter = express.Router();

transactionRouter.post(
  "/save-transaction",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  saveTransaction
);

transactionRouter.get(
  "/get-all-transactions",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  getAllTransactions
);

transactionRouter.patch(
  "/update-transaction/:id",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  updateTransactionById
);

transactionRouter.delete(
  "/delete-transaction/:id",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  deleteTransactionById
);

export default transactionRouter;
