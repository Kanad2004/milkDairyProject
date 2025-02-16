import express from 'express';
import { createLoan, getAllLoans, getLoanByMobileNumber, updateLoan } from '../controllers/loanController.js';
import {authenticateSubAdmin,authenticateAdmin, authorizeRoleAdmin, authorizeRoleSubAdmin} from '../middlewares/auth.js';
import { generateLoanReport, generateLoanReportByMobileNumber } from '../controllers/loanController.js';
const loanRouter = express.Router();


// Routes
loanRouter.post('/create-loan', authenticateSubAdmin, authorizeRoleSubAdmin(['subAdmin']), createLoan);
loanRouter.get('/get-all-loans',authenticateSubAdmin, authorizeRoleSubAdmin(['subAdmin']),  getAllLoans);
loanRouter.get('/get-loan/:mobileNumber', authenticateSubAdmin, authorizeRoleSubAdmin(['subAdmin']), getLoanByMobileNumber);
loanRouter.put('/update-loan/:mobileNumber',authenticateSubAdmin, authorizeRoleSubAdmin(['subAdmin']),  updateLoan);


//Routes for Admin
loanRouter.get('/get-all-loans',authenticateAdmin, authorizeRoleAdmin(['Admin']),  getAllLoans);
loanRouter.get('/get-loan/:mobileNumber', authenticateAdmin, authorizeRoleAdmin(['Admin']), getLoanByMobileNumber);


// Route to generate loan report for all farmers
loanRouter.get("/loans/report",authenticateAdmin, authorizeRoleAdmin(['Admin']), generateLoanReport);
// Route to generate loan report by farmer mobile number
loanRouter.get("/loans/report/:mobileNumber",authenticateAdmin, authorizeRoleAdmin(['Admin']), generateLoanReportByMobileNumber);

export default loanRouter;