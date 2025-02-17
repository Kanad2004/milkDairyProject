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
  "/delete-cateory/:categoryId",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["SubAdmin"]),
  deleteCategory
);

//!This is done
categoryRouter.put(
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
  authorizeRoleSubAdmin(["SubAdmin"]),
  getCategoryById
);

categoryRouter.put(
  "/get-categorybyId",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  getCategoryById
);

categoryRouter.put(
  "/get-categorybyId",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["SubAdmin"]),
  getCategoryById
);

categoryRouter.get(
  "/get-categorybyId",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["SubAdmin"]),
  getCategoryById
);

categoryRouter.post(
  "/:categoryId/product/add",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["SubAdmin"]),
  addProductToCategory
);

categoryRouter.delete(
  "/:categoryId/product/delete/:productId",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["SubAdmin"]),
  deleteProductFromCategory
);
categoryRouter.put(
  "/:categoryId/product/update/:productId",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["SubAdmin"]),
  updateProductInCategory
);

export default categoryRouter;
