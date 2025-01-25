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
    amount: {
      type: Number,
      default: 0,
    },
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

export const Farmer = mongoose.model("Farmer", farmerSchema);
