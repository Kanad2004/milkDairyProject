import express from "express";
import { generateFarmerReport } from "../controllers/farmerReportController.js";

const router = express.Router();

// Route to generate Excel report
router.get("/farmer-reports/:type", generateFarmerReport);

export default router;
