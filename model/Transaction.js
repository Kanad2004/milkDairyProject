// import mongoose from "mongoose";

// const transactionSchema = new mongoose.Schema(
//   {
//     customer: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "OnlineCustomer",
//       required: true,
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
//     transactionDate: { // Renamed from 'time'
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
import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OnlineCustomer",
      required: true,
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
    transactionDate: { // Renamed from 'time'
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

transactionSchema.pre("save", async function (next) {
  if (this.items && this.items.length > 0) {
    const items = await mongoose.model("TransactionItem").find({ _id: { $in: this.items } }).populate("product");
    
    this.amount = items.reduce((total, item) => {
      if (item.product && item.product.productPrice) {
        return total + item.quantity * item.product.productPrice;
      }
      return total;
    }, 0);
  }
  next();
});

export const Transaction = mongoose.model("Transaction", transactionSchema);


