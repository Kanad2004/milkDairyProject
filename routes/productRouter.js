import express from "express"
import {displayAllProducts , displayProductByName , updateProduct , addProduct , deleteProductById , addQuantity} from "../controllers/productController.js"
import { authenticateSubAdmin, authorizeRoleSubAdmin } from "../middleware/auth.js";

const productRouter = express.Router() ;

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

export default productRouter ;