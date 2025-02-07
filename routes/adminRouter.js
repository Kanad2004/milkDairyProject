import express from "express";
import {
  login,
  logoutAdmin,
  addAdmin,
} from "../controllers/adminController.js";
<<<<<<< HEAD
import { authenticateAdmin, authorizeRoleAdmin } from "../middleware/auth.js";
=======
import { authenticateAdmin, authorizeRoleAdmin } from "../middlewares/auth.js";
>>>>>>> 14a5353bd279100d6e5c27cb46140631f278c929

const adminRouter = express.Router();

//!This is done
adminRouter.post("/addAdmin", addAdmin);
<<<<<<< HEAD
adminRouter.post("/login", login);
adminRouter.post("/logout", authenticateAdmin, authorizeRoleAdmin(['Admin']), logoutAdmin);
=======
>>>>>>> 14a5353bd279100d6e5c27cb46140631f278c929

//!This is done
adminRouter.post("/login", login);

//!This is done
adminRouter.post(
  "/logout",
  authenticateAdmin,
  authorizeRoleAdmin(["Admin"]),
  logoutAdmin
);

export default adminRouter;
