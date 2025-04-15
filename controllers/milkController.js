import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Farmer } from "../model/Farmer.js";
import { SubAdmin } from "../model/SubAdmin.js";
import mongoose from "mongoose";
import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";
import { Branch } from "../model/Branch.js";
import moment from "moment"

// Add Milk Transaction
const addMilk = asyncHandler(async (req, res) => {
  const {
    farmerId,
    farmerNumber,
    transactionDate,
    pricePerLitre,
    milkQuantity,
    milkType,
    transactionAmount,
    snfPercentage,
    fatPercentage,
    transactionTime,
  } = req.body;

  const farmer = await Farmer.findOne({ farmerId: farmerId, subAdmin: req.subAdmin._id });
  if (!farmer) {
    throw new ApiError(404, "Farmer with this Id in this branch not found");
  }

  if (!transactionDate || !pricePerLitre || !milkQuantity) {
    throw new ApiError(400, "All fields are required");
  }

  if (pricePerLitre < 0 || milkQuantity < 0) {
    throw new ApiError(400, "Amount and Quantity cannot be negative");
  }
  const loanIndex = farmer.loan.findIndex(loan => !loan.isDeleted && loan.loanAmount > 0);

  if(loanIndex !== -1){
    if (transactionAmount >= farmer.totalLoanRemaining) {
  
      farmer.totalLoanRemaining = 0;
      farmer.totalLoanPaidBack += farmer.loan[loanIndex].loanAmount;
      farmer.loan[loanIndex].loanAmount = 0;
      farmer.loan[loanIndex].isDeleted = true;
      
      farmer.loan[loanIndex].history.push({
        changedAt: new Date(),
        loanDate: farmer.loan[loanIndex].loanDate,
        loanAmount: farmer.loan[loanIndex].loanAmount,
        operation: "deduct",
      });
  
      farmer.loan[loanIndex].history.push({
        changedAt: new Date(),
        loanDate: farmer.loan[loanIndex].loanDate,
        loanAmount: farmer.loan[loanIndex].loanAmount,
        operation: "delete",
      });
    } else {
      
      farmer.totalLoanRemaining = farmer.totalLoanRemaining - Number(transactionAmount);
      farmer.loan[loanIndex].loanAmount =
      farmer.loan[loanIndex].loanAmount - Number(transactionAmount);
      farmer.totalLoanPaidBack += Number(transactionAmount) ;

        farmer.loan[loanIndex].history.push({
          changedAt: new Date(),
          loanDate: farmer.loan[loanIndex].loanDate,
          loanAmount: farmer.loan[loanIndex].loanAmount,
          operation: "deduct",
        });
    }
  }
  let tmptransactionAmount = Number(transactionAmount);
  farmer.transaction.push({
    transactionDate,
    transactionAmount : tmptransactionAmount,
    milkQuantity,
    milkType,
    snf: snfPercentage,
    fat:fatPercentage,
    transactionTime,
    pricePerLitre
  });

  const savedFarmer = await farmer.save();
  const farmerWithSubAdmin = await Farmer.findById(savedFarmer._id).populate(
    "subAdmin"
  );

  return res
    .status(200)
    .send(new ApiResponse(200, farmerWithSubAdmin, "Milk added successfully"));
});


// Get All Milk Transactions (Grouped by Farmer) Updated this for getting the transacitons of today only asks to peer  . . . 
const getAllMilk = asyncHandler(async (req, res) => {
  const farmers = await Farmer.find({ subAdmin: req.subAdmin._id });
  if (!farmers || farmers.length === 0) {
    throw new ApiError(404, "No farmers found");
  }
  const startOfDay = moment().startOf("day").toDate();
  const endOfDay = moment().endOf("day").toDate();

  let allMilk = [];
  farmers.forEach((farmer) => {
    const tmpTransactions = farmer.transaction.filter((tx) => {
      const txDate = new Date(tx.transactionDate);
      return txDate >= startOfDay && txDate <= endOfDay;
    });

    // Include mobileNumber as farmerNumber so frontend can flatten the data properly
    let milk = {
      farmerName: farmer.farmerName,
      farmerId: farmer.farmerId ,
      mobileNumber: farmer.mobileNumber,
      transaction: farmer.transaction ,
    };
    allMilk.push(milk);
  });

  return res
    .status(200)
    .json(new ApiResponse(200, allMilk, "Milk fetched successfully"));
});

// Update Milk Transaction
const updateMilkTransaction = asyncHandler(async (req, res) => {
  const { farmerId, transactionId } = req.params;
  const { transactionDate, pricePerLitre, milkQuantity, milkType } = req.body;

  if (!transactionDate || !pricePerLitre || !milkQuantity) {
    throw new ApiError(400, "All fields are required");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1️⃣ Find the farmer
    const farmer = await Farmer.findOne({ farmerId: farmerId, subAdmin: req.subAdmin._id }).session(session);
    if (!farmer) {
      throw new ApiError(404, "Farmer not found");
    }

    // 2️⃣ Find the transaction
    const transaction = farmer.transaction.id(transactionId);
    if (!transaction) {
      throw new ApiError(404, "Milk transaction not found");
    }

    // 3️⃣ Store the original transaction amount
    const oldTransactionAmount = transaction.transactionAmount;

    // 4️⃣ Update the transaction details
    transaction.transactionDate = new Date(transactionDate);
    transaction.milkQuantity = milkQuantity;
    transaction.milkType = milkType;
    transaction.transactionAmount = pricePerLitre * milkQuantity;
    const newTransactionAmount = transaction.transactionAmount;

    // 5️⃣ Handle Loan Adjustments if transactionAmount changes
    if (oldTransactionAmount !== newTransactionAmount) {
      let amountDifference = newTransactionAmount - oldTransactionAmount;
    
      if (farmer.totalLoanRemaining > 0) {
        let remainingToAdjust = Math.abs(amountDifference);
        
        for (let loan of farmer.loan) {
          if (!loan.isDeleted && loan.loanAmount > 0 && remainingToAdjust > 0) {
            let adjustment = Math.min(remainingToAdjust, loan.loanAmount);
    
            if (amountDifference < 0) {
              // 🔹 Revert Deduction (Decrease Transaction Amount)
              let maxRevertable = loan.history.reduce((sum, h) => h.operation === "deduct" ? sum + h.loanAmount : sum, 0);
              let revertAmount = Math.min(adjustment, maxRevertable);
              
              loan.loanAmount += revertAmount;
              farmer.totalLoanRemaining += revertAmount;
              farmer.totalLoanPaidBack = Math.max(0, farmer.totalLoanPaidBack - revertAmount); // 🔹 Prevents negative values
    
              loan.history.push({
                changedAt: new Date(),
                loanDate: loan.loanDate,
                loanAmount: loan.loanAmount,
                operation: "revert",
              });
    
            } else {
              // 🔹 Deduct Loan Amount (Increase Transaction Amount)
              loan.loanAmount -= adjustment;
              farmer.totalLoanRemaining -= adjustment;
              farmer.totalLoanPaidBack += adjustment;
    
              if (loan.loanAmount <= 0) {
                loan.isDeleted = true;
                loan.loanAmount = 0;
              }
    
              loan.history.push({
                changedAt: new Date(),
                loanDate: loan.loanDate,
                loanAmount: loan.loanAmount,
                operation: "deduct",
              });
            }
    
            remainingToAdjust -= adjustment;
          }
        }
      }
    }    

    // 7️⃣ Save updated farmer and transaction details
    await farmer.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json(new ApiResponse(200, farmer, "Milk transaction updated successfully"));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new ApiError(500, "Error updating milk transaction", error);
  }
});


// Delete Milk Transaction
const deleteMilkTransaction = asyncHandler(async (req, res) => {
  const { farmerId, transactionId } = req.params;

  const farmer = await Farmer.findOne({ farmerId: farmerId , subAdmin: req.subAdmin._id });
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
