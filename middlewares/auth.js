import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { SubAdmin } from "../model/SubAdmin.js";
import { Admin } from "../model/Admin.js";

// Middleware for authenticating the subadmin
export const authenticateSubAdmin = async (req, res, next) => {
  try {
    const token =
      req.cookies.accessToken || req.headers.authorization?.split(" ")[1];
    console.log("AuthenticateSubAdmin: Token received:", token);

    if (!token) {
      return next(new ApiError(401, "Unauthorized: No token provided"));
    }
    console.log("token: ", token);
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log(decoded);
    const user = await SubAdmin.findById(decoded._id);
    console.log("user:", user);

    if (!user) {
      return next(new ApiError(401, "Unauthorized: Invalid SubAdmin"));
    }

    req.subAdmin = user; // Attach the SubAdmin details to the request object
    console.log("AuthenticateSubAdmin: Authentication successful");
    next();
  } catch (error) {
    console.error("AuthenticateSubAdmin: Error occurred", error);
    return next(new ApiError(401, "Unauthorized: Token is invalid or expired"));
  }
};

// Middleware for authenticating the admin
export const authenticateAdmin = async (req, res, next) => {
  try {
    const token =
      req.cookies.accessToken || req.headers.authorization?.split(" ")[1];
    console.log("AuthenticateAdmin: Token received:", token);

    if (!token) {
      return next(new ApiError(401, "Unauthorized: No token provided"));
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await Admin.findById(decoded._id);
    if (!user) {
      return next(new ApiError(401, "Unauthorized: Invalid Admin"));
    }

    req.admin = user; // Attach the Admin details to the request object
    console.log("AuthenticateAdmin: Authentication successful");
    next();
  } catch (error) {
    console.error("AuthenticateAdmin: Error occurred", error);
    return next(new ApiError(401, "Unauthorized: Token is invalid or expired"));
  }
};

// Middleware for authorizing specific roles for Admins
export const authorizeRoleAdmin = (roles) => (req, res, next) => {
  try {
    console.log("AuthorizeRoleAdmin: Required roles:", roles);
    console.log("AuthorizeRoleAdmin: Current Admin role:", req.admin?.role);

    if (!roles.includes(req.admin?.role)) {
      return next(
        new ApiError(403, "Forbidden: You do not have access to this resource")
      );
    }

    next();
  } catch (error) {
    console.error("AuthorizeRoleAdmin: Error occurred", error);
    next(new ApiError(500, "Internal Server Error"));
  }
};

// Middleware for authorizing specific roles for SubAdmins
export const authorizeRoleSubAdmin = (roles) => (req, res, next) => {
  try {
    console.log("AuthorizeRoleSubAdmin: Required roles:", roles);
    console.log(
      "AuthorizeRoleSubAdmin: Current SubAdmin role:",
      req.subAdmin?.role
    );

    if (!roles.includes(req.subAdmin?.role)) {
      return next(
        new ApiError(403, "Forbidden: You do not have access to this resource")
      );
    }

    next();
  } catch (error) {
    console.error("AuthorizeRoleSubAdmin: Error occurred", error);
    next(new ApiError(500, "Internal Server Error"));
  }
};
