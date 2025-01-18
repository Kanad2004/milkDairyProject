const mongoose = require("mongoose");

const transactionItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
  },
});

module.exports = mongoose.model("TransactionItem", transactionItemSchema);
