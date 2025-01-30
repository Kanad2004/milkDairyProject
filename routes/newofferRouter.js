//In this code the middleware should be added . . . 
import express from "express"
import {addNewOffer , editNewOffer , deleteNewOffer , updateOfferImage } from "../controllers/newofferController.js";
import { authenticateUser, authorizeRoles } from "../middleware/auth.js";
import {upload} from "../middlewares/uploadFile.middleware.js";
// Add Authentication and authorization middleware in this . . .
const newofferRouter = express.Router();

newofferRouter.post("/add-new-offer", upload.single("link") , addNewOffer);
newofferRouter.post("/edit-offer", editNewOffer);
newofferRouter.post("/delete-offer", authenticateUser, authorizeRoles(['Admin']), deleteNewOffer);
newofferRouter.post("/update-offer-img" , upload.single("link") , updateOfferImage)

export default newofferRouter;

