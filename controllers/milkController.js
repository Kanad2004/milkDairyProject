import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Farmer } from "../model/Farmer.js";

// Add Milk Transaction
const addMilk = asyncHandler(async (req, res) => {
  const {
    farmerNumber,
    transactionDate,
    pricePerLitre,
    milkQuantity,
    milkType,
  } = req.body;

  const farmer = await Farmer.findOne({ mobileNumber: farmerNumber });
  if (!farmer) {
    throw new ApiError(404, "Enter farmer mobile not found");
  }

  if (!transactionDate || !pricePerLitre || !milkQuantity) {
    throw new ApiError(400, "All fields are required");
  }

  if (pricePerLitre < 0 || milkQuantity < 0) {
    throw new ApiError(400, "Amount and Quantity cannot be negative");
  }

  let transactionAmount = pricePerLitre * milkQuantity;
  farmer.transaction.push({
    transactionDate,
    transactionAmount,
    milkQuantity,
    milkType,
  });

  const savedFarmer = await farmer.save();
  const farmerWithSubAdmin = await Farmer.findById(savedFarmer._id).populate(
    "subAdmin"
  );

  return res
    .status(200)
    .send(new ApiResponse(200, farmerWithSubAdmin, "Milk added successfully"));
});

// Get All Milk Transactions (Grouped by Farmer)
const getAllMilk = asyncHandler(async (req, res) => {
  const farmers = await Farmer.find({ subAdmin: req.subAdmin._id });
  if (!farmers || farmers.length === 0) {
    throw new ApiError(404, "No farmers found");
  }
  let allMilk = [];
  farmers.forEach((farmer) => {
    // Include mobileNumber as farmerNumber so frontend can flatten the data properly
    let milk = {
      farmerName: farmer.farmerName,
      mobileNumber: farmer.mobileNumber,
      transaction: farmer.transaction,
    };
    allMilk.push(milk);
  });

  return res
    .status(200)
    .json(new ApiResponse(200, allMilk, "Milk fetched successfully"));
});

// Update Milk Transaction
const updateMilkTransaction = asyncHandler(async (req, res) => {
  const { farmerNumber, transactionId } = req.params;
  const { transactionDate, pricePerLitre, milkQuantity, milkType } = req.body;

  if (!transactionDate || !pricePerLitre || !milkQuantity) {
    throw new ApiError(400, "All fields are required");
  }

  const farmer = await Farmer.findOne({ mobileNumber: farmerNumber });
  if (!farmer) {
    throw new ApiError(404, "Farmer not found");
  }

  const transaction = farmer.transaction.id(transactionId);
  if (!transaction) {
    throw new ApiError(404, "Milk transaction not found");
  }

  transaction.transactionDate = new Date(transactionDate);
  transaction.milkQuantity = milkQuantity;
  transaction.milkType = milkType;
  transaction.transactionAmount = pricePerLitre * milkQuantity;

  const savedFarmer = await farmer.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, savedFarmer, "Milk transaction updated successfully")
    );
});

// Delete Milk Transaction
const deleteMilkTransaction = asyncHandler(async (req, res) => {
  const { farmerNumber, transactionId } = req.params;

  const farmer = await Farmer.findOne({ mobileNumber: farmerNumber });
  if (!farmer) {
    throw new ApiError(404, "Farmer not found");
  }

  const transaction = farmer.transaction.id(transactionId);
  if (!transaction) {
    throw new ApiError(404, "Milk transaction not found");
  }

  transaction.deleteOne();

  const savedFarmer = await farmer.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, savedFarmer, "Milk transaction deleted successfully")
    );
});

export { addMilk, getAllMilk, updateMilkTransaction, deleteMilkTransaction };
