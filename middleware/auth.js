// import jwt from "jsonwebtoken";
// import { Admin } from "../model/Admin.js";
// import { SubAdmin } from "../model/SubAdmin.js";

// export const authenticateUser = async (req, res, next) => {
//   const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];
//   if (!token) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//     req.user = decoded;

//     if (decoded.role === "Admin") {
//       req.userDetails = await Admin.findById(decoded._id);
//     } else {
//       req.userDetails = await SubAdmin.findById(decoded._id).populate("branch");
//     }

//     next();
//   } catch (error) {
//     res.status(401).json({ message: "Token is invalid or expired" });
//   }
// };

import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { Admin } from "../model/Admin.js";

//This middleware should be checked in future when frontEnd is ready. . . 
export const authenticateUser = async (req, res, next) => {
  const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];
  console.log(1);
  console.log(req.cookies);
  if (!token) {
    throw new ApiError(401, "Unauthorized");
  }
  console.log(1);
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await Admin.findById(decoded._id);
    if (!user) throw new ApiError(401, "Unauthorized");
    req.admin = user;
    console.log(1);
    next();
  } catch (error) {
    throw new ApiError(401, "Token is invalid or expired");
  }
};

export const authorizeRoles = (roles) => (req, res, next) => {
  console.log("roles" , roles)
  console.log("req.admin.role" , req.admin)
  if (roles!==req.admin.role) {
    throw new ApiError(403, "You do not have access to this resource");
  }
  next();
};
