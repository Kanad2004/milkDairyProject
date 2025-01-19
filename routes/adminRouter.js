import express from "express"
const { login, logoutAdmin } = require("../controllers/adminController");

const adminRouter = express.Router();

//!Login
adminRouter.post("/api/v1/admin/login", login);

//!
adminRouter.post("/api/v1/admin/logout", logoutAdmin);

export default adminRouter;
