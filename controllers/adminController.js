import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Admin } from "../model/Admin.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

  let accessToken = "";
  let refreshToken = "";

  try {
    accessToken = admin.generateAccessToken();

    refreshToken = admin.generateRefToken();

    admin.refreshToken = refreshToken;
    await admin.save({ validateBeforeSave: false });
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }

  const loggedInAdmin = await Admin.findById(admin._id).select(
    "-adminPassword -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  //cookies are not set in the mobile application at the user end that's why here we are sending the accesstoken and refreshtoken in the response to the user
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken)
    .json(
      new ApiResponse(
        200,
        { admin: loggedInAdmin, accessToken, refreshToken },
        "Admin logged in successfully"
      )
    );
});

const logoutAdmin = asyncHandler(async (req, res) => {
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






export { login, logoutAdmin };
