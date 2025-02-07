<<<<<<< HEAD
import express from "express"
import {displayAllProducts , displayProductByName , updateProduct , addProduct , deleteProductById , addQuantity} from "../controllers/productController.js"
import { authenticateSubAdmin, authorizeRoleSubAdmin } from "../middleware/auth.js";
=======
import express from "express";
import {
  displayAllProducts,
  displayProductByName,
  updateProduct,
  addProduct,
  deleteProductById,
  addQuantity,
} from "../controllers/productController.js";
import {
  authenticateSubAdmin,
  authorizeRoleSubAdmin,
} from "../middlewares/auth.js";
>>>>>>> 14a5353bd279100d6e5c27cb46140631f278c929

const productRouter = express.Router();

<<<<<<< HEAD
//ask that whether the subadmin is having the authority to interact with the product
productRouter.get("/get-all-products" , authenticateSubAdmin ,  authorizeRoleSubAdmin(["SubAdmin"]) , displayAllProducts)
productRouter.get("/get-product/:productName" , authenticateSubAdmin , authorizeRoleSubAdmin(["SubAdmin"]) ,displayProductByName)
productRouter.patch("/:productId" , authenticateSubAdmin , authorizeRoleSubAdmin(["SubAdmin"]) ,updateProduct)
productRouter.post("/add-product" , authenticateSubAdmin , authorizeRoleSubAdmin(["SubAdmin"]) ,addProduct)
productRouter.delete("/:productId" , authenticateSubAdmin , authorizeRoleSubAdmin(["SubAdmin"]) ,deleteProductById)
productRouter.patch(
    "/add-quantity/:productId",
    authenticateSubAdmin,
    authorizeRoleSubAdmin(["SubAdmin"]),
    addQuantity
  );
=======
//!This is done
productRouter.get(
  "/get-all-products",
  authenticateSubAdmin, // Authenticate SubAdmin
  authorizeRoleSubAdmin(["subAdmin"]), // Check SubAdmin's role
  displayAllProducts // Handle the request
);
//!This is done
productRouter.get(
  "/get-product/:productName",
  authenticateSubAdmin, // Authenticate SubAdmin
  authorizeRoleSubAdmin(["subAdmin"]), // Check SubAdmin's role
  displayProductByName // Handle the request
);
>>>>>>> 14a5353bd279100d6e5c27cb46140631f278c929

//!This is done
productRouter.patch(
  "/update-product/:productId",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  updateProduct
);

//!This is done
productRouter.post(
  "/add-product",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  addProduct
);

//!This is done
productRouter.delete(
  "/delete-product/:productId",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  deleteProductById
);

//!This is done
productRouter.patch(
  "/add-quantity/:productId",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  addQuantity
);

export default productRouter;
