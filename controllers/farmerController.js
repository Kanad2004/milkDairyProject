import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Admin } from "../model/Admin.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Farmer } from "../model/Farmer.js";
import xlsx from "xlsx";
import path from "path";
import fs from "fs";

const addFarmer = asyncHandler(async (req, res) => {
  const { farmerName, mobileNumber, address } = req.body;
  const subAdmin = req.subAdmin._id;
  if (!farmerName?.trim() || !mobileNumber || !address?.trim()) {
    throw new ApiError(400, "All fields are required");
  }
  

  const farmer = await Farmer.findOne({ mobileNumber });
  
  
  console.log(farmer);

  if (farmer !== null) {
    throw new ApiError(409, "farmer with same credentials already exists");
  }

  const newfarmer = await Farmer.create({
    farmerName,
    mobileNumber,
    address,
    subAdmin,
  });

  if (!newfarmer) {
    throw new ApiError(500, "farmer is not added successfully");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, newfarmer, "farmer Registered Successfully ! "));
});

const getAllfarmers = asyncHandler(async (req, res) => {
  const farmers = await Farmer.find();

  if (!farmers) {
    throw new ApiError(404, "No farmers found");
  }

  return res
    .status(200)
    .send(new ApiResponse(200, farmers, "All farmers got successfully . .."));
});

const addMilk = asyncHandler(async (req, res) => {
  const { farmerNumber, transactionDate, transactionAmount, milkQuantity } =
    req.body;

  const farmer = await Farmer.findOne({ mobileNumber: farmerNumber });

  if (!farmer) {
    throw new ApiError(404, "Enter farmer mobile not found");
  }

  console.log("Transaction Date:", transactionDate);
  console.log("Transaction Amount:", transactionAmount);
  console.log("Milk Quntity:", milkQuantity);

  if (!transactionDate || !transactionAmount || !milkQuantity) {
    throw new ApiError(400, "All fields are required");
  }

  if (transactionAmount < 0 || milkQuantity < 0) {
    throw new ApiError(400, "Amount and Quntity cannot be negative");
  }

  farmer.transaction.push({
    transactionDate,
    transactionAmount,
    milkQuantity,
  });

  await farmer.save();

  return res
    .status(200)
    .send(new ApiResponse(200, farmer, "Milk added successfully"));
});

const deleteFarmer = async (req, res) => {
  const { farmerNumber } = req.body;
  const farmer = await Farmer.findOne({ mobileNumber: farmerNumber });
  console.log("FarmerNumber", farmerNumber);
  console.log("Farmer", farmer);

  if (!farmer) {
    throw new ApiError(404, "Farmer not found");
  }

  await Farmer.deleteOne({ mobileNumber: farmerNumber });
  res.status(200).json(new ApiResponse(200, {}, "Farmer deleted"));
};

// const updateFarmer = async (req, res) => {
//   const {
//     farmerName,
//     mobileNumber,
//     address,
//     totalLoan,
//     totalLoanPaidBack,
//     totalLoanRemaining,
//     loans,
//   } = req.body;
//   const farmer = await Farmer.findOne({ farmerNumber: farmerNumber });

//   if (!farmer) {
//     throw new ApiError(404, "Farmer not found");
//   }

//   if (
//     [
//       farmerName,
//       mobileNumber,
//       address,
//       totalLoan,
//       totalLoanPaidBack,
//       totalLoanRemaining,
//       loans,
//     ].some((field) => field?.trim === "")
//   ) {
//     throw new ApiError(400, "All Fields are required ");
//   }
//   farmer.farmerName = farmerName;
//   farmer.mobileNumber = mobileNumber;
//   farmer.address = address;
//   farmer.totalLoan = totalLoan;
//   farmer.totalLoanPaidBack = totalLoanPaidBack;
//   farmer.totalLoanRemaining = totalLoanRemaining;
//   farmer.loan = loans;
//   await farmer.save();
//   res.status(200).json(new ApiResponse(200, farmer, "Farmer updated"));
// };

const exportFarmerDetail = async (req, res) => {
  try {
    const farmerId = req.params.farmerId;
    const farmer = await Farmer.findById(farmerId).populate("admin subAdmin"); // Adjust field projection as needed

    if (!farmer) {
      throw new ApiError(404, "Farmer not found");
    }

    const data = [
      {
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
        fs.unlinkSync(filePath); // Delete file only after response is sent
      }
    });
  } catch (error) {
    console.error("Error exporting farmer details:", error);
    res
      .status(error.status || 500)
      .send(new ApiResponse(error.status || 500, null, error.message));
  }
};

export { addFarmer, getAllfarmers, addMilk, deleteFarmer, exportFarmerDetail };