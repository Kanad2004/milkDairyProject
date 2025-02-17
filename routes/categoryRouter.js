import express from "express";
import {
    addCategory,
    deleteCategory,
    updateCategory,
} from "../controllers/categoryController.js";
import { authenticateSubAdmin, authorizeRoleSubAdmin } from "../middlewares/auth.js";

const categoryRouter = express.Router();

categoryRouter.post("/addCategory", authenticateSubAdmin , authorizeRoleSubAdmin(['SubAdmin']) ,addCategory);

//!This is done
categoryRouter.delete("/delete-cateory", authenticateSubAdmin , authorizeRoleSubAdmin(['SubAdmin']) , deleteCategory);

//!This is done
categoryRouter.put(
  "/update-category",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["SubAdmin"]),
  updateCategory
);

export default categoryRouter;
