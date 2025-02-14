import mongoose from "mongoose";

//we have to add the status of the product which is inStock or outStock
// product category , as well as type of the mass percentage . . . 
const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
    },
    productPrice: {
      type: Number,
      required: true,
    },
    productImage: {
      type: String,
      // required: true,
    },
    productDescription: {
      type: String,
      // required: true,
    },
    productMassPercentage: {
      type: Number,
      // required: true,
    },
    productInstock: {
      type: Boolean,
      // required: true,
      default: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
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
export const Product = mongoose.model("Product", productSchema);

//should we follow the following . . .
// import mongoose from "mongoose";

// const productSchema = new mongoose.Schema(
//   {
//     productName: {
//       type: String,
//       required: true,
//     },
//     productPrice: {
//       type: Number,
//       required: true,
//     },
//     productImage: {
//       type: String,
//       required: true,
//     },
//     productDescription: {
//       type: String,
//       required: true,
//     },
//     productMassPercentage: {
//       type: Number,
//       required: true,
//     },
//     productMassType: {
//       type: String,
//       enum: ["Fat", "SNF", "Moisture"], // Define what the percentage represents
//       required: true,
//     },
//     productCategory: {
//       type: String,
//       enum: ["Milk", "Cheese", "Butter", "Curd", "Other"], // Categorizing products
//       required: true,
//     },
//     productStock: {
//       type: Number,
//       required: true,
//       default: 0, // Prevents missing stock values
//     },
//     productInstock: {
//       type: Boolean,
//       default: function () {
//         return this.productStock > 0; // Auto-calculate stock status
//       },
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// export const Product = mongoose.model("Product", productSchema);
