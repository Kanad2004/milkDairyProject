

// Farmer transaction report 


import { Farmer } from "../model/Farmer.js";
import moment from "moment";
import XLSX from "xlsx";
import fs from "fs";


/**
 * @desc Generate Excel report for farmer transactions
 * @route GET /api/farmer-reports/:type
 * @param {string} type - daily, weekly, monthly, yearly
 */
export const generateFarmerReport = async (req, res) => {
  try {
    const { type } = req.params;

    let startDate, endDate;

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

    // Fetch all farmers
    const farmers = await Farmer.find();

    if (!farmers.length) {
      return res.status(404).json({ message: "No farmers found" });
    }

    // Prepare the Excel data
    let reportData = [];

    farmers.forEach((farmer) => {
      // Filter transactions within the selected date range
      const filteredTransactions = farmer.transaction.filter((txn) =>
        moment(txn.transactionDate).isBetween(startDate, endDate, null, "[]")
      );

      // Add each transaction as a separate row
      filteredTransactions.forEach((txn) => {
        reportData.push({
          FarmerID: farmer._id.toString(),
          FarmerName: farmer.farmerName,
          MobileNumber: farmer.mobileNumber,
          Address: farmer.address,
          TransactionDate: moment(txn.transactionDate).format("YYYY-MM-DD HH:mm:ss"),
          TransactionAmount: txn.transactionAmount,
          MilkQuantity: txn.milkQuantity,
          TotalLoan: farmer.totalLoan,
          TotalLoanPaidBack: farmer.totalLoanPaidBack,
          TotalLoanRemaining: farmer.totalLoanRemaining,
        });
      });
    });

    if (reportData.length === 0) {
      return res.status(404).json({ message: "No transactions found in the selected period" });
    }

    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(reportData);

    // Append worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Farmer Transactions");

    // Define file path
    const filePath = `./reports/farmer_${type}_transactions_${Date.now()}.xlsx`;

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
    console.error("Error generating report:", error);
    res.status(500).json({ message: error.message });
  }
};

