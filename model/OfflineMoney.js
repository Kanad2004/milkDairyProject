//This money is the money that is given to farmers for their milk that they giving us at our dairy

const mongoose = require("mongoose");

const offlineMoneySchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
  },
  amount: {
    type: Number,
    required: true,
  },
  time: {
    type: Date,
    required: true,
  },
});
