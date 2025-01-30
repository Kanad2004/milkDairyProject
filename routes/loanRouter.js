import express from 'express';
import { createLoan, getAllLoans, getLoanById, updateLoan } from '../controllers/loanController.js';
import {authenticateSubAdmin,authenticateAdmin, authorizeRoleAdmin, authorizeRoleSubAdmin} from '../middlewares/auth.js';
import { generateLoanReport, generateLoanReportByFarmerId } from '../controllers/loanController.js';
const loanRouter = express.Router();


// Routes
loanRouter.post('/create-loan', authenticateSubAdmin, authorizeRoleSubAdmin(['subAdmin']), createLoan);
loanRouter.get('/get-all-loans',authenticateSubAdmin, authorizeRoleSubAdmin(['subAdmin']),  getAllLoans);
loanRouter.get('/get-loan/:loanId', authenticateSubAdmin, authorizeRoleSubAdmin(['subAdmin']), getLoanById);
loanRouter.put('/update-loan/:loanId',authenticateSubAdmin, authorizeRoleSubAdmin(['subAdmin']),  updateLoan);


//Routes for Admin
loanRouter.get('/get-all-loans',authenticateAdmin, authorizeRoleAdmin(['Admin']),  getAllLoans);
loanRouter.get('/get-loan/:loanId', authenticateAdmin, authorizeRoleAdmin(['Admin']), getLoanById);
// Route to generate loan report for all farmers
loanRouter.get("/loans/report",authenticateAdmin, authorizeRoleAdmin(['Admin']), generateLoanReport);

// Route to generate loan report by farmer ID
loanRouter.get("/loans/report/:farmerId",authenticateAdmin, authorizeRoleAdmin(['Admin']), generateLoanReportByFarmerId);

export default loanRouter;