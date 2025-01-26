import mongoose from "mongoose"

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
    totalLoan: {
      type: Number,
      default: 0,
      // required: true,
    }, 
    totalLoanPaidBack: {
      type: Number,
     default: 0

      // required: true,
    },
    totalLoanRemaining: {
      type: Number,
     default: 0

      // required: true,
    },
    loans: {
      amount: {
        type: Number,
     default: 0

        // required: true,
      },
  
      loanDate: {
        type: Date,
        // required: true,
      },
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

export const Farmer = mongoose.model("Farmer", farmerSchema);
