import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Admin } from "../model/Admin.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Category } from "../model/Category.js";
import { uploadOnCloudinary } from "../utils/CloudinaryUtility.js";

// Add a new category
export const addCategory = async (req, res) => {
  try {
    const { categoryName, categoryDescription } = req.body;

    if (!categoryName || !categoryDescription) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "All fields are required"));
    }

    // Check if the category already exists
    const existingCategory = await Category.findOne({ categoryName });
    if (existingCategory) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Category already exists"));
    }

    const newCategory = new Category({
      categoryName,
      categoryDescription,
      subAdmin: req.subAdmin._id,
      products: [], // Initially empty
    });

    await newCategory.save();
    res
      .status(201)
      .json(
        new ApiResponse(201, newCategory, "New Category added successfully")
      );
  } catch (error) {
    console.error(error);
    if (error instanceof ApiError) {
      return res
        .status(error.status)
        .json(new ApiResponse(error.status, null, error.message));
    }
    res.status(500).json(new ApiResponse(500, null, "Error adding category"));
  }
};

// Delete a category by ID
export const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const deletedCategory = await Category.findByIdAndDelete(categoryId);
    if (!deletedCategory) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Category not found"));
    }

    res
      .status(200)
      .json(new ApiResponse(200, {}, "Category deleted successfully"));
  } catch (error) {
    console.error(error);
    if (error instanceof ApiError) {
      return res
        .status(error.status)
        .json(new ApiResponse(error.status, null, error.message));
    }
    res.status(500).json(new ApiResponse(500, null, "Error deleting category"));
  }
};

// Update a category by ID
export const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { categoryName, categoryDescription } = req.body;

    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      { categoryName, categoryDescription },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Category not found"));
    }

    res
      .status(200)
      .json(
        new ApiResponse(200, updatedCategory, "Category updated successfully")
      );
  } catch (error) {
    console.error(error);
    if (error instanceof ApiError) {
      return res
        .status(error.status)
        .json(new ApiResponse(error.status, null, error.message));
    }
    res.status(500).json(new ApiResponse(500, null, "Error updating category"));
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate("subAdmin"); // Populating subAdmin details if needed
    res
      .status(200)
      .json(
        new ApiResponse(200, categories, "Categories fetched successfully")
      );
  } catch (error) {
    console.error(error);
    if (error instanceof ApiError) {
      return res
        .status(error.status)
        .json(new ApiResponse(error.status, null, error.message));
    }
    res
      .status(500)
      .json(new ApiResponse(500, null, "Error fetching categories"));
  }
};

// 🔍 Get a category by ID
export const getCategoryById = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await Category.findById(categoryId).populate("subAdmin"); // Populating subAdmin details if needed

    if (!category) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Category not found"));
    }

    res
      .status(200)
      .json(new ApiResponse(200, category, "Category fetched successfully"));
  } catch (error) {
    console.error(error);
    if (error instanceof ApiError) {
      return res
        .status(error.status)
        .json(new ApiResponse(error.status, null, error.message));
    }
    res.status(500).json(new ApiResponse(500, null, "Error fetching category"));
  }
};

// ✅ Add a product to a category
export const addProductToCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const product = req.body; // Product details from request body

    const profilePicture = req?.file?.path;

    if (!profilePicture) {
      throw new ApiError(400, "Cover Img is missing");
    }

    // Find the category
    const category = await Category.findById(categoryId);
    if (!category) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Category not found"));
    }

    const profilePictureImg = await uploadOnCloudinary(profilePicture);

    if (!profilePictureImg || !profilePictureImg.url) {
      throw new ApiError(400, "Error while uploading coverImg on cloudinary");
    }

    product.productImage = profilePictureImg.url;

    category.products.push(product); // Add product to the category's product list
    await category.save();

    res
      .status(201)
      .json(new ApiResponse(201, category, "Product added successfully"));
  } catch (error) {
    console.error(error);
    if (error instanceof ApiError) {
      return res
        .status(error.status)
        .json(new ApiResponse(error.status, null, error.message));
    }
    res.status(500).json(new ApiResponse(500, null, "Error adding product"));
  }
};

// ❌ Delete a product from a category
export const deleteProductFromCategory = async (req, res) => {
  try {
    const { categoryId, productId } = req.params;

    // Find the category
    const category = await Category.findById(categoryId);
    if (!category) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Category not found"));
    }

    // Filter out the product to remove it
    category.products = category.products.filter(
      (product) => product._id.toString() !== productId
    );
    await category.save();

    res
      .status(200)
      .json(new ApiResponse(200, category, "Product deleted successfully"));
  } catch (error) {
    console.error(error);
    if (error instanceof ApiError) {
      return res
        .status(error.status)
        .json(new ApiResponse(error.status, null, error.message));
    }
    res.status(500).json(new ApiResponse(500, null, "Error deleting product"));
  }
};

// 🔄 Update a product inside a category
export const updateProductInCategory = async (req, res) => {
  try {
    const { categoryId, productId } = req.params;
    let updatedProductData = req.body;

    const profileImage = req?.file?.path;

    if (!profileImage) {
      throw new ApiError(400, "Cover Img is missing");
    }

    const profileImageImg = await uploadOnCloudinary(profileImage);
    if (!profileImageImg || !profileImageImg.url) {
      throw new ApiError(400, "Error while uploading coverImg on cloudinary");
    }

    updatedProductData.productImage = profileImageImg.url;

    // Find the category
    const category = await Category.findById(categoryId);
    if (!category) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Category not found"));
    }

    // Find the product in the category
    const productIndex = category.products.findIndex(
      (product) => product._id.toString() === productId
    );
    if (productIndex === -1) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Product not found in this category"));
    }

    // Update the product data while keeping other fields intact
    category.products[productIndex] = {
      ...category.products[productIndex],
      ...updatedProductData,
    };
    await category.save();

    res
      .status(200)
      .json(new ApiResponse(200, category, "Product updated successfully"));
  } catch (error) {
    console.error(error);
    if (error instanceof ApiError) {
      return res
        .status(error.status)
        .json(new ApiResponse(error.status, null, error.message));
    }
    res.status(500).json(new ApiResponse(500, null, "Error updating product"));
  }
};

// Controller to update the stock (quantity) of a product in a category based on operation and value
export const updateProductStock = async (req, res) => {
  try {
    const { categoryId, productId } = req.params;
    const { operation, value } = req.body;

    // Validate input
    if (!operation || value === undefined) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            null,
            "Both operation and value fields are required"
          )
        );
    }
    if (operation !== "add" && operation !== "subtract") {
      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            null,
            "Operation must be either 'add' or 'subtract'"
          )
        );
    }
    const numericValue = Number(value);
    if (isNaN(numericValue) || numericValue < 0) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Value must be a positive number"));
    }

    // Find the category and then the embedded product
    const category = await Category.findById(categoryId);
    if (!category) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Category not found"));
    }
    const product = category.products.id(productId);
    if (!product) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Product not found in this category"));
    }

    // Update the quantity based on the operation
    if (operation === "add") {
      product.quantity += numericValue;
    } else if (operation === "subtract") {
      if (product.quantity < numericValue) {
        throw new ApiError(400, "Not enough stock");
      }
      product.quantity -= numericValue;
    }

    // The pre-save hook on the embedded schema will adjust productInstock accordingly
    await category.save();

    res
      .status(200)
      .json(
        new ApiResponse(200, product, "Product stock updated successfully")
      );
  } catch (error) {
    console.error("Error updating product stock:", error);
    if (error instanceof ApiError) {
      return res
        .status(error.status)
        .json(new ApiResponse(error.status, null, error.message));
    }
    res
      .status(500)
      .json(new ApiResponse(500, null, "Error updating product stock"));
  }
};
