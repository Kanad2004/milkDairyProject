import mongoose from "mongoose";

// Schema for tracking changes to a loan
const loanHistorySchema = new mongoose.Schema(
  {
    changedAt: { type: Date, default: Date.now },
    loanDate: { type: Date },
    loanAmount: { type: Number },
    operation: {
      type: String,
      enum: [ "delete", "deduct", "revert"],
      required: true,
    },
  },
  { _id: false }
);

// Schema for each loan record
const loanSchema = new mongoose.Schema({
  loanDate: { type: Date, required: true },
  originalAmount: {type : Number , required: true},
  loanAmount: { type: Number, required: true },
  isDeleted: { type: Boolean, default: false },
  history: [loanHistorySchema],
});

// Main Farmer schema
const farmerSchema = new mongoose.Schema(
  {
    farmerId : { type: Number, required: true },
    farmerName: { type: String, required: true },
    mobileNumber: { type: String, required: true},
    address: { type: String, required: true },
    // milkType: { type: String, required: true },
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
        snf: { type: Number, required: true },
        fat: { type: Number, required: true },
        transactionTime: {type : String , required: true},
        pricePerLitre: {type : Number , required: true},
      },
    ],
    // Array of loans with history and soft delete flag
    loan: [loanSchema],
  },
  { timestamps: true }
);

export const Farmer = mongoose.model("Farmer", farmerSchema);
