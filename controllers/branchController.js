import {Branch} from "../model/Branch.js"
import {ApiResponse} from "../utils/ApiResponse.js"

//!This is done
const createBranch = async (req, res) => {
    const { branchName, location } = req.body;
    const branch = await Branch.create({ branchName, location });


    return res.status(201).send(new ApiResponse(200 , branch , "Branch created successfully"));
};

//!This is done
const getBranches = async (req, res) => {
    const branches = await Branch.find();
    res.status(200).send(new ApiResponse(200 , branches , "all branched getched successfully"));
};

export {createBranch , getBranches}
