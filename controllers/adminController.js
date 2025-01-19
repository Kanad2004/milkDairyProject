import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Admin } from "../model/Admin.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const login = asyncHandler(async (req, res) => {
  const { adminEmail, adminPassword } = req.body;

  if (!adminEmail) {
    throw new ApiError(400, "Email is required");
  }

  const admin = await Admin.findOne({ adminEmail });

  if (!admin) {
    throw new ApiError(404, "Admin not Found");
  }

  const isPassValid = await admin.isPasswordCorrect(adminPassword);

  if (!isPassValid) {
    throw new ApiError(401, "Password is not valid");
  }

  const newAdmin = await Admin.create({
    adminName,
    adminEmail,
    adminPassword,
  });
  const createdUser = await User.findById(newUser._id).select(
    "-adminPassword -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "User is not registered successfully");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registered Successfully ! "));
});

export { login, logoutAdmin };
