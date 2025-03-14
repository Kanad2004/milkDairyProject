import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Transaction } from "../model/Transaction.js";
import fs from "fs";
import XLSX from "xlsx";
import {Branch} from "../model/Branch.js";

// 1. Save a new Transaction
export const saveTransaction = asyncHandler(async (req, res) => {
  const { customerName, mobileNumber, items, time } = req.body;
  const subAdmin = req.subAdmin?._id; // ensure req.subAdmin exists

  // Validate basic transaction input
  if (
    !customerName ||
    !mobileNumber ||
    !items ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return res.status(400).send(new ApiError(400, "Invalid transaction data"));
  }

  let transactionItemList = [];
  let amount = 0;

  // Process each transaction item
  for (const item of items) {
    // Create and save the transaction item in one step.
    transactionItemList.push(item);
    amount += item.pamount;
  }

  // (Optional) Validate that computed amount is greater than zero
  if (amount <= 0) {
    return res
      .status(400)
      .send(new ApiError(400, "Total amount must be greater than zero"));
  }

  // Use provided time or default to now
  const transactionTime = time ? new Date(time) : new Date();

  // Create the transaction
  const transaction = new Transaction({
    customerName,
    mobileNumber,
    items: transactionItemList,
    amount,
    subAdmin,
    time: transactionTime,
  });

  await transaction.save();

  return res
    .status(201)
    .send(new ApiResponse(201, transaction, "Transaction saved successfully"));
});

// 2. Get All Transactions
export const getAllTransactions = asyncHandler(async (req, res) => {
  // Populate items (and optionally other referenced fields)
  const transactions = await Transaction.find().populate("items");
  return res
    .status(200)
    .send(new ApiResponse(200, transactions, "Transactions fetched"));
});

// 3. Update Transaction by ID
export const updateTransactionById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { customerName, mobileNumber, time, items } = req.body;

  if (!customerName || !mobileNumber || !time || !items || !items.length) {
    return res.status(400).json(new ApiResponse(400, null, "Invalid input"));
  }

  // Calculate the updated total amount based on provided items
  let totalAmount = 0;
  items.forEach((item) => {
    totalAmount += item.pamount;
  });

  const updatedTransaction = await Transaction.findByIdAndUpdate(
    id,
    {
      customerName,
      mobileNumber,
      time,
      items,
      amount: totalAmount,
    },
    { new: true }
  );

  if (!updatedTransaction) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Transaction not found"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedTransaction,
        "Transaction updated successfully"
      )
    );
});

// 4. Delete Transaction by ID
export const deleteTransactionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Find and delete the transaction
  const deletedTransaction = await Transaction.findByIdAndDelete(id);
  if (!deletedTransaction) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Transaction not found"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        deletedTransaction,
        "Transaction deleted successfully"
      )
    );
});


// Utility function to get start and end dates
const getDateRange = (type) => {
  const now = new Date();
  let startDate, endDate;

  switch (type) {
    case "daily":
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
      break;

    case "weekly":
      const startOfWeek = new Date(now);
      const dayOfWeek = now.getDay(); // 0 (Sun) to 6 (Sat)
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Monday start
      startOfWeek.setDate(now.getDate() + diff);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      startDate = startOfWeek;
      endDate = endOfWeek;
      break;

    case "monthly":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
      break;

    case "yearly":
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
      endDate.setHours(23, 59, 59, 999);
      break;

    default:
      throw new Error("Invalid report type");
  }

  return { startDate, endDate };
};


// Generate Report Function
//This is for the SubAdmin Only . . . 
//This function is working correctly but I want now what fields should be included in it . . .
export const generateReport = async (req, res) => {
  try {
    const { reportType } = req.query;
    const type = reportType;
    const { startDate, endDate } = getDateRange(type);

    // Create query filter
    const query = {
      time: { $gte: startDate, $lte: endDate },
    };

    if (req.subAdmin) {
      query.subAdmin = req.subAdmin._id;
    }

    // Ensure subAdmin and admin fields are populated
    const transactions = await Transaction.find(query)
      .populate("items subAdmin");

    if (!transactions.length) {
      return res.status(404).json({ message: "No transactions found" });
    }
    
    // Ensure branch is retrieved properly
    const branch = req.subAdmin ? await Branch.findById(req.subAdmin.branch) : null;
    
    // Prepare data for Excel
    const reportData = transactions.map((transaction) => ({
      TransactionID: transaction._id ? transaction._id.toString() : "N/A",
      CustomerMobileNumber: transaction.mobileNumber || "N/A",
      Amount: transaction.amount || "N/A",
      TransactionDate: transaction.time
        ? transaction.time.toISOString().replace("T", " ").slice(0, 19)
        : "N/A", 
      AdminID: transaction.admin ? transaction.admin._id.toString() : "N/A",
      SubAdminID: transaction.subAdmin ? transaction.subAdmin._id.toString() : "N/A",
      BranchID: branch ? branch.branchId : "N/A",
      Items: transaction.items.length
        ? transaction.items
            .map((item) => `Product: ${item.product}, Quantity: ${item.quantity}`)
            .join("; ")
        : "N/A",
    }));

    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(reportData);

    // Append worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    // Define file path
    const filePath = `./reports/${type}_transactions_${
      branch ? `branch_${branch.branchName}_` : ""
    }${Date.now()}.xlsx`;

    // Write to file
    XLSX.writeFile(workbook, filePath);

    // Send file as response
    res.download(filePath, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        return res.status(500).json({ message: "Error downloading file" });
      }
      // Delete file after sending
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ message: error.message });
  }
};


// Generate Combined Report Function
//This is for the Admin
export const generateCombinedReport = async (req, res) => {
  try {
    const { type } = req.params;
    const { startDate, endDate } = getDateRange(type);

    // Create query filter for all branches
    const transactions = await Transaction.find({
      time: { $gte: startDate, $lte: endDate },
    }).populate("items subAdmin");

    if (!transactions.length) {
      return res.status(404).json({ message: "No transactions found" });
    }

    const branch = Branch.findById(req.subAdmin.branch)

    // Prepare data for Excel
    const reportData = transactions.map((transaction) => ({
      TransactionID: transaction._id,
      CustomerMobileNumber: transaction.mobileNumber,
      Amount: transaction.amount || "N/A",
      TransactionDate: transaction.time.toISOString().replace("T", " ").slice(0, 19), // Format as YYYY-MM-DD HH:mm:ss
      AdminID: transaction.admin ? transaction.admin._id : "N/A",
      SubAdminID: transaction.subAdmin ? transaction.subAdmin._id : "N/A",
      BranchNAME: branch.branchName ? branch.branchName : "N/A",
      Items: transaction.items.map((item) => `Product: ${item.product}, Quantity: ${item.quantity}`).join("; "),
    }));

    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(reportData);

    // Append worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    // Define file path for combined report
    const filePath = `./reports/${type}_transactions_combined_${Date.now()}.xlsx`;

    // Write to file
    XLSX.writeFile(workbook, filePath);

    // Send file as response
    res.download(filePath, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        return res.status(500).json({ message: "Error downloading file" });
      }
      // Delete file after sending
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
