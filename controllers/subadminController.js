import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { SubAdmin } from "../model/SubAdmin.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { Branch } from "../model/Branch.js";

// SubAdmin Login
const subAdminLogin = asyncHandler(async (req, res) => {
  const { subAdminEmail, subAdminPassword } = req.body;

  if (!subAdminEmail || !subAdminPassword) {
    throw new ApiError(400, "Email and Password are required");
  }

  const subAdmin = await SubAdmin.findOne({ subAdminEmail });

  if (!subAdmin) {
    throw new ApiError(404, "SubAdmin not found");
  }

  const isPassValid = await subAdmin.isPasswordCorrect(subAdminPassword);

  // const isPassValid = await bcrypt.compare(subAdminPassword, subAdmin.subAdminPassword);

  if (!isPassValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  try {
    const accessToken = jwt.sign(
      { _id: subAdmin._id, role: "SubAdmin" },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = jwt.sign(
      { _id: subAdmin._id },
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
          {
            subAdmin: { id: subAdmin._id, email: subAdmin.subAdminEmail },
            accessToken,
          },
          "SubAdmin logged in successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, "Failed to log in. Please try again.");
  }
});
// SubAdmin Logout
const subAdminLogout = asyncHandler(async (req, res) => {
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

const addSubAdmin = async (req, res) => {
  try {
    const { subAdminName, subAdminEmail, subAdminPassword, branch } = req.body;

    // Check if the subadmin already exists
    const subAdminExists = await SubAdmin.findOne({ subAdminEmail });
    if (subAdminExists) {
      return res.status(400).json({ message: "SubAdmin already exists!" });
    }

    // Find or create the branch
    const existingBranch = await Branch.findOne({
      branchName: branch.branchName,
      location: branch.location,
    });

    let branchId;
    if (existingBranch) {
      branchId = existingBranch._id;
    } else {
      const newBranch = await Branch.create(branch);
      branchId = newBranch._id;
    }

    // Hash the password (recommended for security)
    // const hashedPassword = await bcrypt.hash(subAdminPassword, 10);

    // Create the new subadmin
    const newSubAdmin = new SubAdmin({
      subAdminName,
      subAdminEmail,
      subAdminPassword, // Use hashedPassword here if hashing
      branch: branchId,
      role: "subAdmin",
    });

    // Save the subadmin to the database
    await newSubAdmin.save();
    res.status(201).json({ message: "SubAdmin added successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding subadmin" });
  }
};

const deleteSubAdmin = async (req, res) => {
  const { subAdminId } = req.params;
  await SubAdmin.findByIdAndDelete(subAdminId);
  return res
    .status(200)
    .send(
      new ApiResponse(200, { success: true }, "SubAdmin deleted successfully")
    );
};
// Additional CRUD operations (optional)

// Get all SubAdmins (Admin-only access)
const getAllSubAdmins = asyncHandler(async (req, res) => {
  const subAdmins = await SubAdmin.find().select("-subAdminPassword");
  return res
    .status(200)
    .send(new ApiResponse(200, subAdmins, "SubAdmins found"));
});

// Get SubAdmin by ID
const getSubAdminById = asyncHandler(async (req, res) => {
  const { subAdminId } = req.params;
  const subAdmin = await SubAdmin.findById(subAdminId).select(
    "-subAdminPassword"
  );
  if (!subAdmin) {
    throw new ApiError(404, "SubAdmin not found");
  }
  return res.status(200).send(new ApiResponse(200, subAdmin, "SubAdmin found"));
});

export {
  subAdminLogin,
  subAdminLogout,
  addSubAdmin,
  deleteSubAdmin,
  getAllSubAdmins,
  getSubAdminById,
};
