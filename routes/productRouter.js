import express from "express"
import {displayAllProducts , displayProductByName , updateProduct , addProduct , deleteProductById} from "../controllers/productController.js"
import { authenticateUser, authorizeRoles } from "../middleware/auth.js";

const productRouter = express.Router() ;

//ask that whether the subadmin is having the authority to interact with the product
productRouter.get("/get-all-products" , authenticateUser ,  authorizeRoles(["Admin" , "SubAdmin"]) , displayAllProducts)
productRouter.get("/get-product" , authenticateUser , authorizeRoles(["Admin" , "SubAdmin"]) ,displayProductByName)
productRouter.patch("/:productId" , authenticateUser , authorizeRoles(["Admin" , "SubAdmin"]) ,updateProduct)
productRouter.post("/add-product" , authenticateUser , authorizeRoles(["Admin" , "SubAdmin"]) ,addProduct)
productRouter.delete("/:productId" , authenticateUser , authorizeRoles(["Admin" , "SubAdmin"]) ,deleteProductById)

export default productRouter ;