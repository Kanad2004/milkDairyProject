import mongoose from "mongoose";

const branchSchema = new mongoose.Schema(
    {
      branchName: {
        type: String,
        required: true,
      },
      location: {
        type: String,
        required: true,
      },
    },
    {
      timestamps: true,
    }
  );
  
  export const Branch = mongoose.model("Branch", branchSchema);
  