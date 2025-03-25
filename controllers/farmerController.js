import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Farmer } from "../model/Farmer.js";
import xlsx from "xlsx";
import path from "path";

const addFarmer = asyncHandler(async (req, res) => {
  const {
    farmerId,
    farmerName,
    mobileNumber,
    address,
    milkType,
    gender,
    joiningDate,
  } = req.body;
  const subAdmin = req.subAdmin._id;
  

  // Validate that all required fields are provided and not empty.
  // For string fields, we trim the value to avoid spaces being considered valid.
  if (
    [
      farmerId,
      farmerName,
      mobileNumber,
      address,
      milkType,
      gender,
      joiningDate,
    ].some((field) => {
      return !field || (typeof field === "string" && field.trim() === "");
    })
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if a farmer with the same Id already exists
  const existingFarmer = await Farmer.findOne({
    subAdmin,
    farmerId,
  });
  if (existingFarmer) {
    throw new ApiError(409, "A farmer with the same id exists");
  }

  // Create a new farmer with the provided data.
  // For string fields, we trim the values. For joiningDate, convert it to a Date object if needed.
  const newFarmer = await Farmer.create({
    farmerId: Number(farmerId),
    farmerName: farmerName,
    mobileNumber: mobileNumber,
    address: address,
    milkType: milkType,
    gender: gender,
    joiningDate: new Date(joiningDate), // Adjust formatting as needed
    subAdmin,
  });

  if (!newFarmer) {
    throw new ApiError(500, "Farmer was not added successfully");
  }

  const createdFarmer = await Farmer.findById(newFarmer._id).populate(
    "subAdmin"
  );

  // Return a success response with a 201 status code.
  return res
    .status(201)
    .json(
      new ApiResponse(201, createdFarmer, "Farmer Registered Successfully!")
    );
});

const getAllfarmers = asyncHandler(async (req, res) => {
  const subAdminId = req.subAdmin._id;
  const farmers = await Farmer.find({ subAdmin: subAdminId }).populate(
    "subAdmin"
  );
  if (!farmers || farmers.length === 0) {
    throw new ApiError(404, "No farmers found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, farmers, "Farmers fetched successfully"));
});

const updateFarmer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const subAdmin = req.subAdmin._id;

  const farmer = await Farmer.findOne({ _id: id, subAdmin: subAdmin });

  if (!farmer) {
    throw new ApiError(
      404,
      "Farmer not found or you are not authorized to update this farmer"
    );
  }

  const {
    farmerId,
    farmerName,
    mobileNumber,
    address,
    milkType,
    gender,
    joiningDate,
  } = req.body;

  if (
    !farmerId ||
    !farmerName ||
    !mobileNumber ||
    !address ||
    !milkType ||
    !gender ||
    !joiningDate
  ) {
    throw new ApiError(400, "All fields are required");
  }

  farmer.farmerId = farmerId;
  farmer.farmerName = farmerName;
  farmer.mobileNumber = mobileNumber;
  farmer.address = address;
  farmer.milkType = milkType;
  farmer.gender = gender;
  farmer.joiningDate = joiningDate;

  const updatedFarmer = await farmer.save();

  return res
    .status(200)
    .json(new ApiResponse(200, updatedFarmer, "Farmer updated successfully"));
});

const deleteFarmer = async (req, res) => {
  const { id } = req.params;
  const subAdminId = req.subAdmin._id;

  const farmer = await Farmer.findOne({ _id: id, subAdmin: subAdminId });
  if (!farmer) {
    throw new ApiError(
      404,
      "Farmer not found or you are not authorized to delete this farmer"
    );
  }
  await farmer.deleteOne();
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Farmer deleted successfully"));
};

const exportFarmerDetail = async (req, res) => {
  try {
    const farmerId = req.params.farmerId;
    const farmer = await Farmer.findById(farmerId).populate("admin subAdmin"); // Adjust field projection as needed

    if (!farmer) {
      throw new ApiError(404, "Farmer not found");
    }

    const data = [
      {
        "Farmer Id": farmer.farmerId,
        "Farmer Name": farmer.farmerName,
        "Mobile Number": farmer.mobileNumber,
        Address: farmer.address,
        "Total Loan": farmer.totalLoan,
        "Total Loan Paid Back": farmer.totalLoanPaidBack,
        "Total Loan Remaining": farmer.totalLoanRemaining,
        "Admin ID": farmer.admin?._id || "N/A",
        "Sub-Admin ID": farmer.subAdmin?._id || "N/A",
      },
    ];

    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(workbook, worksheet, "Farmer Details");

    const filePath = path.resolve(process.cwd(), "FarmerDetails.xlsx");
    console.log("File Path:", filePath);

    xlsx.writeFile(workbook, filePath);

    res.download(filePath, "FarmerDetails.xlsx", (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(500).send("Error sending file.");
      } else {
        // fs.unlinkSync(filePath); // Delete file only after response is sent
      }
    });
  } catch (error) {
    console.error("Error exporting farmer details:", error);
    res
      .status(error.status || 500)
      .send(new ApiResponse(error.status || 500, null, error.message));
  }
};

export {
  addFarmer,
  getAllfarmers,
  deleteFarmer,
  exportFarmerDetail,
  updateFarmer,
};
