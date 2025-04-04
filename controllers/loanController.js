import { Farmer } from "../model/Farmer.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import exceljs from "exceljs";
import path from "path";
import fs from "fs";

// Create a new loan for a farmer
const createLoan = asyncHandler(async (req, res) => {
  const { farmerId, loanAmount, loanDate } = req.body;
  const subAdmin = req.subAdmin._id;
  if (!farmerId || !loanAmount || !loanDate) {
    throw new ApiError(400, "All fields are required");
  }

  const farmer = await Farmer.findOne({ farmerId: farmerId, subAdmin });
  if (!farmer) {
    throw new ApiError(404, "Farmer not found");
  }

  const loan = {
    loanDate,
    loanAmount,
    originalAmount:loanAmount,
  };

  farmer.loan.push(loan);

  // Update totals accordingly
  farmer.totalLoan += Number(loanAmount);
  farmer.totalLoanRemaining += Number(loanAmount);
  await farmer.save();

  return res
    .status(201)
    .json(new ApiResponse(201, farmer, "Loan added successfully"));
});

// Retrieve all loans for farmers under a specific subAdmin
const getAllLoans = asyncHandler(async (req, res) => {
  const farmers = await Farmer.find({ subAdmin: req.subAdmin._id });
  // Note: In reports, you can filter out or include soft-deleted loans as needed.
  
  return res
    .status(200)
    .json(new ApiResponse(200, farmers, "All loans fetched successfully"));
});

// Update an existing loan with history logging
const updateLoan = asyncHandler(async (req, res) => {
  const { loanId } = req.params;
  const { loanAmount, loanDate } = req.body;

  if (!loanAmount || !loanDate) {
    throw new ApiError(400, "All fields are required");
  }

  // Find the farmer document that contains the loan and belongs to the subAdmin
  const farmer = await Farmer.findOne({
    "loan._id": loanId,
    subAdmin: req.subAdmin._id,
  });
  if (!farmer) {
    throw new ApiError(404, "Farmer not found");
  }

  // Locate the index of the loan within the farmer's loan array
  const loanIndex = farmer.loan.findIndex(
    (loan) => loan._id.toString() === loanId
  );

  if (loanIndex === -1) {
    throw new ApiError(404, "Loan not found");
  }

  // Save the current state of the loan into the history array before updating
  // farmer.loan[loanIndex].history.push({
  //   changedAt: new Date(),
  //   loanDate: farmer.loan[loanIndex].loanDate,
  //   loanAmount: farmer.loan[loanIndex].loanAmount,
  //   operation: "update",
  // });

  const oldLoanAmount = Number(farmer.loan[loanIndex].loanAmount);

  // Update the loan record
  farmer.loan[loanIndex].loanDate = loanDate;
  farmer.loan[loanIndex].loanAmount = loanAmount;
  farmer.loan[loanIndex].originalAmount = loanAmount;
  // Adjust totals to reflect the updated loan amount
  farmer.totalLoan = farmer.totalLoan - oldLoanAmount + Number(loanAmount);
  farmer.totalLoanRemaining =
    farmer.totalLoanRemaining - oldLoanAmount + Number(loanAmount);

  await farmer.save();

  return res
    .status(200)
    .json(new ApiResponse(200, farmer, "Loan updated successfully"));
});

const deductLoan = asyncHandler(async (req, res) => {
  console.log("req.params", req.params);

  const { loanId } = req.params;
  console.log("loanId", loanId);

  const { loanAmount } = req.body;

  if (!loanAmount) {
    throw new ApiError(400, "All fields are required");
  }

  // Find the farmer document that contains the loan and belongs to the subAdmin
  const farmer = await Farmer.findOne({
    "loan._id": loanId,
    subAdmin: req.subAdmin._id,
  });

  console.log("farmer", farmer);
  if (!farmer) {
    throw new ApiError(404, "Farmer not found");
  }

  // Locate the index of the loan within the farmer's loan array
  const loanIndex = farmer.loan.findIndex(
    (loan) => loan._id.toString() === loanId
  );
  if (loanIndex === -1) {
    throw new ApiError(404, "Loan not found");
  }

  const oldLoanAmount = Number(farmer.loan[loanIndex].loanAmount);

  if (oldLoanAmount < Number(loanAmount)) {
    throw new ApiError(400, "Loan amount is not enough");
  }
  // Update the loan record by deducting the loan amount
  farmer.loan[loanIndex].loanAmount = oldLoanAmount - Number(loanAmount);

  // Adjust totals to reflect the updated loan amount
  farmer.totalLoanPaidBack = farmer.totalLoanPaidBack + Number(loanAmount);
  farmer.totalLoanRemaining = farmer.totalLoanRemaining - Number(loanAmount);

  // Save the current state of the loan into the history array before updating
  farmer.loan[loanIndex].history.push({
    changedAt: new Date(),
    loanDate: farmer.loan[loanIndex].loanDate,
    loanAmount: farmer.loan[loanIndex].loanAmount,
    operation: "deduct",
  });

  await farmer.save();

  return res
    .status(200)
    .json(new ApiResponse(200, farmer, "Loan deducted successfully"));
});

// Soft delete a loan with history logging
const deleteLoan = asyncHandler(async (req, res) => {
  const { loanId } = req.params;

  const farmer = await Farmer.findOne({
    "loan._id": loanId,
    subAdmin: req.subAdmin._id,
  });
  if (!farmer) {
    throw new ApiError(404, "Farmer not found");
  }

  const loanIndex = farmer.loan.findIndex(
    (loan) => loan._id.toString() === loanId
  );
  if (loanIndex === -1) {
    throw new ApiError(404, "Loan not found");
  }

  
  // Log the deletion in the history array
  farmer.loan[loanIndex].history.push({
    changedAt: new Date(),
    loanDate: farmer.loan[loanIndex].loanDate,
    loanAmount: farmer.loan[loanIndex].loanAmount,
    operation: "delete",
  });

  // Update totals to remove the deleted loan's amount
  // farmer.totalLoan -= Number(farmer.loan[loanIndex].loanAmount);
  farmer.totalLoanRemaining -= Number(farmer.loan[loanIndex].loanAmount);

  // Mark the loan as deleted (soft delete)
  farmer.loan[loanIndex].isDeleted = true;

  await farmer.save();

  return res
    .status(200)
    .json(new ApiResponse(200, farmer, "Loan deleted successfully"));
});

//Utility function for getting the start and end dates .. .
const getDateRange = (type) => {
  const now = new Date();
  let startDate, endDate;

  switch (type) {
    case "daily":
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
      break;

    case "weekly":
      const startOfWeek = new Date(now);
      const dayOfWeek = now.getDay(); // 0 (Sun) to 6 (Sat)
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Monday start
      startOfWeek.setDate(now.getDate() + diff);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      startDate = startOfWeek;
      endDate = endOfWeek;
      break;

    case "monthly":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
      break;

    case "yearly":
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
      endDate.setHours(23, 59, 59, 999);
      break;

    default:
      throw new Error("Invalid report type");
  }

  return { startDate, endDate };
};

// Generate loan report for all farmers
const generateLoanReportSubAdmin = asyncHandler(async (req, res) => {
  try {
    const { reportType } = req.query;
    const type = reportType;
    const { startDate, endDate } = getDateRange(type);

    let query = {
      loan: { $elemMatch: { loanDate: { $gte: startDate, $lte: endDate } } },
    };

    if (req.subAdmin) {
      query.subAdmin = req.subAdmin._id;
    }

    const farmers = await Farmer.aggregate([
      { $match: query },
      {
        $project: {
          farmerName: 1,
          mobileNumber: 1,
          address: 1,
          totalLoan: 1,
          totalLoanPaidBack: 1,
          totalLoanRemaining: 1,
          loan: {
            $filter: {
              input: "$loan",
              as: "loan",
              cond: {
                $and: [
                  { $gte: ["$$loan.loanDate", startDate] },
                  { $lte: ["$$loan.loanDate", endDate] },
                ],
              },
            },
          },
        },
      },
    ]);

    console.log("farmers: ", farmers);
    if (!farmers || farmers.length === 0) {
      console.log("No loans found in the given date range");
      return res
        .status(404)
        .json({ success: false, message: "No loans found in the given date range" });
    }

    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet("Loans");

    worksheet.columns = [
      { header: "Farmer ID", key: "farmerId", width: 20 },
      { header: "Farmer Name", key: "farmerName", width: 20 },
      { header: "Mobile Number", key: "mobileNumber", width: 20 },
      { header: "Address", key: "address", width: 20 },
      { header: "Total Loan", key: "totalLoan", width: 20 },
      { header: "Total Loan Remaining", key: "totalLoanRemaining", width: 20 },
      { header: "Loan ID", key: "loanId", width: 20 },
      { header: "Loan Date", key: "loanDate", width: 20 },
      { header: "Loan Amount", key: "loanAmount", width: 20 },
    ];

    farmers.forEach((farmer) => {
      farmer.loan.forEach((loan) => {
        worksheet.addRow({
          farmerId: farmer._id,
          farmerName: farmer.farmerName,
          mobileNumber: farmer.mobileNumber,
          address: farmer.address,
          totalLoan: farmer.totalLoan,
          totalLoanRemaining: farmer.totalLoanRemaining,
          loanId: loan._id,
          loanDate: loan.loanDate.toISOString().split("T")[0],
          loanAmount: loan.loanAmount,
        });
      });
    });

    const filePath = path.join(process.cwd(), "public", "loans.xlsx");

    await workbook.xlsx.writeFile(filePath);

    return res.download(filePath, "loans.xlsx", (err) => {
      if (err) {
        console.error("Download Error:", err);
        return res
          .status(500)
          .json({ success: false, message: "Error occurred while downloading the file", error: err.message });
      }
      setTimeout(() => fs.unlinkSync(filePath), 5000);
    });

  } catch (error) {
    console.error("Error Generating Loan Report:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
});


const generateLoanReportAdmin = asyncHandler(async (req, res) => {
  const farmers = await Farmer.find({}).select(
    "loan farmerName mobileNumber address totalLoan totalLoanPaidBack totalLoanRemaining"
  );

  if (!farmers || farmers.length === 0) {
    throw new ApiError(404, "No loans found");
  }

  const workbook = new exceljs.Workbook();
  const worksheet = workbook.addWorksheet("Loans");

  // Define columns for the Excel sheet
  worksheet.columns = [
    { header: "Farmer ID", key: "farmerId", width: 20 },
    { header: "Farmer Name", key: "farmerName", width: 20 },
    { header: "Mobile Number", key: "mobileNumber", width: 20 },
    { header: "Address", key: "address", width: 20 },
    { header: "Total Loan", key: "totalLoan", width: 20 },
    // { header: "Total Loan Paid Back", key: "totalLoanPaidBack", width: 20 },
    { header: "Total Loan Remaining", key: "totalLoanRemaining", width: 20 },
    // { header: "Loan ID", key: "loanId", width: 20 },
    // { header: "Loan Date", key: "loanDate", width: 20 },
    // { header: "Loan Amount", key: "loanAmount", width: 20 },
  ];

  // Add rows for each loan
  farmers.forEach((farmer) => {
    farmer.loan.forEach((loan) => {
      worksheet.addRow({
        farmerId: farmer._id,
        farmerName: farmer.farmerName,
        mobileNumber: farmer.mobileNumber,
        address: farmer.address,
        totalLoan: farmer.totalLoan,
        // totalLoanPaidBack: farmer.totalLoanPaidBack,
        totalLoanRemaining: farmer.totalLoanRemaining,
        // loanId: loan._id,
        // loanDate: loan.loanDate,
        // loanAmount: loan.loanAmount,
      });
    });
  });

  const filePath = path.join(process.cwd(), "public", "loans.xlsx");

  // Write the file and respond with download link
  await workbook.xlsx.writeFile(filePath);

  return res.download(filePath, "loans.xlsx", (err) => {
    if (err) {
      throw new ApiError(500, "Error occurred while downloading the file");
    }

    // Clean up file after download
    fs.unlinkSync(filePath);
  });
});

// Generate loan report for all farmers
// const generateLoanReportSubAdmin = asyncHandler(async (req, res) => {
//   // const { startDate, endDate } = req.query;

//   // const start = new Date(startDate);
//   // const end = new Date(endDate);
//   // end.setHours(23, 59, 59, 999);
//   const { reportType } = req.query;
//   const type = reportType;
//   const { startDate, endDate } = getDateRange(type);

//   let query = {
//     loan: { $elemMatch: { loanDate: { $gte: startDate, $lte: endDate } } },
//   };

//   if (req.subAdmin) {
//     query.subAdmin = req.subAdmin._id;
//   }

//   const farmers = await Farmer.aggregate([
//     { $match: query },
//     {
//       $project: {
//         farmerName: 1,
//         mobileNumber: 1,
//         address: 1,
//         totalLoan: 1,
//         totalLoanPaidBack: 1,
//         totalLoanRemaining: 1,
//         loan: {
//           $filter: {
//             input: "$loan",
//             as: "loan",
//             cond: {
//               $and: [
//                 { $gte: ["$$loan.loanDate", startDate] },
//                 { $lte: ["$$loan.loanDate", endDate] },
//               ],
//             },
//           },
//         },
//       },
//     },
//   ]);

//   console.log("farmers: ", farmers);
//   if (!farmers || farmers.length === 0) {
//     // throw new ApiError(404, "No loans found in the given date range");
//     return res.status(404).json({success : false , message : "No loans found in the given date range"})
//   }

//   const workbook = new exceljs.Workbook();
//   const worksheet = workbook.addWorksheet("Loans");

//   worksheet.columns = [
//     { header: "Farmer ID", key: "farmerId", width: 20 },
//     { header: "Farmer Name", key: "farmerName", width: 20 },
//     { header: "Mobile Number", key: "mobileNumber", width: 20 },
//     { header: "Address", key: "address", width: 20 },
//     { header: "Total Loan", key: "totalLoan", width: 20 },
//     { header: "Total Loan Remaining", key: "totalLoanRemaining", width: 20 },
//     { header: "Loan ID", key: "loanId", width: 20 },
//     { header: "Loan Date", key: "loanDate", width: 20 },
//     { header: "Loan Amount", key: "loanAmount", width: 20 },
//   ];

//   farmers.forEach((farmer) => {
//     farmer.loan.forEach((loan) => {
//       worksheet.addRow({
//         farmerId: farmer._id,
//         farmerName: farmer.farmerName,
//         mobileNumber: farmer.mobileNumber,
//         address: farmer.address,
//         totalLoan: farmer.totalLoan,
//         totalLoanRemaining: farmer.totalLoanRemaining,
//         loanId: loan._id,
//         loanDate: loan.loanDate.toISOString().split("T")[0],
//         loanAmount: loan.loanAmount,
//       });
//     });
//   });

//   const filePath = path.join(process.cwd(), "public", "loans.xlsx");

//   await workbook.xlsx.writeFile(filePath);

//   return res.download(filePath, "loans.xlsx", (err) => {
//     if (err) {
//       return res.status(500).json({success : false , message : "Error occurred while downloading the file"})
//     }
//     setTimeout(() => fs.unlinkSync(filePath), 5000);
//   });
// });

// Generate loan report by farmer ID
const generateLoanReportByMobileNumber = asyncHandler(async (req, res) => {
  const { farmerId } = req.params;

  const farmer = await Farmer.findOne({
    farmerId,
    subAdmin: req.subAdmin._id,
  }).select(
    "loan farmerName mobileNumber address totalLoan totalLoanPaidBack totalLoanRemaining"
  );

  if (!farmer || !farmer.loan?.length) {
    throw new ApiError(404, "No loans found for the specified farmer");
  }

  const workbook = new exceljs.Workbook();
  const worksheet = workbook.addWorksheet("Farmer Loans");

  console.log("yes . . . ");
  // Define columns for the Excel sheet
  worksheet.columns = [
    { header: "Farmer ID", key: "farmerId", width: 20 },
    { header: "Farmer Name", key: "farmerName", width: 20 },
    { header: "Mobile Number", key: "mobileNumber", width: 20 },
    { header: "Address", key: "address", width: 20 },
    { header: "Total Loan", key: "totalLoan", width: 20 },
    // { header: "Total Loan Paid Back", key: "totalLoanPaidBack", width: 20 },
    { header: "Total Loan Remaining", key: "totalLoanRemaining", width: 20 },
    // { header: "Loan ID", key: "loanId", width: 20 },
    // { header: "Loan Date", key: "loanDate", width: 20 },
    // { header: "Loan Amount", key: "loanAmount", width: 20 },
  ];

  // Add rows for each loan of the specified farmer
  farmer.loan.forEach((loan) => {
    worksheet.addRow({
      farmerId: farmer.farmerId,
      farmerName: farmer.farmerName,
      mobileNumber: farmer.mobileNumber,
      address: farmer.address,
      totalLoan: farmer.totalLoan,
      // totalLoanPaidBack: farmer.totalLoanPaidBack,
      totalLoanRemaining: farmer.totalLoanRemaining,
      // loanId: loan._id,
      // loanDate: loan.loanDate,
      // loanAmount: loan.loanAmount,
    });
  });

  const filePath = path.join(
    process.cwd(),
    "public",
    `loans-${mobileNumber}.xlsx`
  );

  // Write the file and respond with download link
  await workbook.xlsx.writeFile(filePath);

  return res.download(filePath, `loans-${farmer._id}.xlsx`, (err) => {
    if (err) {
      throw new ApiError(500, "Error occurred while downloading the file");
    }

    // Clean up file after download
    setTimeout(() => fs.unlinkSync(filePath), 5000);
  });
});

export {
  createLoan,
  getAllLoans,
  updateLoan,
  deleteLoan,
  deductLoan,
  generateLoanReportAdmin,
  generateLoanReportSubAdmin,
  generateLoanReportByMobileNumber,
};
