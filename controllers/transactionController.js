// import { Transaction } from "../models/Transaction.js";
// import moment from "moment";
// import XLSX from "xlsx";
// import fs from "fs";



// //Report 



// /**
//  * @desc Generate Excel report
//  * @route GET /api/reports/:type
//  * @param {string} type - daily, weekly, monthly, yearly
//  */
// export const generateReport = async (req, res) => {
//   try {
//     const { type, branchName } = req.params;

//     let startDate, endDate;

//     switch (type) {
//       case "daily":
//         startDate = moment().startOf("day").toDate();
//         endDate = moment().endOf("day").toDate();
//         break;

//       case "weekly":
//         startDate = moment().startOf("week").toDate();
//         endDate = moment().endOf("week").toDate();
//         break;

//       case "monthly":
//         startDate = moment().startOf("month").toDate();
//         endDate = moment().endOf("month").toDate();
//         break;

//       case "yearly":
//         startDate = moment().startOf("year").toDate();
//         endDate = moment().endOf("year").toDate();
//         break;

//       default:
//         return res.status(400).json({ message: "Invalid report type" });
//     }

//     const transactions = await Transaction.find({
//       transactionDate: { $gte: startDate, $lte: endDate },
//     }).populate("customer items admin subAdmin");

//     if (!transactions.length) {
//       return res.status(404).json({ message: "No transactions found" });
//     }

//     // Prepare data for Excel
//     const reportData = transactions.map((transaction) => ({
//       TransactionID: transaction._id,
//       CustomerID: transaction.customer._id,
//       Amount: transaction.amount,
//       TransactionDate: moment(transaction.transactionDate).format("YYYY-MM-DD HH:mm:ss"),
//       AdminID: transaction.admin ? transaction.admin._id : "N/A",
//       SubAdminID: transaction.subAdmin ? transaction.subAdmin._id : "N/A",
//       Items: transaction.items.map((item) => `Product: ${item.product}, Quantity: ${item.quantity}`).join("; "),
//     }));

//     // Create a new workbook
//     const workbook = XLSX.utils.book_new();
//     const worksheet = XLSX.utils.json_to_sheet(reportData);

//     // Append worksheet to workbook
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

//     // Define file path
//     const filePath = `./reports/${type}_transactions_${Date.now()}.xlsx`;

//     // Write to file
//     XLSX.writeFile(workbook, filePath);

//     // Send file as response
//     res.download(filePath, (err) => {
//       if (err) {
//         console.error("Error sending file:", err);
//         res.status(500).json({ message: "Error downloading file" });
//       }
//       // Delete file after sending
//       fs.unlinkSync(filePath);
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Transaction } from "../model/Transaction.js";
import { TransactionItem } from "../model/TransactionItem.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Product } from "../model/Product.js";
import moment from "moment";
import XLSX from "xlsx";
import fs from "fs";

// 1. Add Item
export const addItem = asyncHandler(async (req, res) => {
  try {
    const { productId, quantity, pamount } = req.body;

    // Validate input
    if (!productId || !quantity || quantity <= 0 || !pamount || pamount <= 0) {
      return res.status(400).json({ error: "Invalid product or quantity" });
    }

    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Create a transaction item
    const transactionItem = new TransactionItem({
      product: productId,
      quantity,
      pamount,
    });
    await transactionItem.save();

    return res
      .status(201)
      .send(new ApiResponse(201, transactionItem, "Item added successfully"));
  } catch (error) {
    return res.status(500).send(new ApiError(500, "Internal server error"));
  }
});

// 2. Save Whole Transaction
export const saveTransaction = async (req, res) => {
  try {
    const { customerName, mobileNumber, items, amount, adminId, subAdminId } =
      req.body;

    // Validate input
    if (
      !customerName ||
      !mobileNumber ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !amount
    ) {
      return res
        .status(400)
        .send(new ApiError(400, "Invalid transaction data"));
    }

    // Verify all transaction items
    // for (const itemId of items) {
    //   const transactionItem = await TransactionItem.findById(itemId);

            const transactionItems = await Promise.all(items.map((itemId) => TransactionItem.findById(itemId)));
          if (transactionItems.includes(null)) {
          return res.status(404).send(new ApiError(404, "Some transaction items not found"));
      }

      if (!transactionItem) {
        return res
          .status(404)
          .send(new ApiError(404, `Transaction item ${itemId} not found`));
      }
      // else {
      //   amount+=transactionItem.pamount;
      // }
    

    // Create the transaction
    const transaction = new Transaction({
      customerName,
      mobileNumber,
      items,
      amount,
      admin: adminId || null,
      subAdmin: subAdminId || null,
      time: new Date(),
    });
    await transaction.save();

    return res
      .status(201)
      .send(
        new ApiResponse(201, transaction, "Transaction saved successfully")
      );
  } catch (error) {
    return res.status(500).send(new ApiError(500, "Internal server error"));
  }
};

// delete transaction 
export const deleteTransaction = async (req, res) => {
  try {
    const { mobileNumber } = req.body;

    if (!mobileNumber || mobileNumber.length !== 10) 
    {
      return res
      .status(404)
      .send( new ApiError(404, `Enter proper mobile number `))
    }
    const trans = await Transaction.findOne({mobileNumber});
    if(!trans)
    {
      return res
      .status(404)
      .send(new ApiError(404, `Transaction not found`))
    }
    await Transaction.deleteOne({ _id: trans._id });
    return res
      .status(200)
      .send(
        new ApiResponse(200, trans, "Transaction deleted successfully")
      );
  } catch(error){
    return res.status(500).send(new ApiError(500, "Internal server error"));
  }

}

export const generateReport = async (req, res) => {
  try {
    const { type, branchName } = req.params;

    let startDate, endDate;

    // Set the date range based on the report type
    switch (type) {
      case "daily":
        startDate = moment().startOf("day").toDate();
        endDate = moment().endOf("day").toDate();
        break;

      case "weekly":
        startDate = moment().startOf("week").toDate();
        endDate = moment().endOf("week").toDate();
        break;

      case "monthly":
        startDate = moment().startOf("month").toDate();
        endDate = moment().endOf("month").toDate();
        break;

      case "yearly":
        startDate = moment().startOf("year").toDate();
        endDate = moment().endOf("year").toDate();
        break;

      default:
        return res.status(400).json({ message: "Invalid report type" });
    }

    // Create query filter
    const query = {
      transactionDate: { $gte: startDate, $lte: endDate },
    };

    // If branchName is provided, filter by branchName
    if (branchName) {
      query.branchName = branchName;
    }

    const transactions = await Transaction.find(query)
      .populate("customer items admin subAdmin branch");

    if (!transactions.length) {
      return res.status(404).json({ message: "No transactions found" });
    }

    // Prepare data for Excel
    const reportData = transactions.map((transaction) => ({
      TransactionID: transaction._id,
      CustomerID: transaction.customer._id,
      Amount: transaction.amount,
      TransactionDate: moment(transaction.transactionDate).format("YYYY-MM-DD HH:mm:ss"),
      AdminID: transaction.admin ? transaction.admin._id : "N/A",
      SubAdminID: transaction.subAdmin ? transaction.subAdmin._id : "N/A",
      BranchNAME: transaction.branch ? transaction.branch.branchName : "N/A",
      Items: transaction.items.map((item) => `Product: ${item.product}, Quantity: ${item.quantity}`).join("; "),
      Amount:transaction.amount? transaction.amount : "N/A",

    }));

    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(reportData);

    // Append worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    // Define file path
    const filePath = `./reports/${type}_transactions_${branchName ? `branch_${branchName}_` : ''}${Date.now()}.xlsx`;

    // Write to file
    XLSX.writeFile(workbook, filePath);

    // Send file as response
    res.download(filePath, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(500).json({ message: "Error downloading file" });
      }
      // Delete file after sending
      // fs.unlinkSync(filePath);
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
      
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const generateCombinedReport = async (req, res) => {
  try {
    const { type } = req.params;

    let startDate, endDate;

    // Set the date range based on the report type
    switch (type) {
      case "daily":
        startDate = moment().startOf("day").toDate();
        endDate = moment().endOf("day").toDate();
        break;

      case "weekly":
        startDate = moment().startOf("week").toDate();
        endDate = moment().endOf("week").toDate();
        break;

      case "monthly":
        startDate = moment().startOf("month").toDate();
        endDate = moment().endOf("month").toDate();
        break;

      case "yearly":
        startDate = moment().startOf("year").toDate();
        endDate = moment().endOf("year").toDate();
        break;

      default:
        return res.status(400).json({ message: "Invalid report type" });
    }

    // Create query filter for all branches (no branchName filter)
    const transactions = await Transaction.find({
      transactionDate: { $gte: startDate, $lte: endDate },
    }).populate("customer items admin subAdmin branch");

    if (!transactions.length) {
      return res.status(404).json({ message: "No transactions found" });
    }

    // Prepare data for Excel
    const reportData = transactions.map((transaction) => ({
      TransactionID: transaction._id,
      CustomerID: transaction.customer._id,
      Amount: transaction.amount,
      TransactionDate: moment(transaction.transactionDate).format("YYYY-MM-DD HH:mm:ss"),
      AdminID: transaction.admin ? transaction.admin._id : "N/A",
      SubAdminID: transaction.subAdmin ? transaction.subAdmin._id : "N/A",
      BranchNAME: transaction.branch ? transaction.branch.branchName : "N/A",
      Items: transaction.items.map((item) => `Product: ${item.product}, Quantity: ${item.quantity}`).join("; "),
      Amount:transaction.amount? transaction.amount : "N/A",
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
        res.status(500).json({ message: "Error downloading file" });
      }
      // Delete file after sending
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};