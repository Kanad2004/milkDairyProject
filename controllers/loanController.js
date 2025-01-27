import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Farmer } from "../model/Farmer.js";

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

