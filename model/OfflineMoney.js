//This money is the money that is given to farmers for their milk that they giving us at our dairy

import mongoose from "mongoose"

//check in future . . . 
const offlineMoneySchema = new mongoose.Schema(
  {
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
    subAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubAdmin",
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  {
    timestamps: true,
  }
);

export const OfflineMoney = mongoose.model("OfflineMoney", offlineMoneySchema);
