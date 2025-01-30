import {Branch} from "../model/Branch.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const createBranch = async (req, res) => {
    const { branchName, location } = req.body;
    if (!branchName || !location) {
        throw new ApiError(400, "Branch name and location are required");
    }

    const branch = await Branch.create({ branchName, location });

    return res.status(201).send(new ApiResponse(201 , branch , "Branch created successfully"));
};

const getBranches = async (req, res) => {
    const branches = await Branch.find();
    res.status(200).send(new ApiResponse(200 , branches , "All branches fetched successfully"));
};

export {createBranch , getBranches}
