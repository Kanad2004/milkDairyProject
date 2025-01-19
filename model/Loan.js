import mongoose from "mongoose"

const loanSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },

    amount: {
      type: Number,
      required: true,
    },

    loanDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Loan = mongoose.model("Loan", loanSchema);
