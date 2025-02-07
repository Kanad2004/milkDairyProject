import mongoose from "mongoose";

const farmerSchema = new mongoose.Schema(
  {
    farmerName: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      unique: true, //can be changed later
    },
    address: {
      type: String,
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
    // amount: {
    //   type: Number,
    //   default: 0,
    // },
    totalLoan: {
      type: Number,
      default: 0,
    },
    totalLoanPaidBack: {
      type: Number,
      default: 0,
    },
    totalLoanRemaining: {
      type: Number,
      default: 0,
    },

    transaction: [
      {
        transactionDate: {
          type: Date,
          // required: true,
        },
        transactionAmount: {
          type: Number,
          // required: true,
        },
        milkQuantity: {
          type: Number,
          // required: true,
        },
      },
    ],
    loan: [
      {
        loanDate: {
          type: Date,
          required: true,
        },
        loanAmount: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

<<<<<<< HEAD
export const Farmer = mongoose.model("Farmer", farmerSchema);
=======
export const Farmer = mongoose.model("Farmer", farmerSchema);
>>>>>>> 14a5353bd279100d6e5c27cb46140631f278c929
