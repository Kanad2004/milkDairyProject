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
  // generateLoanReportByMobileNumber 
  generateLoanPDFByFarmerIdWithDateRange
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
// loanRouter.get("/adimin/loans/report/:mobileNumber",authenticateAdmin, authorizeRoleAdmin(['Admin']), generateLoanReportByMobileNumber);


// Route to generate loan report for all farmers
loanRouter.get("/subAdmin/loans/report/:start/:end",authenticateSubAdmin, authorizeRoleSubAdmin(['subAdmin']), generateLoanReportSubAdmin);

// Route to generate loan report by farmer ID
loanRouter.get("/subAdmin/loans/report/:farmerId/:start/:end",authenticateSubAdmin, authorizeRoleSubAdmin(['subAdmin']), generateLoanPDFByFarmerIdWithDateRange);

export default loanRouter;
