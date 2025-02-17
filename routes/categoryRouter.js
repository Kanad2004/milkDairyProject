import express from "express";
import {
    addCategory,
    deleteCategory,
    updateCategory,
    getAllCategories,
    getCategoryById
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

categoryRouter.get(
  "/get-all-categories",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["SubAdmin"]),
  getAllCategories
);

categoryRouter.put(
  "/get-categorybyId",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["SubAdmin"]),
  getCategoryById
);

export default categoryRouter;
