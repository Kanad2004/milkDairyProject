// SubAdminController.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { SubAdmin } from "../model/SubAdmin.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { Branch } from "../model/Branch.js";
import { uploadOnCloudinary } from "../utils/CloudinaryUtility.js";
import fs from "fs"; // Import fs since you're using fs.unlink later in the file

// SubAdmin Login
const subAdminLogin = asyncHandler(async (req, res) => {
  const { mobileNumber, subAdminPassword } = req.body;

  if (!mobileNumber || !subAdminPassword) {
    throw new ApiError(400, "Mobile Number and Password are required");
  }

  const subAdmin = await SubAdmin.findOne({ mobileNumber });

  if (!subAdmin) {
    throw new ApiError(404, "SubAdmin not found");
  }

  const isPassValid = await subAdmin.isPasswordCorrect(subAdminPassword);

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
    console.log(refreshToken);
    subAdmin.refreshToken = refreshToken;
    await subAdmin.save({ validateBeforeSave: false });


    //Following is the development setup
    // const cookieOptions = {
    //   httpOnly: true,
    //   secure: true,
    //   sameSite: "Strict",
    // };

    //Following is the production setup
    const isProduction = process.env.NODE_ENV === "production";

    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(
        new ApiResponse(
          200,
          {
            subAdmin: { id: subAdmin._id, mobileNumber: subAdmin.mobileNumber },
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
  const subAdmin = req.subAdmin;

  if (!subAdmin) {
    throw new ApiError(401, "Unauthorized");
  }

  await SubAdmin.findByIdAndUpdate(subAdmin._id, { refreshToken: null });

  //development setup
  // const cookieOptions = {
  //   httpOnly: true,
  //   secure: true,
  //   sameSite: "Strict",
  // };

    const isProduction = process.env.NODE_ENV === "production";

      const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "None" : "Lax",
      };

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "SubAdmin logged out successfully"));
});

const addSubAdmin = async (req, res) => {
  const { subAdminName, mobileNumber, address, subAdminPassword, branchId } =
    req.body;

  const profilePicture = req?.file?.path;

  if (!profilePicture) {
    throw new ApiError(400, "Cover Img is missing");
  }

  // Check if the subadmin already exists
  const subAdminExists = await SubAdmin.findOne({ mobileNumber });
  if (subAdminExists) {
    return res.status(400).json({ message: "SubAdmin already exists!" });
  }

  // Find or create the branch
  const existingBranch = await Branch.findOne({
    branchId: branchId,
  });

  const subAdmin = await SubAdmin.findOne({ branch: existingBranch._id });

  if (subAdmin) {
    return res
      .status(400)
      .json({ message: "SubAdmin with same branch already exists!" });
  }

  const profilePictureImg = await uploadOnCloudinary(profilePicture);

  if (!profilePictureImg.url) {
    throw new ApiError(400, "Error while uploading ProfileImage on cloudinary");
  }
  fs.unlink(profilePicture, (err) => {
    if (err) {
      console.error(`Failed to delete uploaded profilePicture: ${err.message}`);
    } else {
      console.log("Uploaded profilePicture deleted successfully from server");
    }
  });

  // Create the new subadmin
  const newSubAdmin = new SubAdmin({
    subAdminName,
    mobileNumber,
    profilePicture: profilePictureImg.url,
    address,
    subAdminPassword, // Use hashedPassword here if hashing
    branch: existingBranch._id,
    admin: req?.admin?._id,
    role: "subAdmin",
  });

  // Save the subadmin to the database
  const savedSubAdmin = await newSubAdmin.save();

  console.log(savedSubAdmin._id);

  const subAdminWithBranch = await SubAdmin.findById(savedSubAdmin._id)
    .populate("branch")
    .populate("admin");

  console.log(subAdminWithBranch);

  res
    .status(201)
    .send(
      new ApiResponse(200, subAdminWithBranch, "SubAdmin added successfully!")
    );
};

// Check if the subadmin already exists

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
  const subAdmins = await SubAdmin.find().populate("branch").populate("admin");
  return res
    .status(200)
    .send(new ApiResponse(200, subAdmins, "SubAdmins found"));
});

// Get SubAdmin by ID
const getSubAdminById = asyncHandler(async (req, res) => {
  const { subAdminId } = req.params;
  const subAdmin = await SubAdmin.findById(subAdminId)
    .populate("branch")
    .populate("admin");
  if (!subAdmin) {
    throw new ApiError(404, "SubAdmin not found");
  }
  return res.status(200).send(new ApiResponse(200, subAdmin, "SubAdmin found"));
});

const updateSubAdmin = asyncHandler(async (req, res) => {
  const { subAdminId } = req.params;
  const { subAdminName, mobileNumber, address, subAdminPassword, branchId } =
    req.body;

  // Build the update fields object
  const updateFields = {};

  if (subAdminName) updateFields.subAdminName = subAdminName;
  if (mobileNumber) updateFields.mobileNumber = mobileNumber;
  if (address) updateFields.address = address;
  if (subAdminPassword) updateFields.subAdminPassword = subAdminPassword; // Consider hashing if needed

  // Debug: log the received branchId value
  if (branchId) {
    console.log("Received branchId from request:", branchId);
    // Convert branchId from string to number since your Branch schema uses a Number
    const branchIdNum = Number(branchId);
    console.log("Converted branchId to number:", branchIdNum);

    // Look up the branch by its branchId field
    const existingBranch = await Branch.findOne({ branchId: branchIdNum });
    if (!existingBranch) {
      console.log("No branch found for branchId:", branchIdNum);
      return res.status(400).json({ message: "Branch does not exist!" });
    }
    updateFields.branch = existingBranch._id;
  }

  // Handle profile picture update if a new file is provided
  if (req.file && req.file.path) {
    const profilePictureImg = await uploadOnCloudinary(req.file.path);
    if (!profilePictureImg || !profilePictureImg.url) {
      throw new ApiError(
        400,
        "Error while uploading new ProfileImage on Cloudinary"
      );
    }
    updateFields.profilePicture = profilePictureImg.url;

    // Delete the file from the server after upload
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.error(`Failed to delete uploaded file: ${err.message}`);
      } else {
        console.log("Uploaded file deleted successfully from server");
      }
    });
  }

  // Update the sub-admin document and populate branch and admin fields
  const updatedSubAdmin = await SubAdmin.findByIdAndUpdate(
    subAdminId,
    { $set: updateFields },
    { new: true, runValidators: true }
  )
    .populate("branch")
    .populate("admin");

  if (!updatedSubAdmin) {
    throw new ApiError(404, "SubAdmin not found");
  }

  res
    .status(200)
    .send(
      new ApiResponse(200, updatedSubAdmin, "SubAdmin updated successfully")
    );
});

export {
  subAdminLogin,
  subAdminLogout,
  addSubAdmin,
  deleteSubAdmin,
  getAllSubAdmins,
  getSubAdminById,
  updateSubAdmin,
};
