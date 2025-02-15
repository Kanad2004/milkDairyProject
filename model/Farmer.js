import mongoose from "mongoose";

const farmerSchema = new mongoose.Schema(
  {
    farmerName: { type: String, required: true },
    mobileNumber: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    milkType: { type: String, required: true },
    gender: { type: String, required: true },
    joiningDate: { type: Date, required: true },
    subAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "SubAdmin" },
    totalLoan: { type: Number, default: 0 },
    totalLoanPaidBack: { type: Number, default: 0 },
    totalLoanRemaining: { type: Number, default: 0 },
    transaction: [
      {
        transactionDate: { type: Date, required: true },
        transactionAmount: { type: Number, required: true },
        milkQuantity: { type: Number, required: true },
        milkType: { type: String, required: true },
      },
    ],
    loan: [
      {
        loanDate: { type: Date, required: true },
        loanAmount: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

export const Farmer = mongoose.model("Farmer", farmerSchema);
