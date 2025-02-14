import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Admin } from "../model/Admin.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Customer } from "../model/Customer.js";

const addCustomer = asyncHandler(async (req, res) => {
  const { customerName, mobileNumber, address } = req.body;
  const admin = req.admin;
  if (!customerName?.trim() || !mobileNumber || !address?.trim()) {
    throw new ApiError(400, "All fields are required");
  }

  const customer = await Customer.findOne({ mobileNumber });

  if (customer) {
    throw new ApiError(409, "Customer with same credentials already exists");
  }

  const newCustomer = await Customer.create({
    customerName,
    mobileNumber,
    address,
    admin,
  });

  if (!newCustomer) {
    throw new ApiError(500, "Customer is not added successfully");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(200, newCustomer, "Customer Registered Successfully ! ")
    );
});

const getAllCustomers = asyncHandler(async (req, res) => {});

export { addCustomer, getAllCustomers };
