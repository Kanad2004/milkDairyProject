import mongoose from "mongoose"

//we have to add the status of the product which is inStock or outStock
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
    productQuantity: {
      type: Number,
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
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model("Product", productSchema);
