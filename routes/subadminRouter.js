<<<<<<< HEAD
//The following is previous code. . . 

// import express from "express"
// import { authenticateUser, authorizeRoles } from "../middleware/auth.js";
// import { getAllSubAdmins,getSubAdminById,deleteSubAdmin,addSubAdmin , subAdminLogin , subAdminLogout} from "../controllers/subadminController.js"

// const subadminRouter = express.Router();

// subadminRouter.post("/addSubAdmin", addSubAdmin);
// subadminRouter.get("/get-all-subadmins", authenticateUser , authorizeRoles("Admin") , getAllSubAdmins);
// subadminRouter.get("/:subAdminId", authenticateUser , authorizeRoles("Admin"),getSubAdminById);
// subadminRouter.delete("/:subAdminId", authenticateUser , authorizeRoles("Admin"),deleteSubAdmin);


//Kanad's code
=======
>>>>>>> 14a5353bd279100d6e5c27cb46140631f278c929
import express from "express";
import {
  authenticateAdmin,
  authorizeRoleAdmin,
  authenticateSubAdmin,
  authorizeRoleSubAdmin,
} from "../middlewares/auth.js";
import {
  getAllSubAdmins,
  getSubAdminById,
  deleteSubAdmin,
  addSubAdmin,
  subAdminLogin,
  subAdminLogout,
} from "../controllers/subadminController.js";

const subadminRouter = express.Router();

//!This is done
subadminRouter.post(
  "/addSubAdmin",
  authenticateAdmin,
  authorizeRoleAdmin(["Admin"]),
  addSubAdmin
);

//!This is done
subadminRouter.get(
  "/get-all-subadmins",
  authenticateAdmin,
  authorizeRoleAdmin(["Admin"]),
  getAllSubAdmins
);

//!This is done
subadminRouter.get(
  "/get/:subAdminId",
  authenticateAdmin,
<<<<<<< HEAD
  authorizeRoleAdmin(["Admin"]),
=======
  authorizeRoleAdmin("Admin"),
>>>>>>> 14a5353bd279100d6e5c27cb46140631f278c929
  getSubAdminById
);

//!This is done
subadminRouter.delete(
  "/:subAdminId",
  authenticateAdmin,
<<<<<<< HEAD
  authorizeRoleAdmin(["Admin"]),
=======
  authorizeRoleAdmin("Admin"),
>>>>>>> 14a5353bd279100d6e5c27cb46140631f278c929
  deleteSubAdmin
);

//!This is done
subadminRouter.post("/login", subAdminLogin);

subadminRouter.post(
  "/logout",
  authenticateSubAdmin,
<<<<<<< HEAD
  subAdminLogout
);

export default subadminRouter;
=======
  authorizeRoleSubAdmin(["subAdmin"]),
  subAdminLogout
);

export default subadminRouter;
>>>>>>> 14a5353bd279100d6e5c27cb46140631f278c929
