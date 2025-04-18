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

// // Get transactions of a farmer by mobile number (Admin & SubAdmin restricted)
// export const getFarmerTransactionByMobileNumber = async (req, res, next) => {
//   try {
//     const { mobileNumber } = req.params;

//     if (!mobileNumber) {
//       return next(new ApiError(400, "Mobile number is required"));
//     }

//     let query = { mobileNumber };

//     // If SubAdmin, restrict access to their branch only
//     if (req.subAdmin) {
//       query.subAdmin = req.subAdmin._id;
//     }

//     const farmer = await Farmer.findOne(query).select("farmerName transaction");
//     if (!farmer) {
//       return next(new ApiError(404, "Farmer not found"));
//     }

//     res.status(200).json({ success: true, transactions: farmer.transaction });
//   } catch (error) {
//     next(new ApiError(500, "Server error"));
//   }
// };

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

import PDFDocument from 'pdfkit';

export const downloadBranchTransactionReport = async (req, res) => {
  try {
    const { start, end } = req.params;
    const subAdminId = req.subAdmin._id;

    const startDate = new Date(start);
    const endDate = new Date(end);

    const farmers = await Farmer.find({ subAdmin: subAdminId });

    if (!farmers.length) {
      return res.status(404).json({ message: 'No farmers found' });
    }

    let allTransactions = [];
    farmers.forEach(farmer => {
      farmer.transaction.forEach(t => {
        const tDate = new Date(t.transactionDate);
        if (tDate >= startDate && tDate <= endDate) {
          allTransactions.push({
            farmerName: farmer.farmerName,
            mobileNumber: farmer.mobileNumber,
            address: farmer.address,
            joiningDate: farmer.joiningDate,
            totalLoan: farmer.totalLoan,
            totalLoanPaidBack: farmer.totalLoanPaidBack,
            totalLoanRemaining: farmer.totalLoanRemaining,
            ...t,
          });
        }
      });
    });

    if (!allTransactions.length) {
      return res.status(404).json({ message: 'No transactions found' });
    }

    const fileName = `Branch_Report_${start}_${end}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    const doc = new PDFDocument({ margins: { top: 50, bottom: 50, left: 50, right: 50 }, size: 'A4' });
    doc.pipe(res);

    // Header
    doc.rect(50, 40, 495, 70).fillAndStroke('#F0F8FF', '#003366');
    doc.fontSize(22).fillColor('#003366').text('BRANCH MILK REPORT', 50, 55, { align: 'center' });
    doc.fontSize(10).fillColor('#003366').text(`Date Range: ${start} to ${end}`, 50, 85, { align: 'center' });

    doc.moveDown(4);
    doc.fontSize(16).fillColor('#003366').text('TRANSACTION SUMMARY', { align: 'center', underline: true });
    doc.moveDown();

    let currentY = doc.y;

    const drawTransactionTable = (title, transactions, startY) => {
      if (!transactions.length) return startY;
      doc.fontSize(12).fillColor('#003366').text(title, 50, startY, { underline: true });
      startY += 20;
      doc.rect(50, startY, 495, 20).fillAndStroke('#003366', '#003366');
      doc.fillColor('#FFFFFF').fontSize(10);
      doc.text('Farmer', 55, startY + 6);
      doc.text('Qty (L)', 180, startY + 6);
      doc.text('Rate (₹)', 240, startY + 6);
      doc.text('Amount (₹)', 310, startY + 6);
      doc.text('Fat', 390, startY + 6);
      doc.text('SNF', 430, startY + 6);
      doc.text('Date', 470, startY + 6);

      startY += 20;
      let totalLiters = 0;
      let totalAmount = 0;

      transactions.forEach((t, index) => {
        if (index % 2 === 0) doc.rect(50, startY, 495, 20).fillAndStroke('#F8F9FA', '#CCE5FF');
        else doc.rect(50, startY, 495, 20).fillAndStroke('#FFFFFF', '#CCE5FF');

        const amount = t.milkQuantity * t.pricePerLitre;
        totalLiters += t.milkQuantity;
        totalAmount += amount;

        doc.fillColor('#000000').fontSize(9);
        doc.text(t.farmerName, 55, startY + 6);
        doc.text(t.milkQuantity.toFixed(2), 180, startY + 6);
        doc.text(t.pricePerLitre.toFixed(2), 240, startY + 6);
        doc.text(amount.toFixed(2), 310, startY + 6);
        doc.text(t.fat.toFixed(1), 390, startY + 6);
        doc.text(t.snf.toFixed(1), 430, startY + 6);
        doc.text(new Date(t.transactionDate).toLocaleDateString(), 470, startY + 6);

        startY += 20;
      });

      // Totals row
      doc.rect(50, startY, 495, 22).fillAndStroke('#E6F2FF', '#003366');
      doc.fillColor('#003366').fontSize(10).font('Helvetica-Bold');
      doc.text('TOTAL', 55, startY + 6);
      doc.text(totalLiters.toFixed(2), 180, startY + 6);
      doc.text(totalAmount.toFixed(2), 310, startY + 6);

      return startY + 30;
    };

    const morning = allTransactions.filter(t => t.transactionTime.toLowerCase() === 'morning');
    const evening = allTransactions.filter(t => t.transactionTime.toLowerCase() === 'evening');

    if (morning.length) currentY = drawTransactionTable('MORNING TRANSACTIONS', morning, currentY);
    if (evening.length) currentY = drawTransactionTable('EVENING TRANSACTIONS', evening, currentY);

    // Add footer
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.moveTo(50, 780).lineTo(545, 780).stroke('#003366');
      doc.fontSize(8).fillColor('#666666')
        .text(`Milkman Management System - Report generated on ${new Date().toLocaleString()}`, 50, 790)
        .text(`Page ${i + 1} of ${pageCount}`, 450, 790);
    }

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error generating PDF' });
  }
};

export const getFarmerTransactionByFarmerID = async (req, res, next) => {
  try {
    const { farmerId, start, end } = req.params;

    if (!farmerId || !start || !end) {
      return next(new ApiError(400, 'Farmer ID, start, and end dates are required'));
    }

    const farmer = await Farmer.findById(farmerId);
    if (!farmer || !farmer.transaction || farmer.transaction.length === 0) {
      return next(new ApiError(404, 'No transactions found for this farmer'));
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    const transactions = farmer.transaction.filter(t => {
      const tDate = new Date(t.transactionDate);
      return tDate >= startDate && tDate <= endDate;
    });

    if (!transactions.length) {
      return next(new ApiError(404, 'No transactions found in this date range'));
    }

    const fileName = `Farmer_Report_${farmer.farmerName}_${start}_${end}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    const doc = new PDFDocument({ margins: { top: 50, bottom: 50, left: 50, right: 50 }, size: 'A4' });
    doc.pipe(res);

    // Header
    doc.rect(50, 40, 495, 70).fillAndStroke('#F0F8FF', '#003366');
    doc.fontSize(22).fillColor('#003366').text('FARMER TRANSACTION REPORT', 50, 55, { align: 'center' });
    doc.fontSize(10).fillColor('#003366').text(`Date Range: ${start} to ${end}`, 50, 85, { align: 'center' });

    doc.moveDown(4);
    doc.fontSize(16).fillColor('#003366').text('FARMER DETAILS', { align: 'left', underline: true });
    doc.fontSize(10).fillColor('black');
    doc.text(`Name: ${farmer.farmerName}`);
    doc.text(`Mobile: ${farmer.mobileNumber}`);
    doc.text(`Address: ${farmer.address}`);
    doc.text(`Joining Date: ${new Date(farmer.joiningDate).toLocaleDateString()}`);
    doc.text(`Total Loan: ₹${farmer.totalLoan}`);
    doc.text(`Loan Paid: ₹${farmer.totalLoanPaidBack}`);
    doc.text(`Loan Remaining: ₹${farmer.totalLoanRemaining}`);
    doc.moveDown();

    // Transaction Table Header
    doc.fontSize(14).fillColor('#003366').text('TRANSACTIONS', { underline: true });
    doc.moveDown();

    const drawTable = (transactions, startY) => {
      doc.rect(50, startY, 495, 20).fillAndStroke('#003366', '#003366');
      doc.fillColor('#FFFFFF').fontSize(10);
      doc.text('Date', 55, startY + 6);
      doc.text('Milk Qty (L)', 130, startY + 6);
      doc.text('Rate (₹)', 210, startY + 6);
      doc.text('Amount (₹)', 280, startY + 6);
      doc.text('Fat', 360, startY + 6);
      doc.text('SNF', 410, startY + 6);
      doc.text('Milk Type', 460, startY + 6);

      startY += 20;
      let totalAmount = 0;
      let totalQty = 0;

      transactions.forEach((t, i) => {
        if (i % 2 === 0) doc.rect(50, startY, 495, 20).fillAndStroke('#F8F9FA', '#CCE5FF');
        else doc.rect(50, startY, 495, 20).fillAndStroke('#FFFFFF', '#CCE5FF');

        const amount = t.milkQuantity * t.pricePerLitre;
        totalQty += t.milkQuantity;
        totalAmount += amount;

        doc.fillColor('black').fontSize(9);
        doc.text(new Date(t.transactionDate).toLocaleDateString(), 55, startY + 6);
        doc.text(t.milkQuantity.toFixed(2), 130, startY + 6);
        doc.text(t.pricePerLitre.toFixed(2), 210, startY + 6);
        doc.text(amount.toFixed(2), 280, startY + 6);
        doc.text(t.fat.toFixed(1), 360, startY + 6);
        doc.text(t.snf.toFixed(1), 410, startY + 6);
        doc.text(t.milkType, 460, startY + 6);

        startY += 20;
      });

      // Totals row
      doc.rect(50, startY, 495, 22).fillAndStroke('#E6F2FF', '#003366');
      doc.fillColor('#003366').fontSize(10).font('Helvetica-Bold');
      doc.text('TOTAL', 55, startY + 6);
      doc.text(totalQty.toFixed(2), 130, startY + 6);
      doc.text(totalAmount.toFixed(2), 280, startY + 6);
    };

    drawTable(transactions, doc.y);

    // Footer
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.moveTo(50, 780).lineTo(545, 780).stroke('#003366');
      doc.fontSize(8).fillColor('#666666')
        .text(`Milkman Management System - Report generated on ${new Date().toLocaleString()}`, 50, 790)
        .text(`Page ${i + 1} of ${pageCount}`, 450, 790);
    }

    doc.end();
  } catch (err) {
    console.error(err);
    next(new ApiError(500, 'Server error'));
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
