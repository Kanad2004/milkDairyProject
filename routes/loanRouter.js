import express from 'express';
import { createLoan, getAllLoans, getLoanById, updateLoan } from '../controllers/loanController.js';
import {authenticateSubAdmin, authorizeRoleSubAdmin} from '../middlewares/auth.js';

const loanRouter = express.Router();


// Routes
loanRouter.post('/create-loan', authenticateSubAdmin, authorizeRoleSubAdmin(['subAdmin']), createLoan);
loanRouter.get('/get-all-loans',authenticateSubAdmin, authorizeRoleSubAdmin(['subAdmin']),  getAllLoans);
loanRouter.get('/get-loan/:loanId', authenticateSubAdmin, authorizeRoleSubAdmin(['subAdmin']), getLoanById);
loanRouter.put('/update-loan/:loanId',authenticateSubAdmin, authorizeRoleSubAdmin(['subAdmin']),  updateLoan);


//Routes for Admin
loanRouter.get('/get-all-loans',authenticateSubAdmin, authorizeRoleSubAdmin(['Admin']),  getAllLoans);
loanRouter.get('/get-loan/:loanId', authenticateSubAdmin, authorizeRoleSubAdmin(['Admin']), getLoanById);

export default loanRouter;