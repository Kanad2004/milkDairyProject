import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Admin } from "../model/Admin.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Farmer from "../model/Farmer.js";

const addFarmer = asyncHandler(async (req, res) => {
    const {farmerName , mobileNumber , address} = req.body ;
    const admin = req.admin ; 

    if([farmerName , mobileNumber , address].some((field) => field?.trim === "")){
        throw new ApiError(400 , "All Fields are required ")
    }

    const farmer = await Farmer.findOne({mobileNumber})

    if(farmer){
        throw new ApiError(409, "Farmer with this mobile number already exists")
    }

    const newFarmer = await Farmer.create({
        farmerName,
        mobileNumber, 
        address ,
        admin
    })

    if(!newFarmer){
        throw new ApiError(500 , "Farmer is not added successfully")
    }

    return res.status(201).json(
        new ApiResponse(200, newFarmer, "Farmer Registered Successfully ! ")
    )

});

const getAllFarmers = asyncHandler(async (req,res) => {
    const farmers = await Farmer.find({}).populate("admin", "adminName");
  return res
    .status(200)
    .json(new ApiResponse(200, farmers, "All farmers fetched"));
});


const getFarmerById = asyncHandler(async (req, res) => {
    const { farmerId } = req.params;
  
    const farmer = await Farmer.findById(farmerId).populate("admin", "adminName");
  
    if (!farmer) {
      throw new ApiError(404, "Farmer not found");
    }
  
    return res.status(200).json(new ApiResponse(200, farmer, "Farmer found"));
  });

  const updateFarmer = asyncHandler(async (req, res) => { 
    const { farmerId } = req.params;                  
    const { farmerName, mobileNumber, address } = req.body;

    const farmer = await Farmer.findById(farmerId);                   

    if (!farmer) {                

        throw new ApiError(404, "Farmer not found");              
    }    
    if (farmerName) {                     

        farmer.farmerName = farmerName;                 
    }

    if (mobileNumber) {                     

        farmer.mobileNumber = mobileNumber;                 
    }

    if (address) {                     

        farmer.address = address;                 
    }

    const updatedFarmer = await farmer.save();

    return res.status(200).json(new ApiResponse(200, updatedFarmer, "Farmer updated successfully"));
  });

    const deleteFarmer = asyncHandler(async (req, res) => {
        const { farmerId } = req.params;
        const farmer = await Farmer.findById(farmerId);
        if (!farmer) {
          throw new ApiError(404, "Farmer not found");
        }
        await farmer.remove();
        return res.status(200).json(new ApiResponse(200, {}, "Farmer deleted successfully"));
      });

export { addFarmer, getAllFarmers, getFarmerById, updateFarmer, deleteFarmer };


// export {addFarmer , getAllFarmers}