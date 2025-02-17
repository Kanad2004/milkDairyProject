import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Admin } from "../model/Admin.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Category } from "../model/Category.js"; 

// Add a new category
export const addCategory = async (req, res) => {
  try {
    const { categoryName, categoryDescription, subAdmin } = req.body;

    // Check if the category already exists
    const existingCategory = await Category.findOne({ categoryName });
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const newCategory = new Category({
      categoryName,
      categoryDescription,
      subAdmin,
      products: [], // Initially empty
    });

    await newCategory.save();
    res.status(201).send(new ApiResponse(201 , newCategory , "New Category added successfully"));
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

    res.status(200).send(new ApiResponse(200 , {} , 'Category deleted successfully'));
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

    res.status(200).send(new ApiResponse(200 , updateCategory , "Category updated successfully"));
  } catch (error) {
    res.status(500).json({ message: "Error updating category", error });
  }
};



