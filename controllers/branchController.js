import { Branch } from "../model/Branch.js";
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

export { createBranch, getBranches, getBranchById };
