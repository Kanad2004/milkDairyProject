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


import express from 'express';
import PDFDocument from 'pdfkit';
import fs from 'fs';

// Create the 'reports' directory if it doesn't exist
const reportsDirectory = path.join(process.cwd(), 'reports');
if (!fs.existsSync(reportsDirectory)) {
  fs.mkdirSync(reportsDirectory);
}

const farmerCombinedReport = async (req,res) => {
  try {
    const { mobileNumber } = req.params;
    const farmer = await Farmer.findOne({ mobileNumber });

    if (!farmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }
    console.log("1");
    const fileName = `Farmer_Report_${mobileNumber}.pdf`;
    const pdfPath = path.join(reportsDirectory, fileName);
    console.log("2");
    // Create a new PDF with better styling options
    const doc = new PDFDocument({
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      size: 'A4',
    });
    
    // Set document properties
    doc.info.Title = `Farmer Report - ${farmer.farmerName}`;
    // doc.info.Author = 'Milkman Management System';
    
    const writeStream = fs.createWriteStream(pdfPath);
    doc.pipe(writeStream); // Save locally

    // -- Header with logo placeholder --
    doc.rect(50, 40, 495, 70).fillAndStroke('#F0F8FF', '#003366');
    doc.fontSize(22).fillColor('#003366')
       .text('FARMER MILK REPORT', 50, 55, { align: 'center' });
    doc.fontSize(12).fillColor('#003366')
       .text('Milkman Management System', 50, 85, { align: 'center' });
    
    doc.moveDown(4);

    // -- Farmer Information Box --
    doc.roundedRect(50, doc.y, 495, 70, 5)
       .fillAndStroke('#E6F2FF', '#003366');
    
    const infoStartY = doc.y + 15;
    doc.fillColor('#003366').fontSize(14)
       .text(`Farmer: ${farmer.farmerName}`, 70, infoStartY);
    doc.fontSize(11)
       .text(`Mobile: ${farmer.mobileNumber}`, 70, infoStartY + 20)
       .text(`Address: ${farmer.address}`, 300, infoStartY + 20)
       .text(`Joining Date: ${new Date(farmer.joiningDate).toDateString()}`, 70, infoStartY + 40);
    
    doc.moveDown(4);
    
    // Group transactions by time and milk type
    const groupedTransactions = {
      morning: { cow: [], buffalo: [] },
      evening: { cow: [], buffalo: [] }
    };
    
    farmer.transaction.forEach(t => {
      const timeOfDay = t.transactionTime?.toLowerCase() || 
                        (new Date(t.transactionDate).getHours() < 12 ? 'morning' : 'evening');
      const milkType = t.milkType.toLowerCase();
      
      if (timeOfDay === 'morning') {
        if (milkType === 'cow') groupedTransactions.morning.cow.push(t);
        else groupedTransactions.morning.buffalo.push(t);
      } else {
        if (milkType === 'cow') groupedTransactions.evening.cow.push(t);
        else groupedTransactions.morning.buffalo.push(t);
      }
    });
    
    // Transaction Summary Header
    doc.fontSize(16).fillColor('#003366')
       .text('TRANSACTION SUMMARY', { align: 'center', underline: true });
    doc.moveDown();
    
    // Table drawing function
    // const drawTransactionTable = (title, transactions, startY) => {
    //   if (transactions.length === 0) return startY;
      
    //   // Check if we need to add a new page
    //   if (startY > 680) {
    //     doc.addPage();
    //     startY = 50;
    //   }
      
    //   // Title for the section
    //   doc.fontSize(12).fillColor('#003366')
    //      .text(title, 50, startY, { underline: true });
      
    //   startY += 20;
      
    //   // Table headers
    //   doc.rect(50, startY, 495, 20).fillAndStroke('#003366', '#003366');
    //   doc.fillColor('#FFFFFF').fontSize(10);
    //   doc.text('Date', 55, startY + 6);
    //   doc.text('Fat', 130, startY + 6);
    //   doc.text('SNF', 175, startY + 6);
    //   doc.text('Qty (L)', 220, startY + 6);
    //   doc.text('Rate (₹)', 280, startY + 6);
    //   doc.text('Amount (₹)', 350, startY + 6);
    //   doc.text('Time', 430, startY + 6);
      
    //   startY += 20;
      
    //   let totalLiters = 0;
    //   let totalAmount = 0;
      
    //   // Table rows
    //   transactions.forEach((t, index) => {
    //     // Alternate row coloring
    //     if (index % 2 === 0) {
    //       doc.rect(50, startY, 495, 20).fillAndStroke('#F8F9FA', '#CCE5FF');
    //     } else {
    //       doc.rect(50, startY, 495, 20).fillAndStroke('#FFFFFF', '#CCE5FF');
    //     }
        
    //     const amount = t.milkQuantity * t.pricePerLitre;
    //     totalLiters += t.milkQuantity;
    //     totalAmount += amount;
        
    //     doc.fillColor('#000000').fontSize(9);
    //     doc.text(new Date(t.transactionDate).toLocaleDateString(), 55, startY + 6);
    //     doc.text(t.fat?.toFixed(1) || 'N/A', 130, startY + 6);
    //     doc.text(t.snf?.toFixed(1) || 'N/A', 175, startY + 6);
    //     doc.text(t.milkQuantity.toFixed(2), 220, startY + 6);
    //     doc.text(t.pricePerLitre.toFixed(2), 280, startY + 6);
    //     doc.text(amount.toFixed(2), 350, startY + 6);
    //     doc.text(t.transactionTime || 'N/A', 430, startY + 6);
        
    //     startY += 20;
    //   });
      
    //   // Total row
    //   doc.rect(50, startY, 495, 22).fillAndStroke('#E6F2FF', '#003366');
    //   doc.fillColor('#003366').fontSize(10).font('Helvetica-Bold');
    //   doc.text('TOTAL', 55, startY + 6);
    //   doc.text(totalLiters.toFixed(2), 220, startY + 6);
    //   doc.text(totalAmount.toFixed(2), 350, startY + 6);
      
    //   return startY + 30;
    // };
    
    const drawTransactionTable = (title, transactions, startY) => {
      if (transactions.length === 0) return startY;
    
      const rowHeight = 20;
      const headerHeight = 20;
      const titleHeight = 20;
      const totalRowHeight = 22;
      const pageBottomMargin = 50;
    
      // Function to check if space is enough
      const ensureSpace = (requiredHeight) => {
        if (startY + requiredHeight > doc.page.height - pageBottomMargin) {
          doc.addPage();
          startY = 50;
        }
      };
    
      // Ensure space for title + header
      ensureSpace(titleHeight + headerHeight);
    
      // Title for the section
      doc.fontSize(12).fillColor('#003366')
         .text(title, 50, startY, { underline: true });
    
      startY += titleHeight;
    
      // Table headers
      doc.rect(50, startY, 495, headerHeight).fillAndStroke('#003366', '#003366');
      doc.fillColor('#FFFFFF').fontSize(10);
      doc.text('Date', 55, startY + 6);
      doc.text('Fat', 130, startY + 6);
      doc.text('SNF', 175, startY + 6);
      doc.text('Qty (L)', 220, startY + 6);
      doc.text('Rate (₹)', 280, startY + 6);
      doc.text('Amount (₹)', 350, startY + 6);
      doc.text('Time', 430, startY + 6);
    
      startY += headerHeight;
    
      let totalLiters = 0;
      let totalAmount = 0;
    
      // Table rows
      transactions.forEach((t, index) => {
        ensureSpace(rowHeight);
    
        // Alternate row coloring
        if (index % 2 === 0) {
          doc.rect(50, startY, 495, rowHeight).fillAndStroke('#F8F9FA', '#CCE5FF');
        } else {
          doc.rect(50, startY, 495, rowHeight).fillAndStroke('#FFFFFF', '#CCE5FF');
        }
    
        const amount = t.milkQuantity * t.pricePerLitre;
        totalLiters += t.milkQuantity;
        totalAmount += amount;
    
        doc.fillColor('#000000').fontSize(9);
        doc.text(new Date(t.transactionDate).toLocaleDateString(), 55, startY + 6);
        doc.text(t.fat?.toFixed(1) || 'N/A', 130, startY + 6);
        doc.text(t.snf?.toFixed(1) || 'N/A', 175, startY + 6);
        doc.text(t.milkQuantity.toFixed(2), 220, startY + 6);
        doc.text(t.pricePerLitre.toFixed(2), 280, startY + 6);
        doc.text(amount.toFixed(2), 350, startY + 6);
        doc.text(t.transactionTime || 'N/A', 430, startY + 6);
    
        startY += rowHeight;
      });
    
      // Total row
      ensureSpace(totalRowHeight);
    
      doc.rect(50, startY, 495, totalRowHeight).fillAndStroke('#E6F2FF', '#003366');
      doc.fillColor('#003366').fontSize(10).font('Helvetica-Bold');
      doc.text('TOTAL', 55, startY + 6);
      doc.text(totalLiters.toFixed(2), 220, startY + 6);
      doc.text(totalAmount.toFixed(2), 350, startY + 6);
    
      return startY + 30;
    };

    
    // Draw tables for each category
    let currentY = doc.y;
    
    // Morning Cow
    if (groupedTransactions.morning.cow.length > 0) {
      currentY = drawTransactionTable('MORNING - COW MILK', groupedTransactions.morning.cow, currentY);
    }
    
    // Morning Buffalo
    if (groupedTransactions.morning.buffalo.length > 0) {
      currentY = drawTransactionTable('MORNING - BUFFALO MILK', groupedTransactions.morning.buffalo, currentY);
    }
    
    // Evening Cow
    if (groupedTransactions.evening.cow.length > 0) {
      currentY = drawTransactionTable('EVENING - COW MILK', groupedTransactions.evening.cow, currentY);
    }
    
    // Evening Buffalo
    if (groupedTransactions.evening.buffalo.length > 0) {
      currentY = drawTransactionTable('EVENING - BUFFALO MILK', groupedTransactions.evening.buffalo, currentY);
    }
    
    // If we don't have enough space for the summary, add a new page
    if (currentY > 700) {
      doc.addPage();
      currentY = 50;
    }
    
    // Grand Total and Summary Section
    doc.moveDown();
    doc.roundedRect(50, currentY, 495, 120, 5)
       .fillAndStroke('#FFF8E1', '#FF9800');
    
    // Calculate grand totals
    let grandTotalLiters = 0;
    let grandTotalAmount = 0;
    
    Object.keys(groupedTransactions).forEach(timeKey => {
      Object.keys(groupedTransactions[timeKey]).forEach(typeKey => {
        groupedTransactions[timeKey][typeKey].forEach(t => {
          grandTotalLiters += t.milkQuantity;
          grandTotalAmount += t.milkQuantity * t.pricePerLitre;
        });
      });
    });
    
    // Summary title
    doc.fontSize(14).fillColor('#003366')
       .text('FINANCIAL SUMMARY', 50, currentY + 15, { align: 'center' });
    
    currentY += 40;
    
    // // Summary details
    // doc.fontSize(10).fillColor('#000000')
    //    .text(`Total Milk Quantity:`, 70, currentY)
    //    .font('Helvetica-Bold').text(`${grandTotalLiters.toFixed(2)} liters`, 200, currentY)
    //    .font('Helvetica').text('Total Loan:', 300, currentY)
    //    .font('Helvetica-Bold').text(`₹${farmer.totalLoan.toFixed(2)}`, 390, currentY)
    //    .font('Helvetica').text('Total Loan Paid Back:', 300, currentY)
    //    .font('Helvetica-Bold').text(`₹${farmer.totalLoanPaidBack.toFixed(2)}`, 390, currentY)
    //    .font('Helvetica').text('Loan Remaining:', 300, currentY)
    //    .font('Helvetica-Bold').text(`₹${farmer.totalLoanRemaining.toFixed(2)}`, 390, currentY);
       
    doc.fontSize(10).fillColor('#000000');

// Row 1: Milk & Loan Total
doc.text(`Total Milk Quantity:`, 70, currentY)
   .font('Helvetica-Bold').text(`${grandTotalLiters.toFixed(2)} liters`, 200, currentY)
   .font('Helvetica').text('Total Loan:', 300, currentY)
   .font('Helvetica-Bold').text(`₹${farmer.totalLoan.toFixed(2)}`, 430, currentY);

currentY += 15;

// Row 2: Loan Paid
doc.font('Helvetica').text('Total Loan Paid Back:', 300, currentY)
   .font('Helvetica-Bold').text(`₹${farmer.totalLoanPaidBack.toFixed(2)}`, 430, currentY);

currentY += 15;

// Row 3: Loan Remaining
doc.font('Helvetica').text('Loan Remaining:', 300, currentY)
   .font('Helvetica-Bold').text(`₹${farmer.totalLoanRemaining.toFixed(2)}`, 430, currentY);


    
    currentY += 20;
    
    doc.font('Helvetica').text(`Total Amount:`, 70, currentY)
       .font('Helvetica-Bold').text(`₹${grandTotalAmount.toFixed(2)}`, 200, currentY);
    
    // Add footer to all pages
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      
      // Footer line
      doc.moveTo(50, 780).lineTo(545, 780).stroke('#003366');
      
      // Footer text
      doc.fontSize(8).fillColor('#666666')
         .text(`Milkman Management System - Report generated on ${new Date().toLocaleString()}`, 50, 790);
      
      // Page number on the right
      doc.text(`Page ${i + 1} of ${pageCount}`, 450, 790);
    }
    
    doc.end();

    // Wait for file creation, then send it
    writeStream.on('finish', () => {
      res.download(pdfPath, fileName, (err) => {
        if (err) {
          console.error('Download error:', err);
          res.status(500).json({ message: 'Error downloading PDF' });
        }
        // Clean up the generated PDF file after download
        fs.unlink(pdfPath, (unlinkErr) => {
          if (unlinkErr) {
            console.error('Error deleting PDF:', unlinkErr);
          }
        });
      });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error generating PDF' });
  }
}

const allFarmersCombinedReport = async (req, res) => {
  try {
    const farmers = await Farmer.find();

    if (farmers.length === 0) {
      return res.status(404).json({ message: 'No farmers found' });
    }

    const fileName = 'All_Farmers_Report.pdf';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.pipe(res);

    // -- Header for All Farmers Report --
    doc.rect(50, 40, 495, 70).fillAndStroke('#F0F8FF', '#003366');
    doc.fontSize(22).fillColor('#003366')
        .text('ALL FARMERS MILK REPORT', 50, 55, { align: 'center' });
    doc.fontSize(12).fillColor('#003366')
        .text(`Generated on: ${new Date().toLocaleString()}`, 50, 85, { align: 'center' });

    doc.moveDown(2);

    // Helper: Create report for a single farmer with styling
    const generateStyledFarmerReport = (doc, farmer) => {
      doc.addPage();

      // -- Farmer Information Box --
      doc.roundedRect(50, doc.y, 495, 70, 5)
          .fillAndStroke('#E6F2FF', '#003366');

      const infoStartY = doc.y + 15;
      doc.fillColor('#003366').fontSize(14)
          .text(`Farmer: ${farmer.farmerName}`, 70, infoStartY);
      doc.fontSize(11)
          .text(`Mobile: ${farmer.mobileNumber}`, 70, infoStartY + 20)
          .text(`Address: ${farmer.address}`, 300, infoStartY + 20)
          .text(`Joining Date: ${new Date(farmer.joiningDate).toDateString()}`, 70, infoStartY + 40);

      doc.moveDown(4);

      // Transaction Summary Header
      doc.fontSize(16).fillColor('#003366')
          .text('TRANSACTION SUMMARY', { align: 'center', underline: true });
      doc.moveDown();

      // Group transactions by time and milk type (same logic as single farmer report)
      const groupedTransactions = {
        morning: { cow: [], buffalo: [] },
        evening: { cow: [], buffalo: [] }
      };

      farmer.transaction.forEach(t => {
        const timeOfDay = t.transactionTime?.toLowerCase() ||
                            (new Date(t.transactionDate).getHours() < 12 ? 'morning' : 'evening');
        const milkType = t.milkType.toLowerCase();

        if (timeOfDay === 'morning') {
          if (milkType === 'cow') groupedTransactions.morning.cow.push(t);
          else groupedTransactions.morning.buffalo.push(t);
        } else {
          if (milkType === 'cow') groupedTransactions.evening.cow.push(t);
          else groupedTransactions.evening.buffalo.push(t);
        }
      });

      // Table drawing function
      const drawTransactionTable = (title, transactions, startY) => {
        if (transactions.length === 0) return startY;

        // Check if we need to add a new page
        if (startY > 680) {
          doc.addPage();
          startY = 50;
        }

        // Title for the section
        doc.fontSize(12).fillColor('#003366')
            .text(title, 50, startY, { underline: true });

        startY += 20;

        // Table headers
        doc.rect(50, startY, 495, 20).fillAndStroke('#003366', '#003366');
        doc.fillColor('#FFFFFF').fontSize(10);
        doc.text('Date', 55, startY + 6);
        doc.text('Fat', 130, startY + 6);
        doc.text('SNF', 175, startY + 6);
        doc.text('Qty (L)', 220, startY + 6);
        doc.text('Rate (₹)', 280, startY + 6);
        doc.text('Amount (₹)', 350, startY + 6);
        doc.text('Time', 430, startY + 6);

        startY += 20;

        let totalLiters = 0;
        let totalAmount = 0;

        // Table rows
        transactions.forEach((t, index) => {
          // Alternate row coloring
          if (index % 2 === 0) {
            doc.rect(50, startY, 495, 20).fillAndStroke('#F8F9FA', '#CCE5FF');
          } else {
            doc.rect(50, startY, 495, 20).fillAndStroke('#FFFFFF', '#CCE5FF');
          }

          const amount = t.milkQuantity * t.pricePerLitre;
          totalLiters += t.milkQuantity;
          totalAmount += amount;

          doc.fillColor('#000000').fontSize(9);
          doc.text(new Date(t.transactionDate).toLocaleDateString(), 55, startY + 6);
          doc.text(t.fat?.toFixed(1) || 'N/A', 130, startY + 6);
          doc.text(t.snf?.toFixed(1) || 'N/A', 175, startY + 6);
          doc.text(t.milkQuantity.toFixed(2), 220, startY + 6);
          doc.text(t.pricePerLitre.toFixed(2), 280, startY + 6);
          doc.text(amount.toFixed(2), 350, startY + 6);
          doc.text(t.transactionTime || 'N/A', 430, startY + 6);

          startY += 20;
        });

        // Total row
        doc.rect(50, startY, 495, 22).fillAndStroke('#E6F2FF', '#003366');
        doc.fillColor('#003366').fontSize(10).font('Helvetica-Bold');
        doc.text('TOTAL', 55, startY + 6);
        doc.text(totalLiters.toFixed(2), 220, startY + 6);
        doc.text(totalAmount.toFixed(2), 350, startY + 6);

        return startY + 30;
      };

      let currentY = doc.y;

      // Morning Cow
      if (groupedTransactions.morning.cow.length > 0) {
        currentY = drawTransactionTable('MORNING - COW MILK', groupedTransactions.morning.cow, currentY);
      }

      // Morning Buffalo
      if (groupedTransactions.morning.buffalo.length > 0) {
        currentY = drawTransactionTable('MORNING - BUFFALO MILK', groupedTransactions.morning.buffalo, currentY);
      }

      // Evening Cow
      if (groupedTransactions.evening.cow.length > 0) {
        currentY = drawTransactionTable('EVENING - COW MILK', groupedTransactions.evening.cow, currentY);
      }

      // Evening Buffalo
      if (groupedTransactions.evening.buffalo.length > 0) {
        currentY = drawTransactionTable('EVENING - BUFFALO MILK', groupedTransactions.evening.buffalo, currentY);
      }

      // If we don't have enough space for the summary, add a new page
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }

      // Grand Total and Summary Section
      doc.moveDown();
      doc.roundedRect(50, currentY, 495, 120, 5)
          .fillAndStroke('#FFF8E1', '#FF9800');

      // Calculate grand totals for the farmer
      let grandTotalLiters = 0;
      let grandTotalAmount = 0;

      Object.keys(groupedTransactions).forEach(timeKey => {
        Object.keys(groupedTransactions[timeKey]).forEach(typeKey => {
          groupedTransactions[timeKey][typeKey].forEach(t => {
            grandTotalLiters += t.milkQuantity;
            grandTotalAmount += t.milkQuantity * t.pricePerLitre;
          });
        });
      });

      // Summary title
      doc.fontSize(14).fillColor('#003366')
          .text('FINANCIAL SUMMARY', 50, currentY + 15, { align: 'center' });

      currentY += 40;

      doc.fontSize(10).fillColor('#000000');

      // Row 1: Milk & Loan Total
      doc.text(`Total Milk Quantity:`, 70, currentY)
          .font('Helvetica-Bold').text(`${grandTotalLiters.toFixed(2)} liters`, 200, currentY)
          .font('Helvetica').text('Total Loan:', 300, currentY)
          .font('Helvetica-Bold').text(`₹${farmer.totalLoan.toFixed(2)}`, 430, currentY);

      currentY += 15;

      // Row 2: Loan Paid
      doc.font('Helvetica').text('Total Loan Paid Back:', 300, currentY)
          .font('Helvetica-Bold').text(`₹${farmer.totalLoanPaidBack.toFixed(2)}`, 430, currentY);

      currentY += 15;

      // Row 3: Loan Remaining
      doc.font('Helvetica').text('Loan Remaining:', 300, currentY)
          .font('Helvetica-Bold').text(`₹${farmer.totalLoanRemaining.toFixed(2)}`, 430, currentY);

      currentY += 20;

      doc.font('Helvetica').text(`Total Amount:`, 70, currentY)
          .font('Helvetica-Bold').text(`₹${grandTotalAmount.toFixed(2)}`, 200, currentY);

      // Add footer to the farmer's pages
      const pageCount = doc.bufferedPageRange().count;
      const startIndex = pageCount - doc.page.index -1;
      for (let i = startIndex; i < pageCount; i++) {
        doc.switchToPage(i);

        // Footer line
        doc.moveTo(50, 780).lineTo(545, 780).stroke('#003366');

        // Footer text
        doc.fontSize(8).fillColor('#666666')
            .text(`Milkman Management System - Report generated on ${new Date().toLocaleString()}`, 50, 790);

        // Page number on the right
        doc.text(`Page ${i + 1}`, 450, 790);
      }
    };

    // Loop over farmers and append their styled reports
    for (const farmer of farmers) {
      generateStyledFarmerReport(doc, farmer);
    }

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error generating PDF' });
  }
};

export {
  addFarmer,
  getAllfarmers,
  deleteFarmer,
  exportFarmerDetail,
  updateFarmer,
  farmerCombinedReport,
  allFarmersCombinedReport
};
