import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Admin } from "../model/Admin.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Farmer } from "../model/Farmer.js";
import { Product } from "../model/Product.js";
import fs from "fs";
import { uploadOnCloudinary } from "../utils/CloudinaryUtility.js";

//!This is done
//we can add paginate options for this  . . .
const displayAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find();

  if (!products) {
    return new ApiError(400, "products are not present");
  } else {
    return res
      .status(200)
      .send(
        new ApiResponse(200, products, "All products got successfully . ..")
      );
  }
});

//!This is done
const displayProductByName = asyncHandler(async (req, res) => {
  const { productName } = req.params;
  console.log(productName);

  const products = await Product.find({ productName });
  if (!products) {
    return new ApiError(404, "Products with this name not found");
  } else {
    return res
      .status(200)
      .send(
        new ApiResponse(
          200,
          products,
          "fetched all the products with the name "
        )
      );
  }
});

const updateProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { updateData } = req.body;
  console.log("productId: ", productId);
  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    { $set: updateData }, // Dynamically set only the fields provided
    { new: true, runValidators: true } // Ensure validation and return updated document
  );

  if (!updateProduct) {
    return new ApiError(500, "Product is not updated successfully");
  }

  return res
    .status(200)
    .send(new ApiResponse(200, updateProduct, "Product updated successfully"));
});

const updateProductImg = asyncHandler(async (req, res) => {
  const productImgPath = req.file?.path;

  if (!productImgPath) {
    throw new ApiError(400, "Cover Img is missing");
  }

  const productImg = await uploadOnCloudinary(productImgPath);

  if (!productImg.url) {
    throw new ApiError(400, "Error while uploading coverImg on cloudinary");
  }
  fs.unlink(productImgPath, (err) => {
    if (err) {
      console.error(`Failed to delete uploaded avatar: ${err.message}`);
    } else {
      console.log("Uploaded avatar deleted successfully from server");
    }
  });

  const product = await Product.findByIdAndUpdate(
    req.product?._id,
    {
      $set: {
        productImage: productImg.url,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .send(
      new ApiResponse(200, product, "Product Image is updated Successfully")
    );
});

const addProduct = asyncHandler(async (req, res) => {
  const {
    productName,
    productPrice,
    productDescription,
    productMassPercentage,
  } = req.body;

  if (
    [productName, productPrice, productDescription, productMassPercentage].some(
      (field) => field?.trim === ""
    )
  ) {
    throw new ApiError(400, "All Fields are required ");
  }

  const product = await Product.findOne({
    productName,
    subAdmin: req.subAdmin._id,
  });

  if (product) {
    throw new ApiError(409, "Product with same productName already exists");
  }

  //   const productLocalPath = req.files?.productImage[0]?.path;

  //   if (!productLocalPath) {
  //     throw new ApiError(400, "ProductImage is required");
  //   }

  //   const productImg = await uploadOnCloudinary(avatarLocalPath);

  //   if (!productImg) {
  //     throw new ApiError(400, "ProductImg is not uploaded successfully ");
  //   }

  const newProduct = await Product.create({
    productName,
    productPrice,
    productDescription,
    productImg: "",
    productMassPercentage,
    subAdmin: req.subAdmin._id,
  });

  const createdProduct = await Product.findById(newProduct._id);

  if (!createdProduct) {
    throw new ApiError(500, "Product is not created successfully");
  }

  return res
    .status(201)
    .send(
      new ApiResponse(200, createdProduct, "Product Created Successfully ! ")
    );
});

const deleteProductById = asyncHandler(async (req, res) => {
  try {
    const { productId } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      console.log("Product not found");
      throw new ApiError(404, "Product not found");
    }

    console.log("Deleted Product:", deletedProduct);
    // return { success: true, data: deletedProduct };
    return res
      .status(200)
      .send(new ApiResponse(200, {}, "Product deleted successfully"));
  } catch (error) {
    throw new ApiError(500, "Error while deleting the product");
  }
});

const addQuantity = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }
  product.quantity += quantity;
  await product.save();
  return res
    .status(200)
    .send(
      new ApiResponse(200, product, "Product quantity updated successfully")
    );
});

export {
  displayAllProducts,
  displayProductByName,
  updateProduct,
  addProduct,
  updateProductImg,
  deleteProductById,
  addQuantity,
<<<<<<< HEAD
};
=======
};
>>>>>>> 14a5353bd279100d6e5c27cb46140631f278c929
