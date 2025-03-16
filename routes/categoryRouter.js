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
  updateProductStock,
  getAllProducts,
  getCategoriesByBranch,
  getAllProductsFromBranch,
  getCategoryFromAndById,
} from "../controllers/categoryController.js";
import {
  authenticateSubAdmin,
  authorizeRoleSubAdmin,
} from "../middlewares/auth.js";
import { upload } from "../middlewares/uploadFile.middleware.js";

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
  upload.single("file"),
  addProductToCategory
);

categoryRouter.delete(
  "/:categoryId/product/delete/:productId",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  deleteProductFromCategory
);
categoryRouter.patch(
  "/:categoryId/product/update/:productId",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  upload.single("file"),
  updateProductInCategory
);

categoryRouter.patch(
  "/:categoryId/product/update-stock/:productId",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  updateProductStock
);

categoryRouter.get(
  "/get-all-products",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  getAllProducts
);

//This is for online customer . . . 
categoryRouter.get(
  "/get-categories-by-branch/:selectedBranch",
  getCategoriesByBranch
)

categoryRouter.get(
  "/get-all-products/:selectedBranch" , 
  getAllProductsFromBranch
)

categoryRouter.get(
  "/get-category-from-branch-id/:selectedBranch/:categoryId",
  getCategoryFromAndById
)

export default categoryRouter;
