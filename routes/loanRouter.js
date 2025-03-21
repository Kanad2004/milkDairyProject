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
  generateLoanReportAdmin,
  generateLoanReportSubAdmin,
  generateLoanReportByMobileNumber
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
  authorizeRoleSubAdmin(["subAdmin"]),
  updateLoan
);

loanRouter.delete(
  "/delete/:loanId",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  deleteLoan
);

loanRouter.post(
  "/deduct/:loanId",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  deductLoan
);



// Route to generate loan report for all farmers
loanRouter.get("/admin/loans/report",authenticateAdmin, authorizeRoleAdmin(['Admin']), generateLoanReportAdmin);
// Route to generate loan report by farmer mobile number
loanRouter.get("/adimin/loans/report/:mobileNumber",authenticateAdmin, authorizeRoleAdmin(['Admin']), generateLoanReportByMobileNumber);


// Route to generate loan report for all farmers
loanRouter.get("/subAdmin/loans/report",authenticateSubAdmin, authorizeRoleSubAdmin(['subAdmin']), generateLoanReportSubAdmin);

// Route to generate loan report by farmer mobile number
loanRouter.get("/subAdmin/loans/report/:mobileNumber",authenticateSubAdmin, authorizeRoleSubAdmin(['subAdmin']), generateLoanReportByMobileNumber);

export default loanRouter;
