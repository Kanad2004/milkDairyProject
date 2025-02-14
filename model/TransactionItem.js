// import mongoose from "mongoose"

// const transactionItemSchema = new mongoose.Schema(
//   {
//     product: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Product",
//     },
//     quantity: {
//       type: Number,
//       required: true,
//       default: 0,
//     },
//     pamount:{
//       type:Number,
//       required:true,
//       default :product.productPrice*quantity,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// export const TransactionItem = mongoose.model("TransactionItem", transactionItemSchema);
import mongoose from "mongoose";

const transactionItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    pamount: {
      type: Number,
      required: true,
      default: 0, // Default is 0, will be recalculated in the hook
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to calculate pamount based on quantity and product price
transactionItemSchema.pre("save", async function (next) {
  if (this.isModified("quantity") || this.isModified("product")) {
    try {
      // Get the product details
      const product = await mongoose.model("Product").findById(this.product);
      if (product) {
        // Calculate the amount
        this.pamount = product.productPrice * this.quantity;
      }
    } catch (error) {
      console.error("Error calculating pamount:", error);
    }
  }
  next();
});

export const TransactionItem = mongoose.model(
  "TransactionItem",
  transactionItemSchema
);
