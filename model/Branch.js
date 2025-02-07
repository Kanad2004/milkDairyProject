import mongoose from "mongoose";

const branchSchema = new mongoose.Schema(
  {
    branchId: {
      type: Number,
      required: true,
    },
<<<<<<< HEAD
    {
      timestamps: true,
    }
  );
  
  export const Branch = mongoose.model("Branch", branchSchema);

  //We must add the following thing : 
  // Add an array to store milk supply records.
  // milkSupplyRecords: [
  //   {
  //     date: { type: Date, default: Date.now },
  //     quantity: Number, // Liters of milk sent
  //     sourceBranch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" }, // Main branch ID
  //   },
  // ],
  
  // inventory: [
  //   {
  //     product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  //     quantity: Number, // Number of units available
  //   },
  // ],
  
=======
    branchAddress: {
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
>>>>>>> 14a5353bd279100d6e5c27cb46140631f278c929
