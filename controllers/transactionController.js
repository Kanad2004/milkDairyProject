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
      fs.unlinkSync(filePath);
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