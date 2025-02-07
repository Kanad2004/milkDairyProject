import { Branch } from "../model/Branch.js";
import { ApiResponse } from "../utils/ApiResponse.js";

//!This is done
const createBranch = async (req, res) => {
<<<<<<< HEAD
    const { branchName, location } = req.body;
    if (!branchName || !location) {
        throw new ApiError(400, "Branch name and location are required");
    }

    const branch = await Branch.create({ branchName, location });

    return res.status(201).send(new ApiResponse(201 , branch , "Branch created successfully"));
=======
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
>>>>>>> 14a5353bd279100d6e5c27cb46140631f278c929
};

//!This is done
const getBranches = async (req, res) => {
<<<<<<< HEAD
    const branches = await Branch.find();
    res.status(200).send(new ApiResponse(200 , branches , "All branches fetched successfully"));
=======
  const branches = await Branch.find();
  res
    .status(200)
    .send(new ApiResponse(200, branches, "all branched getched successfully"));
>>>>>>> 14a5353bd279100d6e5c27cb46140631f278c929
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
  const branch = await Branch.findOneAndDelete({ branchId });
  if (!branch) {
    return res.status(400).send(new ApiResponse(400, {}, "Branch not found"));
  }
  return res
    .status(200)
    .send(new ApiResponse(200, branch, "Branch deleted successfully"));
};

export {
  createBranch,
  getBranches,
  getBranchById,
  updateBranchById,
  deleteBranchById,
};
