// import express from "express";
// import {
//   displayAllProducts,
//   displayProductByName,
//   updateProduct,
//   addProduct,
//   deleteProductById,
//   addQuantity,
// } from "../controllers/productController.js";
// import {
//   authenticateSubAdmin,
//   authorizeRoleSubAdmin,
// } from "../middlewares/auth.js";

// const productRouter = express.Router();

// //!This is done
// productRouter.get(
//   "/get-all-products",
//   authenticateSubAdmin, // Authenticate SubAdmin
//   authorizeRoleSubAdmin(["subAdmin"]), // Check SubAdmin's role
//   displayAllProducts // Handle the request
// );
// //!This is done
// productRouter.get(
//   "/get-product/:productName",
//   authenticateSubAdmin, // Authenticate SubAdmin
//   authorizeRoleSubAdmin(["subAdmin"]), // Check SubAdmin's role
//   displayProductByName // Handle the request
// );

// //!This is done
// productRouter.patch(
//   "/update-product/:productId",
//   authenticateSubAdmin,
//   authorizeRoleSubAdmin(["subAdmin"]),
//   updateProduct
// );

// //!This is done
// productRouter.post(
//   "/add-product",
//   authenticateSubAdmin,
//   authorizeRoleSubAdmin(["subAdmin"]),
//   addProduct
// );

// //!This is done
// productRouter.delete(
//   "/delete-product/:productId",
//   authenticateSubAdmin,
//   authorizeRoleSubAdmin(["subAdmin"]),
//   deleteProductById
// );

// //!This is done
// productRouter.patch(
//   "/add-quantity/:productId",
//   authenticateSubAdmin,
//   authorizeRoleSubAdmin(["subAdmin"]),
//   addQuantity
// );

// export default productRouter;
