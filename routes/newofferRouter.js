//In this code the middleware should be added . . .
import express from "express";
import {
  addNewOffer,
  editNewOffer,
  deleteNewOffer,
  updateOfferImage,
  getAllOffers,
} from "../controllers/newofferController.js";
import {
  authenticateSubAdmin,
  authenticateAdmin,
  authorizeRoleAdmin,
  authorizeRoleSubAdmin,
} from "../middlewares/auth.js";
import { upload } from "../middlewares/uploadFile.middleware.js";
// Add Authentication and authorization middleware in this . . .
const newofferRouter = express.Router();

newofferRouter.post(
  "/add-new-offer",
  authenticateAdmin,
  authorizeRoleAdmin(["Admin"]),
  upload.single("link"),
  addNewOffer
);
newofferRouter.post(
  "/edit-offer/:id",
  authenticateAdmin,
  authorizeRoleAdmin(["Admin"]),
  upload.single("link"),
  editNewOffer
);
newofferRouter.post(
  "/delete-offer/:id",
  authenticateAdmin,
  authorizeRoleAdmin(["Admin"]),
  deleteNewOffer
);
// newofferRouter.post("/update-offer-img" , upload.single("link") , updateOfferImage)
newofferRouter.get(
  "/get-all-offers",
  // authenticateAdmin,
  // authorizeRoleAdmin(["Admin"]),
  getAllOffers
);

export default newofferRouter;
