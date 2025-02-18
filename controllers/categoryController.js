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
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the category already exists
    const existingCategory = await Category.findOne({ categoryName });
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const newCategory = new Category({
      categoryName,
      categoryDescription: categoryDescription,
      subAdmin: req.subAdmin._id,
      products: [], // Initially empty
    });

    await newCategory.save();
    res
      .status(201)
      .send(
        new ApiResponse(201, newCategory, "New Category added successfully")
      );
  } catch (error) {
    res.status(500).json({ message: "Error adding category", error });
  }
};

// Delete a category by ID
export const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const deletedCategory = await Category.findByIdAndDelete(categoryId);
    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res
      .status(200)
      .send(new ApiResponse(200, {}, "Category deleted successfully"));
  } catch (error) {
    res.status(500).json({ message: "Error deleting category", error });
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
      return res.status(404).json({ message: "Category not found" });
    }

    res
      .status(200)
      .send(
        new ApiResponse(200, updateCategory, "Category updated successfully")
      );
  } catch (error) {
    res.status(500).json({ message: "Error updating category", error });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate("subAdmin"); // Populating subAdmin details if needed
    res
      .status(200)
      .send(
        new ApiResponse(200, categories, "Categories fetched successfully")
      );
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories", error });
  }
};

// 🔍 Get a category by ID
export const getCategoryById = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await Category.findById(categoryId).populate("subAdmin"); // Populating subAdmin details if needed

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res
      .status(200)
      .send(new ApiResponse(200, category, "Category fetched successfully"));
  } catch (error) {
    res.status(500).json({ message: "Error fetching category", error });
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
      return res.status(404).json({ message: "Category not found" });
    }

    const profilePictureImg = await uploadOnCloudinary(profilePicture);

    if (!profilePictureImg || !profilePictureImg.url) {
      throw new ApiError(400, "Error while uploading coverImg on cloudinary");
    }

    product.productImage = profilePictureImg.url;

    category.products.push(product); // Add product to the category's product list
    await category.save();

    res.status(201).json({ message: "Product added successfully", category });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error adding product", error });
  }
};

// ❌ Delete a product from a category
export const deleteProductFromCategory = async (req, res) => {
  try {
    const { categoryId, productId } = req.params;

    // Find the category
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Filter out the product to remove it
    category.products = category.products.filter((product) => {
      return product._id.toString() !== productId;
    });
    await category.save();

    res.status(200).json({ message: "Product deleted successfully", category });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error deleting product", error });
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
      return res.status(404).json({ message: "Category not found" });
    }

    // Find the product in the category
    const productIndex = category.products.findIndex(
      (product) => product._id.toString() === productId
    );
    if (productIndex === -1) {
      return res
        .status(404)
        .json({ message: "Product not found in this category" });
    }

    // Update the product data while keeping other fields intact
    category.products[productIndex] = {
      ...category.products[productIndex],
      ...updatedProductData,
    };
    await category.save();

    res.status(200).json({ message: "Product updated successfully", category });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error updating product", error });
  }
};
