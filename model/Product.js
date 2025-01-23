import mongoose from "mongoose"

//Use this model to display Product rates and details

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
      required: true,
    },
    productDescription: {
      type: String,
      required: true,
    },
    productMassPercentage: {
      type: Number,
      required: true,
    },
    productQuantity: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model("Product", productSchema);
