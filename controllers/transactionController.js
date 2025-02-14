import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Transaction } from "../model/Transaction.js";
import {TransactionItem} from "../model/TransactionItem.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { Product } from "../models/Product.js";

// 1. Add Item
export const addItem = asyncHandler (async (req, res) => {
  try {
    const { productId, quantity , pamount} = req.body;

    // Validate input
    if (!productId || !quantity || quantity <= 0 || !pamount || pamount<=0 ) {
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

    return res.status(201).send(new ApiResponse(201 , transactionItem , "Item added successfully"));
  } catch (error) {
    return res.status(500).send(new ApiError(500 , "Internal server error"));
  }
});

// 2. Save Whole Transaction
export const saveTransaction = async (req, res) => {
  try {
    const { customerName, mobileNumber, items, amount, adminId, subAdminId } = req.body;

    // Validate input
    if (!customerName || !mobileNumber || !items || !Array.isArray(items) || items.length === 0 || !amount) {
      return res.status(400).send(new ApiError(400 , "Invalid transaction data"));
    }

    // Verify all transaction items
    for (const itemId of items) {
      const transactionItem = await TransactionItem.findById(itemId);
      if (!transactionItem) {
        return res.status(404).send(new ApiError(404 , `Transaction item ${itemId} not found` ));
      }
      // else {
      //   amount+=transactionItem.pamount;
      // }
    }

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

    return res.status(201).send(new ApiResponse(201 , transaction , "Transaction saved successfully" ));
  } catch (error) {
    return res.status(500).send(new ApiError(500 , "Internal server error"));
  }
};
