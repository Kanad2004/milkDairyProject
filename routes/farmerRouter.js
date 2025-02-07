import express from "express";
import {
  addFarmer,
  addMilk,
  deleteFarmer,
  exportFarmerDetail,
  getAllfarmers,
} from "../controllers/farmerController.js";
const farmerRouter = express.Router();
import {
  authenticateAdmin,
  authenticateSubAdmin,
<<<<<<< HEAD
  authorizeRoleAdmiS,
=======
  authorizeRoleAdmin,
>>>>>>> 14a5353bd279100d6e5c27cb46140631f278c929
  authorizeRoleSubAdmin,
} from "../middlewares/auth.js";

farmerRouter.post(
  "/addFarmer",
  authenticateSubAdmin,
<<<<<<< HEAD
  authorizeRoleSubAdmin(["SubAdmin"]),
=======
  authorizeRoleSubAdmin(["subAdmin"]),
>>>>>>> 14a5353bd279100d6e5c27cb46140631f278c929
  addFarmer
);

farmerRouter.get(
  "/get-all-farmers",
  authenticateSubAdmin,
<<<<<<< HEAD
  authorizeRoleSubAdmin(["SubAdmin"]),
  getAllfarmers
);

//Please check this route whether we are adding the new milk or we are updating the milk quantity . . .
farmerRouter.patch(
  "/add-milk",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["SubAdmin"]),
  addMilk
);

//Add the farmer Id to delete the specific farmer . . . 
farmerRouter.delete(
  "/delete-farmer",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["SubAdmin"]),
  deleteFarmer
);

// exportFarmerDetail Should Handle Proper Authorization
// Who can export farmer details? Admin, SubAdmin, or both?
// If only Admins can export, update the route:
farmerRouter.get(
  "/export-farmer-detail/:farmerId",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["SubAdmin"]),
  exportFarmerDetail
);

export default farmerRouter;
=======
  authorizeRoleSubAdmin(["subAdmin"]),
  getAllfarmers
);

farmerRouter.patch(
  "/add-milk",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  addMilk
);

farmerRouter.delete(
  "/delete-farmer",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  deleteFarmer
);

farmerRouter.get(
  "/export-farmer-detail/:farmerId",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  exportFarmerDetail
);

export default farmerRouter;
>>>>>>> 14a5353bd279100d6e5c27cb46140631f278c929
