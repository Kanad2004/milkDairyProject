import express from "express";
import { generateReport } from "../controllers/transactionController.js";

const router = express.Router();

router.get("/customer-reports/:type", generateReport);



export default router;
