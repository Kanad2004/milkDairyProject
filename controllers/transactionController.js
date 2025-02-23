import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Transaction } from "../model/Transaction.js";

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
