// // import express from 'express';
// // import PDFDocument from 'pdfkit';
// // import fs from 'fs';
// // import path from 'path';
// // import { Farmer } from '../model/Farmer.js';


// // // router.get('/download-pdf/:mobileNumber'
// //  export const farmerTransaction =  async (req, res) => {
// //   try {
// //     const { mobileNumber } = req.params;
// //     const farmer = await Farmer.findOne({ mobileNumber });

// //     if (!farmer) {
// //       return res.status(404).json({ message: 'Farmer not found' });
// //     }

// //     const fileName = `Farmer_Report_${mobileNumber}.pdf`;
// //     const pdfPath = path.join('reports', fileName);

// //     const doc = new PDFDocument();
// //     doc.pipe(fs.createWriteStream(pdfPath)); // Save locally

// //     // -- Header Info --
// //     doc.fontSize(18).text(`Farmer Report - ${farmer.farmerName}`, { align: 'center' });
// //     doc.moveDown();
// //     doc.fontSize(12).text(`Mobile: ${farmer.mobileNumber}`);
// //     doc.text(`Address: ${farmer.address}`);
// //     doc.text(`Joining Date: ${new Date(farmer.joiningDate).toDateString()}`);
// //     doc.moveDown();

// //     const grouped = { cow: [], buffalo: [] };
// //     farmer.transaction.forEach(t => {
// //       if (t.milkType === 'cow') grouped.cow.push(t);
// //       else if (t.milkType === 'buffalo') grouped.buffalo.push(t);
// //     });

// //     let totalLiters = 0, totalAmount = 0;

// //     for (const type of ['cow', 'buffalo']) {
// //       doc.fontSize(14).text(`${type.toUpperCase()} Milk`, { underline: true });
// //       doc.moveDown(0.5);

// //       if (grouped[type].length === 0) {
// //         doc.text('No transactions.\n');
// //         continue;
// //       }

// //       let subLiters = 0, subAmount = 0;

// //       grouped[type].forEach(t => {
// //         const total = t.milkQuantity * t.pricePerLitre;
// //         subLiters += t.milkQuantity;
// //         subAmount += total;

// //         doc.fontSize(11).text(`${new Date(t.transactionDate).toLocaleDateString()}  Qty: ${t.milkQuantity}L × ₹${t.pricePerLitre}/L = ₹${total.toFixed(2)}`);
// //       });

// //       totalLiters += subLiters;
// //       totalAmount += subAmount;

// //       doc.moveDown(0.3);
// //       doc.fontSize(12).text(`Subtotal: ${subLiters.toFixed(2)} L | ₹${subAmount.toFixed(2)}\n`);
// //     }

// //     doc.fontSize(14).text('Grand Totals', { underline: true });
// //     doc.text(`Total Milk: ${totalLiters.toFixed(2)} L`);
// //     doc.text(`Total Amount: ₹${totalAmount.toFixed(2)}`);
// //     doc.moveDown();

// //     doc.fontSize(14).text('Loan Details', { underline: true });
// //     doc.text(`Total Loan Remaining: ₹${farmer.totalLoanRemaining.toFixed(2)}`);

// //     doc.end();

// //     // Wait for file creation, then send it
// //     doc.on('finish', () => {
// //       res.download(pdfPath, fileName, (err) => {
// //         if (err) console.error('Download error:', err);
// //       });
// //     });

// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ message: 'Error generating PDF' });
// //   }
// // }

// import express from 'express';
// import PDFDocument from 'pdfkit';
// import fs from 'fs';
// import path from 'path';
// import { Farmer } from '../model/Farmer.js';

// // Create the 'reports' directory if it doesn't exist
// const reportsDirectory = path.join(process.cwd(), 'reports');
// if (!fs.existsSync(reportsDirectory)) {
//   fs.mkdirSync(reportsDirectory);
// }

// // router.get('/download-pdf/:mobileNumber'
// export const farmerTransaction = async (req, res) => {
//   try {
//     const { mobileNumber } = req.params;
//     const farmer = await Farmer.findOne({ mobileNumber });

//     if (!farmer) {
//       return res.status(404).json({ message: 'Farmer not found' });
//     }

//     const fileName = `Farmer_Report_${mobileNumber}.pdf`;
//     const pdfPath = path.join(reportsDirectory, fileName);

//     const doc = new PDFDocument();
//     const writeStream = fs.createWriteStream(pdfPath);
//     doc.pipe(writeStream); // Save locally

//     // -- Header Info --
//     doc.fontSize(18).text(`Farmer Report - ${farmer.farmerName}`, { align: 'center' });
//     doc.moveDown();
//     doc.fontSize(12).text(`Mobile: ${farmer.mobileNumber}`);
//     doc.text(`Address: ${farmer.address}`);
//     doc.text(`Joining Date: ${new Date(farmer.joiningDate).toDateString()}`);
//     doc.moveDown();

//     const grouped = { cow: [], buffalo: [] };
//     farmer.transaction.forEach(t => {
//       if (t.milkType === 'Cow') grouped.cow.push(t);
//       else if (t.milkType === 'Buffalo') grouped.buffalo.push(t);
//     });

//     let totalLiters = 0, totalAmount = 0;

//     for (const type of ['cow', 'buffalo']) {
//       doc.fontSize(14).text(`${type.toUpperCase()} Milk`, { underline: true });
//       doc.moveDown(0.5);

//       if (grouped[type].length === 0) {
//         doc.text('No transactions.\n');
//         continue;
//       }

//       let subLiters = 0, subAmount = 0;

//       grouped[type].forEach(t => {
//         const total = t.milkQuantity * t.pricePerLitre;
//         subLiters += t.milkQuantity;
//         subAmount += total;

//         doc.fontSize(11).text(`${new Date(t.transactionDate).toLocaleDateString()}  Qty: ${t.milkQuantity}L × ₹${t.pricePerLitre}/L = ₹${total.toFixed(2)}`);
//       });

//       totalLiters += subLiters;
//       totalAmount += subAmount;

//       doc.moveDown(0.3);
//       doc.fontSize(12).text(`Subtotal: ${subLiters.toFixed(2)} L | ₹${subAmount.toFixed(2)}\n`);
//     }

//     doc.fontSize(14).text('Grand Totals', { underline: true });
//     doc.text(`Total Milk: ${totalLiters.toFixed(2)} L`);
//     doc.text(`Total Amount: ₹${totalAmount.toFixed(2)}`);
//     doc.moveDown();

//     doc.fontSize(14).text('Loan Details', { underline: true });
//     doc.text(`Total Loan Remaining: ₹${farmer.totalLoanRemaining.toFixed(2)}`);

//     doc.end();

//     // Wait for file creation, then send it
//     writeStream.on('finish', () => {
//       res.download(pdfPath, fileName, (err) => {
//         if (err) {
//           console.error('Download error:', err);
//           res.status(500).json({ message: 'Error downloading PDF' });
//         }
//         // Clean up the generated PDF file after download
//         fs.unlink(pdfPath, (unlinkErr) => {
//           if (unlinkErr) {
//             console.error('Error deleting PDF:', unlinkErr);
//           }
//         });
//       });
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Error generating PDF' });
//   }
// };


import express from 'express';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { Farmer } from '../model/Farmer.js';

// Create the 'reports' directory if it doesn't exist
const reportsDirectory = path.join(process.cwd(), 'reports');
if (!fs.existsSync(reportsDirectory)) {
  fs.mkdirSync(reportsDirectory);
}

// router.get('/download-pdf/:mobileNumber'
export const farmerTransaction = async (req, res) => {
  try {
    const { mobileNumber } = req.params;
    const farmer = await Farmer.findOne({ mobileNumber });

    if (!farmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }

    const fileName = `Farmer_Report_${mobileNumber}.pdf`;
    // const pdfPath = path.join(reportsDirectory, fileName);

     // Set response headers
     res.setHeader('Content-Type', 'application/pdf');
     res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
 
 
    // Create a new PDF with better styling options
    const doc = new PDFDocument({
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      size: 'A4',
    });

    doc.pipe(res); // Pipe directly to response
    
    // Set document properties
    doc.info.Title = `Farmer Report - ${farmer.farmerName}`;
    doc.info.Author = 'Milkman Management System';
    
    // const writeStream = fs.createWriteStream(pdfPath);
    // doc.pipe(writeStream); // Save locally 
  

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

    // // Wait for file creation, then send it
    // writeStream.on('finish', () => {
    //   res.download(pdfPath, fileName, (err) => {
    //     if (err) {
    //       console.error('Download error:', err);
    //       res.status(500).json({ message: 'Error downloading PDF' });
    //     }
    //     // Clean up the generated PDF file after download
    //     fs.unlink(pdfPath, (unlinkErr) => {
    //       if (unlinkErr) {
    //         console.error('Error deleting PDF:', unlinkErr);
    //       }
    //     });
    //   });
    // });
    // writeStream.on('finish', () => {
    //     res.setHeader('Content-Type', 'application/pdf');
    //     res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      
    //     const readStream = fs.createReadStream(pdfPath);
    //     readStream.pipe(res);
      
    //     readStream.on('close', () => {
    //       fs.unlink(pdfPath, (unlinkErr) => {
    //         if (unlinkErr) {
    //           console.error('Error deleting PDF:', unlinkErr);
    //         }
    //       });
    //     });
      
    //     readStream.on('error', (err) => {
    //       console.error('Error reading PDF file:', err);
    //       res.status(500).end();
    //     });
    //   });
      

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error generating PDF' });
  }
}; 



// import express from 'express';
// import PDFDocument from 'pdfkit';
// import { Farmer } from '../model/Farmer.js';

// export const downloadAllFarmersPDF = async (req, res) => {
//   try {
//     const farmers = await Farmer.find();

//     if (farmers.length === 0) {
//       return res.status(404).json({ message: 'No farmers found' });
//     }

//     const fileName = 'All_Farmers_Report.pdf';
//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

//     const doc = new PDFDocument({ size: 'A4', margin: 50 });
//     doc.pipe(res);

//     // Helper: Create report for a single farmer
//     const generateFarmerReport = (doc, farmer) => {
//       doc.addPage();

//       doc.fontSize(18).fillColor('#003366').text(`Farmer: ${farmer.farmerName}`, { align: 'center' });
//       doc.moveDown();
//       doc.fontSize(12).fillColor('black');
//       doc.text(`Mobile: ${farmer.mobileNumber}`);
//       doc.text(`Address: ${farmer.address}`);
//       doc.text(`Joining Date: ${new Date(farmer.joiningDate).toDateString()}`);
//       doc.moveDown();

//       doc.fontSize(14).fillColor('#003366').text('Transactions:', { underline: true });
//       doc.moveDown(0.5);

//       if (!farmer.transaction || farmer.transaction.length === 0) {
//         doc.fontSize(10).text('No transactions found.');
//         return;
//       }

//       doc.fontSize(10).fillColor('black');
//       farmer.transaction.forEach(t => {
//         const date = new Date(t.transactionDate).toLocaleDateString();
//         const amount = t.milkQuantity * t.pricePerLitre;
//         doc.text(
//           `${date} - ${t.transactionTime} - ${t.milkType.toUpperCase()} - ${t.milkQuantity}L @ ₹${t.pricePerLitre} = ₹${amount.toFixed(2)}`
//         );
//       });

//       doc.moveDown();

//       // Loan Summary
//       doc.fontSize(12).fillColor('#003366').text('Loan Summary:', { underline: true });
//       doc.fontSize(10).fillColor('black');
//       doc.text(`Total Loan: ₹${farmer.totalLoan.toFixed(2)}`);
//       doc.text(`Loan Paid Back: ₹${farmer.totalLoanPaidBack.toFixed(2)}`);
//       doc.text(`Loan Remaining: ₹${farmer.totalLoanRemaining.toFixed(2)}`);
//     };

//     // First Page Title
//     doc.fontSize(22).fillColor('#003366').text('All Farmers Milk Report', { align: 'center' });
//     doc.moveDown();
//     doc.fontSize(12).fillColor('black').text(`Generated on: ${new Date().toLocaleString()}`);
//     doc.addPage(); // Move to a new page after the title

//     // Loop over farmers and append their sections
//     for (const farmer of farmers) {
//       generateFarmerReport(doc, farmer);
//     }

//     doc.end();
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Error generating PDF' });
//   }
// };


export const downloadAllFarmersPDF = async (req, res) => {
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



export const downloadReportByFarmerId = async (req, res) => {
  try {
    const { farmerId, day } = req.params;
    const farmer = await Farmer.findOne({ farmerId });

    if (!farmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }

    // Validate day parameter
    const validDays = ['1', '11', '21'];
    if (!validDays.includes(day)) {
      return res.status(400).json({ message: 'Day must be 1, 11, or 21' });
    }

    // Calculate date range
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Create start date based on the provided day
    const startDate = new Date(currentYear, currentMonth, parseInt(day));
    const endDate = new Date(currentYear, currentMonth, parseInt(day) + 9);

    // Filter transactions for the date range
    const filteredTransactions = farmer.transaction.filter(t => {
      const transDate = new Date(t.transactionDate);
      return transDate >= startDate && transDate <= endDate;
    });

    // Format file name with date range
    const startStr = startDate.toISOString().split('T')[0].replace(/-/g, '');
    const endStr = endDate.toISOString().split('T')[0].replace(/-/g, '');
    const fileName = `Farmer_Report_${farmerId}_${startStr}-${endStr}.pdf`;

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    const doc = new PDFDocument({
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      size: 'A4',
    });

    doc.pipe(res);

    // PDF Header with date range
    doc.rect(50, 40, 495, 70).fillAndStroke('#F0F8FF', '#003366');
    doc.fontSize(22).fillColor('#003366')
      .text('FARMER MILK REPORT', 50, 55, { align: 'center' });
    doc.fontSize(10).fillColor('#003366')
      .text(`Date Range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`, 50, 85, { align: 'center' });

    // Farmer Information
    doc.moveDown(4);
    doc.roundedRect(50, doc.y, 495, 70, 5)
      .fillAndStroke('#E6F2FF', '#003366');
    
    const infoStartY = doc.y + 15;
    doc.fillColor('#003366').fontSize(14)
      .text(`Farmer: ${farmer.farmerName}`, 70, infoStartY);
    doc.fontSize(11)
      .text(`Mobile: ${farmer.mobileNumber}`, 70, infoStartY + 20)
      .text(`Address: ${farmer.address}`, 300, infoStartY + 20)
      .text(`Joining Date: ${new Date(farmer.joiningDate).toDateString()}`, 70, infoStartY + 40);

    // Transaction Summary
    doc.moveDown(4);
    doc.fontSize(16).fillColor('#003366')
      .text('TRANSACTION SUMMARY', { align: 'center', underline: true });
    doc.moveDown();

    // Group transactions by time and milk type
    const groupedTransactions = {
      morning: { cow: [], buffalo: [] },
      evening: { cow: [], buffalo: [] }
    };

    filteredTransactions.forEach(t => {
      const timeOfDay = t.transactionTime.toLowerCase();
      const milkType = t.milkType.toLowerCase();
      
      if (timeOfDay === 'morning') {
        if (milkType === 'cow') groupedTransactions.morning.cow.push(t);
        else groupedTransactions.morning.buffalo.push(t);
      } else {
        if (milkType === 'cow') groupedTransactions.evening.cow.push(t);
        else groupedTransactions.evening.buffalo.push(t);
      }
    });

    // Draw tables for each category
    let currentY = doc.y;

    // Function to draw transaction tables
    const drawTransactionTable = (title, transactions, startY) => {
      if (transactions.length === 0) return startY;
      
      // Title for the section
      doc.fontSize(12).fillColor('#003366')
        .text(title, 50, startY, { underline: true });
      
      // Table headers
      startY += 20;
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
        doc.text(t.fat.toFixed(1), 130, startY + 6);
        doc.text(t.snf.toFixed(1), 175, startY + 6);
        doc.text(t.milkQuantity.toFixed(2), 220, startY + 6);
        doc.text(t.pricePerLitre.toFixed(2), 280, startY + 6);
        doc.text(amount.toFixed(2), 350, startY + 6);
        doc.text(t.transactionTime, 430, startY + 6);
        
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

    // Draw tables for each category
    if (groupedTransactions.morning.cow.length > 0) {
      currentY = drawTransactionTable('MORNING - COW MILK', groupedTransactions.morning.cow, currentY);
    }
    
    if (groupedTransactions.morning.buffalo.length > 0) {
      currentY = drawTransactionTable('MORNING - BUFFALO MILK', groupedTransactions.morning.buffalo, currentY);
    }
    
    if (groupedTransactions.evening.cow.length > 0) {
      currentY = drawTransactionTable('EVENING - COW MILK', groupedTransactions.evening.cow, currentY);
    }
    
    if (groupedTransactions.evening.buffalo.length > 0) {
      currentY = drawTransactionTable('EVENING - BUFFALO MILK', groupedTransactions.evening.buffalo, currentY);
    }

    // Financial Summary
    doc.moveDown(2);
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
    doc.fontSize(10).fillColor('#000000');

    // Milk & Loan Summary
    doc.text(`Total Milk Quantity:`, 70, currentY)
      .font('Helvetica-Bold').text(`${grandTotalLiters.toFixed(2)} liters`, 200, currentY)
      .font('Helvetica').text('Total Loan:', 300, currentY)
      .font('Helvetica-Bold').text(`₹${farmer.totalLoan.toFixed(2)}`, 430, currentY);

    currentY += 15;
    doc.font('Helvetica').text('Total Loan Paid Back:', 300, currentY)
      .font('Helvetica-Bold').text(`₹${farmer.totalLoanPaidBack.toFixed(2)}`, 430, currentY);

    currentY += 15;
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error generating PDF' });
  }
};