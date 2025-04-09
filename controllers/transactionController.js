import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Transaction } from "../model/Transaction.js";
import fs from "fs";
import XLSX from "xlsx";
import {Branch} from "../model/Branch.js";
import {SubAdmin} from "../model/SubAdmin.js";
import moment from "moment"
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
    return res.status(400).json({ success: false, message: "Invalid transaction data" });
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
      .json(
        { success: false, message: "Total amount must be greater than zero" });
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
  try {
    // Get today's start and end timestamps
    const startOfDay = moment().startOf("day").toDate();
    const endOfDay = moment().endOf("day").toDate();

    // Fetch transactions only from today
    const transactions = await Transaction.find({
      time: { $gte: startOfDay, $lte: endOfDay }, // Filter transactions for today
    })

    if (!transactions.length) {
      return res
        .status(404)
        .send(new ApiResponse(404, [], "No transactions found for today"));
    }
    return res
      .status(200)
      .send(new ApiResponse(200, transactions, "Today's transactions fetched successfully"));
  } catch (error) {
    console.error("Error fetching today's transactions:", error);
    return res.status(500).send(new ApiResponse(500, null, "Server error"));
  }
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

// Import your transaction model

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
// export const generateReport = async (req, res) => {
//   try {
//     const { reportType } = req.query;
//     const type = reportType;
//     const { startDate, endDate } = getDateRange(type);

//     // Create query filter
//     const query = {
//       time: { $gte: startDate, $lte: endDate },
//     };

//     if (req.subAdmin) {
//       query.subAdmin = req.subAdmin._id;
//     }

//     // Ensure subAdmin and admin fields are populated
//     const transactions = await Transaction.find(query)
//       .populate("items.product");

//     if (!transactions.length) {
//       return res.status(404).json({ message: "No transactions found" });
//     }
    
//     // Ensure branch is retrieved properly
//     const branch = req.subAdmin ? await Branch.findById(req.subAdmin.branch) : null;
    
//     // Prepare data for Excel
//     const reportData = transactions.map((transaction) => ({
//       TransactionID: transaction._id ? transaction._id.toString() : "N/A",
//       CustomerName: transaction.customerName ? transaction.customerName : "N/A",
//       CustomerMobileNumber: transaction.mobileNumber ? transaction.mobileNumber : "N/A",
//       Amount: transaction.amount || "N/A",
//       TransactionDate: transaction.time
//         ? transaction.time.toISOString().replace("T", " ").slice(0, 19)
//         : "N/A", 
//       AdminID: transaction.admin ? transaction.admin._id.toString() : "N/A",
//       SubAdminID: transaction.subAdmin ? transaction.subAdmin._id.toString() : "N/A",
//       BranchID: branch ? branch.branchId : "N/A",
//       Items: transaction.items.length
//         ? transaction.items
//             .map((item) => `Product: ${item.product}, Quantity: ${item.quantity}`)
//             .join("; ")
//         : "N/A",
//     }));

//     // Create Excel file
//     const workbook = XLSX.utils.book_new();
//     const worksheet = XLSX.utils.json_to_sheet(reportData);
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

//     // Define file path
//     const filePath = `./reports/${type}_transactions_${
//       branch ? `branch_${branch.branchName}_` : ""
//     }${Date.now()}.xlsx`;

//     // Write to file
//     XLSX.writeFile(workbook, filePath);

//     // Send file as response
//     res.download(filePath, (err) => {
//       if (err) {
//         console.error("Error sending file:", err);
//         return res.status(500).json({ message: "Error downloading file" });
//       }
//       fs.unlink(filePath, (err) => {
//         if (err) console.error("Error deleting file:", err);
//       });
//     });
//   } catch (error) {
//     console.error("Error generating report:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

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
      .populate("subAdmin");

    if (!transactions.length) {
      return res.status(404).json({ success: false , message: "No transactions found" });
    }

    // Ensure branch is retrieved properly
    const branch = req.subAdmin ? await Branch.findById(req.subAdmin.branch) : null;
    
    // Prepare data for Excel
    const reportData = transactions.map((transaction) => ({
      TransactionID: transaction._id ? transaction._id.toString() : "N/A",
      CustomerMobileNumber: transaction.mobileNumber || "N/A",
      customerName:transaction.customerName || "N/A",
      Amount: transaction.amount || "N/A",
      TransactionDate: transaction.time
        ? transaction.time.toISOString().replace("T", " ").slice(0, 19)
        : "N/A", 
      AdminID: transaction.admin ? transaction.admin._id.toString() : "N/A",
      SubAdmin: transaction.subAdmin ? transaction.subAdmin.subAdminName.toString() : "N/A",
      BranchID: branch ? branch.branchId : "N/A",
      Items: transaction.items.length
        ? transaction.items
            .map((item) => `Product: ${item.productName}, Quantity: ${item.quantity}`)
            .join("; ")
        : "N/A",
    }));

    // Create Excel file
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(reportData);
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
        return res.status(500).json({ success: false , message: "Error downloading file" });
      }
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({success: false, message: error.message });
  }
};

export const getTransactionByMobileNumber= asyncHandler(async (req, res) => {
  try{
  // console.log("are you coming in this")
  const { mobileNumber } = req.params;

  const transaction = await Transaction.findOne({ mobileNumber });
  if (!transaction) {
    throw new ApiError(404, "Transaction not found");
  }
  // if (req.subAdmin) {
  //   query.subAdmin = req.subAdmin._id;
  // }

  // // Ensure subAdmin and admin fields are populated
  // const transactions = await Transaction.find(query)
  //   .populate("items.product");

  if (!transaction.length) {
    return res.status(404).json({ message: "No transactions found" });
  }
  
  // Ensure branch is retrieved properly
  const branch = req.subAdmin ? await Branch.findById(req.subAdmin.branch) : null;
  
  // Prepare data for Excel
  const reportData = {
    TransactionID: transaction._id ? transaction._id.toString() : "N/A",
    CustomerName: transaction.customerName ? transaction.customerName : "N/A",
    CustomerMobileNumber: transaction.mobileNumber ? transaction.mobileNumber : "N/A",
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
  };
  

  // Create Excel file
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(reportData);
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
    fs.unlink(filePath, (err) => {
      if (err) console.error("Error deleting file:", err);
    });
  });
}
 catch (error) {
  console.error("Error generating report:", error);
  res.status(500).json({ message: error.message });
}});

import mongoose from "mongoose";
// Generate Combined Report Function
//This is for the Admin
export const generateCombinedReport = async (req, res) => {
  try {
    const { type } = req.params;
    const { startDate, endDate } = getDateRange(type);

    const query = {
      time: { $gte: startDate, $lte: endDate },
    };
    if (req.subAdmin) {
      query.subAdmin = req.subAdmin._id;
    }

    // Ensure subAdmin and admin fields are populated
    const transactions = await Transaction.find(query)
      .populate("items.product");



    if (!transactions.length) {
      return res.status(404).json({ message: "No transactions found" });
    }
 // Ensure branch is retrieved properly
 const branch = req.subAdmin ? await Branch.findById(req.subAdmin.branch) : null;
    

    // Prepare data for Excel
    const reportData = transactions.map((transaction) => ({
      TransactionID: transaction._id,
      CustomerID: transaction.customer ? transaction.customer._id : "N/A",
      Amount: transaction.amount || "N/A",
      TransactionDate: transaction.time.toISOString().replace("T", " ").slice(0, 19), // Format as YYYY-MM-DD HH:mm:ss
      AdminID: transaction.admin ? transaction.admin._id : "N/A",
      SubAdminID: transaction.subAdmin ? transaction.subAdmin._id : "N/A",
      BranchName: branch ? branch.branchName : "N/A",
      Items: transaction.items.map((item) =>
        `Product: ${item.product ? item.product.name : "N/A"}, Quantity: ${item.quantity}`
      ).join("; "),

    }));

    // Create Excel file
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    // Define file path
    const filePath = `./reports/${type}_transactions_combined_${Date.now()}.xlsx`;

    // Write to file
    XLSX.writeFile(workbook, filePath);

    // Send file as response
    res.download(filePath, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        return res.status(500).json({ message: "Error downloading file" });
      }
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    });
  } catch (error) {
    console.error("Error generating combined report:", error);
    res.status(500).json({ message: error.message });
  }
};

export const generateReportAdmin = async (req, res) => {
  try {
    const { branchId, type } = req.params;
      console.log(branchId);
    const { startDate, endDate } = getDateRange(type);

    // Convert branchId to ObjectId
    if (!mongoose.Types.ObjectId.isValid(branchId)) {
      return res.status(400).json({ message: "Invalid branch ID format" });
    }

    const branch =  Branch.findById(branchId);
    
    // Check if branch exists
    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }
    console.log("Found branch:", branch); 

    const query = { time: { $gte: startDate, $lte: endDate } };

    const subAdmin = await SubAdmin.findOne({ branch: branch._id });
    if (subAdmin) {
      query.subAdmin = subAdmin._id;
    }

    const transactions = await Transaction.find(query)
      .populate("items.product") // Populate Category, not Product
      .populate("subAdmin"); // Populate subAdmin

    if (!transactions.length) {
      return res.status(404).json({ message: "No transactions found" });
    }

    const reportData = transactions.map((transaction) => ({
      TransactionID: transaction._id?.toString() || "N/A",
      CustomerName: transaction.customerName || "N/A",
      CustomerMobileNumber: transaction.mobileNumber || "N/A",
      Amount: transaction.amount || "N/A",
      TransactionDate: transaction.time
        ? transaction.time.toISOString().replace("T", " ").slice(0, 19)
        : "N/A",
      AdminID: transaction.admin?._id?.toString() || "N/A",
      SubAdminID: subAdmin ? subAdmin._id.toString() : "N/A",
      BranchID: branch ? branch._id.toString() : "N/A",
      Items: transaction.items.length
        ? transaction.items
            .map((item) => `Product: ${item.product.name}, Quantity: ${item.quantity}`)
            .join("; ")
        : "N/A",
    }));

    // Create Excel file
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    const filePath = `./reports/${branch.branchName || "unknown"}_transactions_${Date.now()}.xlsx`;

    // Write to file
    XLSX.writeFile(workbook, filePath);

    // Send file as response
    res.download(filePath, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        return res.status(500).json({ message: "Error downloading file" });
      }
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ message: error.message });
  }
};



// combined report  for farmer all in one transaction and loan of a farmer 

// import mongoose from "mongoose";
import { Farmer } from "../model/Farmer.js"; // your schema
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
// import fs from "fs";

 export async function generateFarmerReport(mobileNumber) {
  const farmer = await Farmer.findOne({ mobileNumber });
    console.log(farmer);
  if (!farmer) throw new Error("Farmer not found");

  const fileNameBase = `farmer-report-${farmer.farmerName.replace(" ", "_")}`;

  // ----------------- EXCEL -----------------
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Farmer Report");

  // Milk Transactions
  sheet.addRow(["Milk Transactions"]);
  sheet.addRow([
    "Date", "Time", "Amount", "Milk Type", "Quantity", "SNF", "FAT", "Price/Litre"
  ]);
  farmer.transaction.forEach(t => {
    sheet.addRow([
      t.transactionDate.toISOString().split('T')[0],
      t.transactionTime,
      t.transactionAmount,
      t.milkType,
      t.milkQuantity,
      t.snf,
      t.fat,
      t.pricePerLitre,
    ]);
  });

  sheet.addRow([]);
  sheet.addRow(["Loan Details"]);
  sheet.addRow(["Loan Date", "Original Amount", "Remaining Loan", "Is Deleted", "History"]);

  // Loans
  farmer.loan.forEach(loan => {
    const historyStr = loan.history.map(h =>
      `(${h.operation} - ₹${h.loanAmount} on ${h.changedAt.toISOString().split('T')[0]})`
    ).join("; ");
    
    sheet.addRow([
      loan.loanDate.toISOString().split('T')[0],
      loan.originalAmount,
      loan.loanAmount,
      loan.isDeleted ? "Yes" : "No",
      historyStr
    ]);
  });

  const excelPath = `./${fileNameBase}.xlsx`;
  await workbook.xlsx.writeFile(excelPath);
  console.log(`Excel report saved to ${excelPath}`);

  // // ----------------- PDF -----------------
  // const pdfPath = `./${fileNameBase}.pdf`;
  // const doc = new PDFDocument();
  // doc.pipe(fs.createWriteStream(pdfPath));

  // doc.fontSize(18).text("Farmer Report", { align: "center" });
  // doc.moveDown();
  // doc.fontSize(12).text(`Farmer Name: ${farmer.farmerName}`);
  // doc.text(`Mobile: ${farmer.mobileNumber}`);
  // doc.text(`Address: ${farmer.address}`);
  // doc.text(`Milk Type: ${farmer.milkType}`);
  // doc.text(`Joining Date: ${farmer.joiningDate.toISOString().split('T')[0]}`);
  // doc.moveDown();

  // doc.fontSize(14).text("Milk Transactions:");
  // farmer.transaction.forEach((t, i) => {
  //   doc.text(
  //     `${i + 1}. Date: ${t.transactionDate.toISOString().split('T')[0]}, Time: ${t.transactionTime}, Amount: ₹${t.transactionAmount}, Milk: ${t.milkType}, Qty: ${t.milkQuantity}, SNF: ${t.snf}, FAT: ${t.fat}, Rate: ₹${t.pricePerLitre}/L`
  //   );
  // });

  // doc.moveDown();
  // doc.fontSize(14).text("Loan Details:");
  // farmer.loan.forEach((loan, i) => {
  //   doc.text(
  //     `${i + 1}. Loan Date: ${loan.loanDate.toISOString().split('T')[0]}, Original: ₹${loan.originalAmount}, Remaining: ₹${loan.loanAmount}, Deleted: ${loan.isDeleted ? "Yes" : "No"}`
  //   );
  //   loan.history.forEach((h, j) => {
  //     doc.text(`   - ${j + 1}. ${h.operation.toUpperCase()} ₹${h.loanAmount} on ${h.changedAt.toISOString().split('T')[0]}`);
  //   });
  // });
  
  // doc.end();

  return { excelPath};
}
