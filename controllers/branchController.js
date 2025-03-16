import { Branch } from "../model/Branch.js";
import { SubAdmin } from "../model/SubAdmin.js";
import { ApiResponse } from "../utils/ApiResponse.js";

//!This is done
const createBranch = async (req, res) => {
  const { branchId, branchAddress, location } = req.body;
  const branch = await Branch.findOne({ branchId });

  if (branch) {
    return res
      .status(400)
      .send(new ApiResponse(400, {}, "Branch already exists"));
  }

  const newBranch = await Branch.create({ branchId, branchAddress, location });

  if (!newBranch) {
    return res
      .status(400)
      .send(new ApiResponse(400, {}, "Branch creation failed"));
  }

  return res
    .status(201)
    .send(new ApiResponse(200, newBranch, "Branch created successfully"));
};

//!This is done
const getBranches = async (req, res) => {
  const branches = await Branch.find();
  res
    .status(200)
    .send(new ApiResponse(200, branches, "all branched getched successfully"));
};

const getBranchesForCustomers = async (req,res) => {
  const branches = await Branch.find();
  res
  .status(200)
  .send(new ApiResponse(200, branches, "all branched getched successfully"));
}; 

//!This is done
const getBranchById = async (req, res) => {
  const { branchId } = req.params;
  const branch = await Branch.findOne({ branchId });
  if (!branch) {
    return res.status(400).send(new ApiResponse(400, {}, "Branch not found"));
  }
  return res
    .status(200)
    .send(new ApiResponse(200, branch, "Branch found successfully"));
};

//!This is done
const updateBranchById = async (req, res) => {
  const { branchId } = req.params;
  const { branchAddress, location } = req.body;
  const branch = await Branch.findOneAndUpdate(
    { branchId },
    { branchAddress, location },
    { new: true }
  );
  if (!branch) {
    return res.status(400).send(new ApiResponse(400, {}, "Branch not found"));
  }
  return res
    .status(200)
    .send(new ApiResponse(200, branch, "Branch updated successfully"));
};

const deleteBranchById = async (req, res) => {
  const { branchId } = req.params;
  // Find the branch (but do not delete yet)
  const branch = await Branch.findOne({ branchId });
  if (!branch) {
    return res.status(400).send(new ApiResponse(400, {}, "Branch not found"));
  }

  // Check if any sub-admins reference this branch
  const subAdmins = await SubAdmin.find({ branch: branch._id });
  if (subAdmins.length > 0) {
    return res
      .status(400)
      .send(
        new ApiResponse(
          400,
          {},
          "Branch cannot be deleted because it has associated sub-admins"
        )
      );
  }

  // No sub-admin references; safe to delete
  const deletedBranch = await Branch.findOneAndDelete({ branchId });
  return res
    .status(200)
    .send(new ApiResponse(200, deletedBranch, "Branch deleted successfully"));
};

export {
  createBranch,
  getBranches,
  getBranchById,
  updateBranchById,
  deleteBranchById,
  getBranchesForCustomers
};
