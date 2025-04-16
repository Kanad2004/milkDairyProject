// import mongoose from "mongoose";

// const transactionItemSchema = new mongoose.Schema(
//   {
//     product: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Category", //changed from Product to Category 
//     },
//     quantity: {
//       type: Number,
//       required: true,
//       default: 0,
//     },
//     pamount: {
//       type: Number,
//       required: true,
//       default: 0, // Default is 0, will be recalculated in the hook
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // Pre-save hook to calculate pamount based on quantity and product price
// transactionItemSchema.pre("save", async function (next) {
//   if (this.isModified("quantity") || this.isModified("product")) {
//     try {
//       // Get the product details
//       const product = await mongoose.model("Product").findById(this.product);
//       if (product) {
//         // Calculate the amount
//         this.pamount = product.productPrice * this.quantity;
//       }
//     } catch (error) {
//       console.error("Error calculating pamount:", error);
//     }
//   }
//   next();
// });

// const transactionSchema = new mongoose.Schema(
//   {
//     customerName: {
//       type: String,
//       required: true,
//     },
//     mobileNumber: {
//       type: String,
//       required: true,
//     },
//     items: [transactionItemSchema],
//     amount: {
//       type: Number,
//       required: true,
//     },
//     time: {
//       type: Date,
//       required: true,
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



//Soham Code
import mongoose from "mongoose";

const transactionItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", 
    },
    productName: {
      type : String , 
      required: true ,
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
// transactionItemSchema.pre("save", async function (next) {
//   console.log("in save hook: " , this)
//   if (this.isModified("quantity") || this.isModified("product")) {
//     try {
//       // Get the product details
//       const product = await mongoose.model("Product").findById(this.product);
//       if (product) {
//         // Calculate the amount
//         this.pamount = product.productPrice * this.quantity;
//       }
//     } catch (error) {
//       console.error("Error calculating pamount:", error);
//     }
//   }
//   next();
// });

const transactionSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: String,
      required: true,
    },
    items: [transactionItemSchema],
    amount: {
      type: Number,
      required: true,
    },
    time: {
      type: Date,
      required: true,
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

export const Transaction = mongoose.model("Transaction", transactionSchema);
