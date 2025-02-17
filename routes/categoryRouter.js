import express from "express";
import {
  addCategory,
  deleteCategory,
  updateCategory,
  getAllCategories,
  getCategoryById,
  addProductToCategory,
  deleteProductFromCategory,
  updateProductInCategory,
} from "../controllers/categoryController.js";
import {
  authenticateSubAdmin,
  authorizeRoleSubAdmin,
} from "../middlewares/auth.js";

const categoryRouter = express.Router();

categoryRouter.post(
  "/addCategory",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  addCategory
);

//!This is done
categoryRouter.delete(
  "/delete-category/:categoryId",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  deleteCategory
);

//!This is done
categoryRouter.patch(
  "/update-category/:categoryId",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  updateCategory
);

categoryRouter.get(
  "/get-all-categories",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  getAllCategories
);

categoryRouter.get(
  "/get-categorybyId/:categoryId",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  getCategoryById
);

categoryRouter.post(
  "/:categoryId/product/add",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  addProductToCategory
);

categoryRouter.delete(
  "/:categoryId/product/delete/:productId",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  deleteProductFromCategory
);
categoryRouter.put(
  "/:categoryId/product/update/:productId",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  updateProductInCategory
);

export default categoryRouter;
