import mongoose from "mongoose";

const embeddedProductSchema = new mongoose.Schema({
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
    required: true, // Uncomment if needed
  },
  // productDescription: {
  //   type: String,
  //   required: true, // Uncomment if needed
  // },
  // snf: {
  //   type: Number,
  //   required: true,
  // },
  // fat: {
  //   type: Number,
  //   required: true,
  // },
  productInstock: {
    type: Boolean,
    default: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
  },
  unit: {
    type: Number,
    required: true,
  },
});

embeddedProductSchema.pre("save", function (next) {
  // Set productInstock to true if quantity is greater than 0, otherwise false.
  this.productInstock = this.quantity > 0;
  next();
});

// Define the Category schema that embeds products
const categorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: true,
      unique: true,
    },
    categoryDescription: {
      type: String,
    },
    subAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubAdmin",
    },
    products: [embeddedProductSchema],
    
    branchId:{
      type : Number , 
      required: true ,
    }
  },
  {
    timestamps: true,
  }
);

// Export the Category model
export const Category = mongoose.model("Category", categorySchema);