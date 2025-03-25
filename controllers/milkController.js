import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Farmer } from "../model/Farmer.js";
import { SubAdmin } from "../model/SubAdmin.js";

import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";
import { Branch } from "../model/Branch.js";

// Add Milk Transaction
const addMilk = asyncHandler(async (req, res) => {
  const {
    farmerNumber,
    transactionDate,
    pricePerLitre,
    milkQuantity,
    milkType,
    transactionAmount,
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

  let loanArraySize = farmer.loan.length;

  if (transactionAmount >= farmer.totalLoanRemaining) {
    farmer.totalLoanRemaining = 0;
    farmer.loan[loanArraySize - 1].loanAmount = 0;
    farmer.loan[loanArraySize - 1].isDeleted = true;

    farmer.loan[loanArraySize - 1].history.push({
      changedAt: new Date(),
      loanDate: farmer.loan[loanArraySize - 1].loanDate,
      loanAmount: farmer.loan[loanArraySize - 1].loanAmount,
      operation: "deduct",
    });

    farmer.loan[loanArraySize - 1].history.push({
      changedAt: new Date(),
      loanDate: farmer.loan[loanArraySize - 1].loanDate,
      loanAmount: farmer.loan[loanArraySize - 1].loanAmount,
      operation: "delete",
    });
  } else {
    farmer.totalLoanRemaining = farmer.totalLoanRemaining - transactionAmount;
    farmer.loan[loanArraySize - 1].loanAmount =
      farmer.loan[loanArraySize - 1].loanAmount - transactionAmount;

    farmer.loan[loanArraySize - 1].history.push({
      changedAt: new Date(),
      loanDate: farmer.loan[loanArraySize - 1].loanDate,
      loanAmount: farmer.loan[loanArraySize - 1].loanAmount,
      operation: "deduct",
    });
  }

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

// Get transactions of a farmer by mobile number (Admin & SubAdmin restricted)
export const getFarmerTransactionByMobileNumber = async (req, res, next) => {
  try {
    const { mobileNumber } = req.params;

    if (!mobileNumber) {
      return next(new ApiError(400, "Mobile number is required"));
    }

    let query = { mobileNumber };

    // If SubAdmin, restrict access to their branch only
    if (req.subAdmin) {
      query.subAdmin = req.subAdmin._id;
    }

    const farmer = await Farmer.findOne(query).select("farmerName transaction");
    if (!farmer) {
      return next(new ApiError(404, "Farmer not found"));
    }

    res.status(200).json({ success: true, transactions: farmer.transaction });
  } catch (error) {
    next(new ApiError(500, "Server error"));
  }
};

// Get all transactions for a branch (Daily, Weekly, Monthly) for Admin & SubAdmin
const getAllFarmersTransactionReportOfBranch = async (req, res, next) => {
  try {
    const { timeFrame } = req.query; // daily, weekly, monthly
    if (!timeFrame || !["daily", "weekly", "monthly"].includes(timeFrame)) {
      return next(
        new ApiError(400, "Invalid time frame (daily, weekly, monthly)")
      );
    }

    let dateFilter = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (timeFrame === "daily") {
      dateFilter = { transactionDate: { $gte: today } };
    } else if (timeFrame === "weekly") {
      const weekStart = new Date();
      weekStart.setDate(today.getDate() - 7);
      dateFilter = { transactionDate: { $gte: weekStart } };
    } else if (timeFrame === "monthly") {
      const monthStart = new Date();
      monthStart.setDate(1);
      dateFilter = { transactionDate: { $gte: monthStart } };
    }

    // let query = { "transaction.transactionDate": dateFilter };
    let query = { transaction: { $elemMatch: dateFilter } };

    // If SubAdmin, restrict access to their branch only
    if (req.subAdmin) {
      query.subAdmin = req.subAdmin._id;
    }

    const farmers = await Farmer.find(query).select("farmerName transaction");

    let transactions = [];
    farmers.forEach((farmer) => {
      transactions = transactions.concat(
        farmer.transaction.filter(
          (t) => t.transactionDate >= dateFilter.transactionDate.$gte
        )
      );
    });

    res.status(200).json({ success: true, transactions });
  } catch (error) {
    next(new ApiError(500, "Server error"));
  }
};

/**
 * Generate Excel report for a single farmer's transactions based on mobile number
 */
const getFarmerTransactionReportByMobileNumber = async (req, res, next) => {
  try {
    const { mobileNumber } = req.params;

    if (!mobileNumber) {
      return next(new ApiError(400, "Mobile number is required"));
    }

    const farmer = await Farmer.findOne({ mobileNumber: String(mobileNumber) });

    console.log(1);
    if (!farmer || !farmer.transaction || farmer.transaction.length === 0) {
      return next(
        new ApiError(404, "No transactions found for this mobile number")
      );
    }

    // Create an Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Farmer Transactions");

    // Add headers
    worksheet.columns = [
      { header: "Farmer Name", key: "farmerName", width: 20 },
      { header: "Mobile Number", key: "mobileNumber", width: 15 },
      { header: "Transaction Date", key: "transactionDate", width: 15 },
      { header: "Transaction Amount", key: "transactionAmount", width: 15 },
      { header: "Milk Quantity (L)", key: "milkQuantity", width: 15 },
      { header: "Milk Type", key: "milkType", width: 15 },
    ];
    console.log(2);
    // Add transaction data
    farmer.transaction.forEach((t) => {
      worksheet.addRow({
        farmerName: farmer.farmerName,
        mobileNumber: farmer.mobileNumber,
        transactionDate: t.transactionDate.toISOString().split("T")[0],
        transactionAmount: t.transactionAmount,
        milkQuantity: t.milkQuantity,
        milkType: t.milkType,
      });
    });

    // Style the header row
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center" };
    });

    // Define file path
    const filePath = path.join(
      "reports",
      `Farmer_Transactions_${mobileNumber}.xlsx`
    );

    // Ensure reports directory exists
    if (!fs.existsSync("reports")) {
      fs.mkdirSync("reports");
    }

    // Write the file
    await workbook.xlsx.writeFile(filePath);

    // Send file as response
    res.download(
      filePath,
      `Farmer_Transactions_${mobileNumber}.xlsx`,
      (err) => {
        if (err) {
          next(new ApiError(500, "Error downloading the file"));
        }
      }
    );
  } catch (error) {
    next(new ApiError(500, "Server error"));
  }
};

/**
 * Generate Excel report for all farmers in a specific branch
 */
const getAllFarmersTransactionReportsOfBranch = async (req, res, next) => {
  try {
    const subAdminId = req.subAdmin._id;

    const subAdmin = await SubAdmin.findById(subAdminId);

    const branch = await Branch.find({ branch: subAdmin.branch });

    if (!subAdminId) {
      return next(new ApiError(400, "Branch ID is required"));
    }

    const farmers = await Farmer.find({ subAdmin: subAdminId }).select(
      "farmerName mobileNumber transaction"
    );

    if (!farmers.length) {
      return next(new ApiError(404, "No farmers found in this branch"));
    }
    console.log(1);

    let transactions = [];

    farmers.forEach((farmer) => {
      farmer.transaction.forEach((t) => {
        transactions.push({
          farmerName: farmer.farmerName,
          mobileNumber: farmer.mobileNumber,
          transactionDate: t.transactionDate.toISOString().split("T")[0],
          transactionAmount: t.transactionAmount,
          milkQuantity: t.milkQuantity,
          milkType: t.milkType,
        });
      });
    });

    if (transactions.length === 0) {
      return next(new ApiError(404, "No transactions found in this branch"));
    }
    console.log(2);
    // Create an Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Branch Transactions");

    // Add headers
    worksheet.columns = [
      { header: "Farmer Name", key: "farmerName", width: 20 },
      { header: "Mobile Number", key: "mobileNumber", width: 15 },
      { header: "Transaction Date", key: "transactionDate", width: 15 },
      { header: "Transaction Amount", key: "transactionAmount", width: 15 },
      { header: "Milk Quantity (L)", key: "milkQuantity", width: 15 },
      { header: "Milk Type", key: "milkType", width: 15 },
    ];

    // Add transaction data
    worksheet.addRows(transactions);

    // Style the header row
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center" };
    });
    console.log(3);
    // Define file path
    const filePath = path.join(
      "reports",
      `Branch_Transactions_${branch.branchId}.xlsx`
    );
    console.log(4);
    // Ensure reports directory exists
    if (!fs.existsSync("reports")) {
      fs.mkdirSync("reports");
    }
    //  fs.mkdir("reports", { recursive: true }); // Creates if not exists
    // Write the file
    await workbook.xlsx.writeFile(filePath);
    console.log(4);
    // Send file as response
    res.download(
      filePath,
      `Branch_Transactions_${branch.branchId}.xlsx`,
      (err) => {
        if (err) {
          next(new ApiError(500, "Error downloading the file"));
        }
      }
    );
  } catch (error) {
    next(new ApiError(500, "Internal Server error"));
  }
};

export {
  addMilk,
  getAllMilk,
  updateMilkTransaction,
  deleteMilkTransaction,
  getFarmerTransactionReportByMobileNumber,
  getAllFarmersTransactionReportsOfBranch,
  getAllFarmersTransactionReportOfBranch,
};
