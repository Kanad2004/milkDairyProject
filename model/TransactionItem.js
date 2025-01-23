import mongoose from "mongoose"

//merge this model with Transaction model
const transactionItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"},
    
      quantity: {
        type: Number,
        required: true,
        default: 0,
      },
    
  },
  
  {
    timestamps: true,
  }
);


export const TransactionItem = mongoose.model("TransactionItem", transactionItemSchema);