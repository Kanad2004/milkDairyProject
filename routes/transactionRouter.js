import express from "express";
import {
  deleteTransactionById,
  getAllTransactions,
  saveTransaction,
  updateTransactionById,
  generateReport,
  generateCombinedReport,
  getTransactionByMobileNumber,
  generateReportAdmin,
  generateFarmerReport
} from "../controllers/transactionController.js";

import { farmerTransaction, downloadAllFarmersPDF } from "../controllers/farmerTrasactionController.js";

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

transactionRouter.get(
  "/subAdmin/customer-reports/:mobileNumber",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  getTransactionByMobileNumber
);

//subadmin
transactionRouter.get(
  "/subAdmin/customer-reports-by-type/:type",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  generateReport
);

//admin
transactionRouter.get(
  "/admin/customer-reports/:branchId/:type",
  authenticateAdmin,
  authorizeRoleAdmin(["Admin"]),
  generateReportAdmin
);

// transactionRouter.get(
//   "/admin/customer-reports/all",
//   authenticateAdmin,
//   authorizeRoleAdmin(["Admin"]),
//   generateCombinedReport
// );

import fs from "fs";
transactionRouter.get("/download-report/:mobile",  async (req, res) => {
  try {
    const { excelPath } = await generateFarmerReport(req.params.mobile);

  res.download(excelPath, "report.xlsx", (err) => {
    if (!err) fs.unlinkSync(excelPath); // optional cleanup
  });
  } catch (e) {
    res.status(500).send(e.message);
  }
} );

// For Excel
// import fs from "fs";
// transactionRouter.get("/report/excel/:mobile", async (req, res) => {
//   try {
//     const { excelPath } = await generateFarmerReport(req.params.mobile);
//     res.download(excelPath, "report.xlsx", (err) => {
//       if (!err) fs.unlinkSync(excelPath); // optional cleanup
//     });
//   } catch (e) {
//     res.status(500).send("Failed to generate Excel: " + e.message);
//   }
// });

// // For PDF
// transactionRouter.get("/report/pdf/:mobile", async (req, res) => {
//   try {
//     const { pdfPath } = await generateFarmerReport(req.params.mobile);

//     res.download(pdfPath, "report.pdf", (err) => {
//       if (!err) fs.unlinkSync(pdfPath); // optional cleanup
//     });
//   } catch (e) {
//     res.status(500).send("Failed to generate PDF: " + e.message);
//   }
// });


transactionRouter.get(
  "/download-pdf/:mobileNumber",

  farmerTransaction
);

transactionRouter.get(
  "/download-all-farmers-pdf",
  downloadAllFarmersPDF
);


export default transactionRouter;
