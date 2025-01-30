// //this is the money which are taking from our customers by selling our products

// import mongoose from "mongoose"

// const transactionSchema = new mongoose.Schema(
//   {
//     customer: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "OnlineCustomer",
//     },
//     items: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "TransactionItem",
//       },
//     ],
//     amount: {
//       type: Number,
//       required: true,
//     },
//     time: {
//       type: Date,
//       required: true,
//     },
//     admin: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Admin",
//     },
//     subAdmin: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "SubAdmin",
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// export const Transaction = mongoose.model("Transaction", transactionSchema);

//this is the money which are taking from our customers by selling our products

import mongoose from "mongoose"

const transactionSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required : true ,
    },
    mobileNumber : {
      type: String ,
      required : true , 
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

export const Transaction = mongoose.model("Transaction", transactionSchema);
