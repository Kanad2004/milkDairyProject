import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { SubAdmin } from "../model/SubAdmin.js";
import { ApiResponse } from "../utils/ApiResponse.js";
// import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// SubAdmin Login
export const subAdminLogin = asyncHandler(async (req, res) => {
  const { subAdminEmail, subAdminPassword } = req.body;

  if (!subAdminEmail || !subAdminPassword) {
    throw new ApiError(400, "Email and Password are required");
  }

  const subAdmin = await SubAdmin.findOne({ subAdminEmail });

  if (!subAdmin) {
    throw new ApiError(404, "SubAdmin not found");
  }

  const isPassValid = await admin.isPasswordCorrect(subAdminPassword);

  // const isPassValid = await bcrypt.compare(subAdminPassword, subAdmin.subAdminPassword);

  if (!isPassValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  try {
    const accessToken = jwt.sign(
      { id: subAdmin._id, role: "SubAdmin" },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = jwt.sign(
      { id: subAdmin._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );

    subAdmin.refreshToken = refreshToken;
    await subAdmin.save({ validateBeforeSave: false });

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(
        new ApiResponse(
          200,
          { subAdmin: { id: subAdmin._id, email: subAdmin.subAdminEmail }, accessToken },
          "SubAdmin logged in successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, "Failed to log in. Please try again.");
  }
});


// SubAdmin Logout
export const subAdminLogout = asyncHandler(async (req, res) => {
  const { subAdmin } = req;

  if (!subAdmin) {
    throw new ApiError(401, "Unauthorized");
  }

  await SubAdmin.findByIdAndUpdate(subAdmin._id, { refreshToken: null });

  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  };

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "SubAdmin logged out successfully"));
});

// Additional CRUD operations (optional)

// Get all SubAdmins (Admin-only access)
export const getAllSubAdmins = asyncHandler(async (req, res) => {
  const subAdmins = await SubAdmin.find().select("-subAdminPassword");
  return res.status(200).json(new ApiResponse(200, subAdmins, "SubAdmins found"));
});

// Get SubAdmin by ID
export const getSubAdminById = asyncHandler(async (req, res) => {
  const { subAdminId } = req.params;
  const subAdmin = await SubAdmin.findById(subAdminId).select("-subAdminPassword");
  if (!subAdmin) {
    throw new ApiError(404, "SubAdmin not found");
  }
  return res.status(200).json(new ApiResponse(200, subAdmin, "SubAdmin found"));
});
