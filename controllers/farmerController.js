import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Admin } from "../model/Admin.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Farmer } from "../model/Farmer.js";

const addFarmer = asyncHandler(async (req, res) => {
  const { farmerName, mobileNumber, address } = req.body;
  const subAdmin = req.subAdmin._id;
  if ([farmerName, mobileNumber, address].some((field) => field?.trim === "")) {
    throw new ApiError(400, "All Fields are required ");
  }

  const farmer = await Farmer.findOne({ mobileNumber });

  if (farmer) {
    throw new ApiError(409, "farmer with same credentials already exists");
  }

  const newfarmer = await farmer.create({
    farmerName,
    mobileNumber,
    address,
    subAdmin,
  });

  if (!newfarmer) {
    throw new ApiError(500, "farmer is not added successfully");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, newfarmer, "farmer Registered Successfully ! "));
});

const getAllfarmers = asyncHandler(async (req, res) => {});

export { addFarmer, getAllfarmers };
