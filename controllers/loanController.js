import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Farmer } from "../model/Farmer.js";
import exceljs from "exceljs";
import path from "path";
import fs from "fs";

export const createLoan = asyncHandler(async (req, res) => {
    const {mobileNumber,  loanAmount, loanDate } = req.body;

    // Validate input fields
    if ([mobileNumber, loanAmount, loanDate].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    // Find the farmer by ID
    const farmer = await Farmer.findOne({mobileNumber : mobileNumber});

    if (!farmer) {
        throw new ApiError(404, "Farmer not found");
    }

    // Create loan object to add to the loan array
    const loan = {
        loanDate: loanDate,
        loanAmount: loanAmount,
    };

    // Push the loan to the loan array
    farmer.loan.push(loan);

    // Update the total loan amount
    farmer.totalLoan += loanAmount;
    farmer.totalLoanRemaining += loanAmount;

    // Save the updated farmer document
    await farmer.save();

    return res.status(201).json(new ApiResponse(200, farmer, "Loan added successfully"));
});


export const getAllLoans = asyncHandler(async (req, res) => {
    const loans = await Farmer.find({}).select("loan");

    return res.status(200).json(new ApiResponse(200, loans, "All loans fetched successfully"));
});

export const getLoanById = asyncHandler(async (req, res) => {
    const { loanId } = req.params;

    const loan = await Farmer.findOne({ "loan._id": loanId }).select("loan");

    if (!loan) {
        throw new ApiError(404, "Loan not found");
    }

    return res.status(200).json(new ApiResponse(200, loan, "Loan fetched successfully"));
});

export const updateLoan = asyncHandler(async (req, res) => {
    const { loanId } = req.params;
    const { mobileNumber, loanDate, loanAmount } = req.body;

    // Find the farmer by ID
    const farmer = await Farmer.findOne({mobileNumber : mobileNumber});

    if (!farmer) {   
        throw new ApiError(404, "Farmer not found");
    }

    // Find the loan by ID
    const loan = farmer.loan.find((loan) => loan._id.toString() === loanId);

    if (!loan) {
        throw new ApiError(404, "Loan not found");
    }

    // Update the loan fields
    loan.loanDate = loanDate;   
    loan.loanAmount = loanAmount;

    // Save the updated farmer document
    await farmer.save();

    return res.status(200).json(new ApiResponse(200, farmer, "Loan updated successfully"));
});




// Generate loan report for all farmers
export const generateLoanReport = asyncHandler(async (req, res) => {
    const farmers = await Farmer.find({}).select("loan farmerName mobileNumber address totalLoan totalLoanPaidBack totalLoanRemaining");

    if (!farmers || farmers.length === 0) {
        throw new ApiError(404, "No loans found");
    }

    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet("Loans");

    // Define columns for the Excel sheet
    worksheet.columns = [
        { header: "Farmer ID", key: "farmerId", width: 20 },
        { header: "Farmer Name", key: "farmerName", width: 20 },
        { header: "Mobile Number", key: "mobileNumber", width: 20 },
        { header: "Address", key: "address", width: 20 },
        { header: "Total Loan", key: "totalLoan", width: 20 },
        { header: "Total Loan Paid Back", key: "totalLoanPaidBack", width: 20 },
        { header: "Total Loan Remaining", key: "totalLoanRemaining", width: 20 },
        { header: "Loan ID", key: "loanId", width: 20 },
        { header: "Loan Date", key: "loanDate", width: 20 },
        { header: "Loan Amount", key: "loanAmount", width: 20 },
    ];

    // Add rows for each loan
    farmers.forEach((farmer) => {
        farmer.loan.forEach((loan) => {
            worksheet.addRow({
                farmerId: farmer._id,
                farmerName: farmer.farmerName,
                mobileNumber: farmer.mobileNumber,
                address: farmer.address,
                totalLoan: farmer.totalLoan,
                totalLoanPaidBack: farmer.totalLoanPaidBack,
                totalLoanRemaining: farmer.totalLoanRemaining,
                loanId: loan._id,
                loanDate: loan.loanDate,
                loanAmount: loan.loanAmount,
            });
        });
    });

    const filePath = path.join(process.cwd(), "public", "loans.xlsx");

    // Write the file and respond with download link
    await workbook.xlsx.writeFile(filePath);

    return res.download(filePath, "loans.xlsx", (err) => {
        if (err) {
            throw new ApiError(500, "Error occurred while downloading the file");
        }

        // Clean up file after download
        fs.unlinkSync(filePath);
    });
});

// Generate loan report by farmer ID
export const generateLoanReportByFarmerId = asyncHandler(async (req, res) => {
    const { farmerId } = req.params;

    const farmer = await Farmer.findById(farmerId).select("loan farmerName mobileNumber address totalLoan totalLoanPaidBack totalLoanRemaining");

    if (!farmer || farmer.loan.length === 0) {
        throw new ApiError(404, "No loans found for the specified farmer");
    }

    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet("Farmer Loans");

    // Define columns for the Excel sheet
    worksheet.columns = [
        { header: "Farmer ID", key: "farmerId", width: 20 },
        { header: "Farmer Name", key: "farmerName", width: 20 },
        { header: "Mobile Number", key: "mobileNumber", width: 20 },
        { header: "Address", key: "address", width: 20 },
        { header: "Total Loan", key: "totalLoan", width: 20 },
        { header: "Total Loan Paid Back", key: "totalLoanPaidBack", width: 20 },
        { header: "Total Loan Remaining", key: "totalLoanRemaining", width: 20 },
        { header: "Loan ID", key: "loanId", width: 20 },
        { header: "Loan Date", key: "loanDate", width: 20 },
        { header: "Loan Amount", key: "loanAmount", width: 20 },
    ];

    // Add rows for each loan of the specified farmer
    farmer.loan.forEach((loan) => {
        worksheet.addRow({
            farmerId: farmer._id,
            farmerName: farmer.farmerName,
            mobileNumber: farmer.mobileNumber,
            address: farmer.address,
            totalLoan: farmer.totalLoan,
            totalLoanPaidBack: farmer.totalLoanPaidBack,
            totalLoanRemaining: farmer.totalLoanRemaining,
            loanId: loan._id,
            loanDate: loan.loanDate,
            loanAmount: loan.loanAmount,
        });
    });

    const filePath = path.join(process.cwd(), "public", `loans-${farmerId}.xlsx`);

    // Write the file and respond with download link
    await workbook.xlsx.writeFile(filePath);

    return res.download(filePath, `loans-${farmerId}.xlsx`, (err) => {
        if (err) {
            throw new ApiError(500, "Error occurred while downloading the file");
        }

        // Clean up file after download
        fs.unlinkSync(filePath);
    });
});