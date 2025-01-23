import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Admin } from "../model/Admin.js";
import { SubAdmin } from "../model/SubAdmin.js";
import { Branch } from "../model/Branch.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// import Admin from "../models/AdminModel"; // Import the Admin model (make sure this is the correct path)
// import bcrypt from "bcryptjs";

// Add Admin function
export const addAdmin = async (req, res) => {
  try {
    const { adminName, adminEmail, adminPassword } = req.body;
    console.error(1);
    // Check if the admin already exists
    const adminExists = await Admin.findOne({ adminEmail });
    if (adminExists) {
      return res.status(400).json({ message: "Admin already exists!" });
    }
    console.error(2);
    // Hash the password before saving
    // const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create the new admin
    const newAdmin = new Admin({
      adminName,
      adminEmail,
     
      adminPassword,
      role: "admin", // Set the role as admin
    });
    console.error(3);
    // Save the admin to the database
    await newAdmin.save();
    res.status(201).json({ message: "Admin added successfully!" });
    console.error(4);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding admin" });
  }
};

// Add SubAdmin function

export const addSubAdmin = async (req, res) => {
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
    });

    // Save the subadmin to the database
    await newSubAdmin.save();
    res.status(201).json({ message: "SubAdmin added successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding subadmin" });
  }
};


export const login = asyncHandler(async (req, res) => {
  const { adminEmail, adminPassword } = req.body;

  if (!adminEmail || !adminPassword) {
    throw new ApiError(400, "Email and Password are required");
  }

  const admin = await Admin.findOne({ adminEmail });

  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  const isPassValid = await admin.isPasswordCorrect(adminPassword);
  // const isPassValid = await bcrypt.compare(adminPassword, admin.adminPassword);

  if (!isPassValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  try {
    const accessToken = await admin.generateAccessToken();
    const refreshToken = await admin.generateRefToken();

    admin.refreshToken = refreshToken;
    await admin.save({ validateBeforeSave: false });

    const cookieOptions = {
      httpOnly: true,
      secure: false,
      // sameSite: "Strict",
      sameSite: "lax"
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(
        new ApiResponse(
          200,
          { admin: { id: admin._id, email: admin.adminEmail , role:"Admin"}, accessToken },
          "Admin logged in successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, "Failed to log in. Please try again.");
  }
});



export const logoutAdmin = asyncHandler(async (req, res) => {
  if (!req.admin) {
    throw new ApiError(401, "Unauthorized");
  }
  
  // await Admin.findByIdAndUpdate(req.admin._id, { refreshToken: null });

  await Admin.findByIdAndUpdate(
    req.admin._id,
    {
      $set: {
        refreshToken: null, // Use null instead of undefined to clear
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Admin logged out"));
  
});

//we have to write the same login and logout for the subadmin as well . . . 

export const getAllAdmins = asyncHandler(async (req, res) => {
  const admins = await Admin.find().select("-adminPassword");
  return res.status(200).json(new ApiResponse(200, admins, "Admins found"));
});

export const getAdminById = asyncHandler(async (req, res) => {
  const { adminId } = req.params;
  const admin = await Admin.findById(adminId).select("-adminPassword");
  return res.status(200).json(new ApiResponse(200, admin, "Admin found"));
});

export const updateAdmin = asyncHandler(async (req, res) => {
  const { adminId } = req.params;
  const { adminName, adminEmail } = req.body;
  const admin = await Admin.findById(adminId);  
  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }
  if (adminName) {
    admin.adminName = adminName;
  }
  if (adminEmail) {
    admin.adminEmail = adminEmail;
  } 
  await admin.save();
  return res.status(200).json(new ApiResponse(200, admin, "Admin updated"));
});
  
export const deleteAdmin = asyncHandler(async (req, res) => {
  const { adminId } = req.params;
  const admin = await Admin.findById(adminId);
  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }
  await admin.remove();
  return res.status(200).json(new ApiResponse(200, {}, "Admin deleted"));
});

export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return res.status(401).json(new ApiResponse(401, {}, "Unauthorized"));
  }
  const admin = await Admin.findOne({ refreshToken });
  if (!admin) {
    return res.status(401).json(new ApiResponse(401, {}, "Unauthorized"));
  }
  const accessToken = admin.generateAccessToken();
  return res
    .status(200)
    .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
    .json(new ApiResponse(200, { accessToken }, "Access token updated"));
});



export const getAllSubAdmins = async (req, res) => {
  const subAdmins = await SubAdmin.find().populate("branch");
  res.status(200).json({ success: true, subAdmins });
};

export const getSubAdminById = async (req, res) => {
  const { subAdminId } = req.params;
  const subAdmin = await SubAdmin.findById(subAdminId).populate("branch");
  res.status(200).json({ success: true, subAdmin });
};

export const deleteSubAdmin = async (req, res) => {
  const { subAdminId } = req.params;
  await SubAdmin.findByIdAndDelete(subAdminId);
  res.status(200).json({ success: true, message: "SubAdmin deleted" });
};
// import { Branch } from "../model/Branch.js";

export const createBranch = async (req, res) => {
  const { branchName, location } = req.body;
  const branch = await Branch.create({ branchName, location });
  res.status(201).json({ success: true, branch });
};

export const getBranches = async (req, res) => {
  const branches = await Branch.find();
  res.status(200).json({ success: true, branches });
};



// export {
//   login,
//   logoutAdmin,
//   getAllAdmins,
//   getAdminById,
//   updateAdmin,
//   deleteAdmin,
//   refreshToken,
// };
  

