import express from "express";

import {
  authenticateAdmin,
  authenticateSubAdmin,
  authorizeRoleAdmin,
  authorizeRoleSubAdmin,
} from "../middlewares/auth.js";
import {
  addMilk,
  deleteMilkTransaction,
  getAllMilk,
  updateMilkTransaction,
} from "../controllers/milkController.js";

const milkRouter = express.Router();

milkRouter.post(
  "/add-milk",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  addMilk
);

milkRouter.get(
  "/get-all-milk",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  getAllMilk
);

milkRouter.patch(
  "/update-milk/:farmerNumber/:transactionId",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  updateMilkTransaction
);

milkRouter.delete(
  "/delete-milk/:farmerNumber/:transactionId",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  deleteMilkTransaction
);

export default milkRouter;
