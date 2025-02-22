import express from "express";
import {
  authenticateAdmin,
  authenticateSubAdmin,
  authorizeRoleAdmin,
  authorizeRoleSubAdmin,
} from "../middlewares/auth.js";

import {
  createLoan,
  deductLoan,
  deleteLoan,
  getAllLoans,
  updateLoan,
} from "../controllers/loanController.js";

const loanRouter = express.Router();

loanRouter.post(
  "/add-loan",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  createLoan
);

loanRouter.get(
  "/get-all-loans",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  getAllLoans
);

loanRouter.put(
  "/update/:loanId",
  authenticateSubAdmin,
  authorizeRoleSubAdmin("subAdmin"),
  updateLoan
);

loanRouter.delete(
  "/delete/:loanId",
  authenticateSubAdmin,
  authorizeRoleSubAdmin("subAdmin"),
  deleteLoan
);

loanRouter.post(
  "/deduct/:loanId",
  authenticateSubAdmin,
  authorizeRoleSubAdmin("subAdmin"),
  deductLoan
);

export default loanRouter;
