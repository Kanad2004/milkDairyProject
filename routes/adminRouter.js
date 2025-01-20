import express from "express"
import { login , logoutAdmin } from "../controllers/adminController.js";

const adminRouter = express.Router();

//!Login
adminRouter.post("/api/v1/admin/login", login);

//!
adminRouter.post("/api/v1/admin/logout", logoutAdmin);

export default adminRouter;
