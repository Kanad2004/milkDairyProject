//this is the money which are taking from our customers by selling our products

const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OnlineCustomer",
    },
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TransactionItem",
      },
    ],
    amount: {
      type: Number,
      required: true,
    },
    time: {
      type: Date,
      required: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    subAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubAdmin",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);
