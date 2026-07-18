const Complaint = require("../models/Complaint");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");


const downloadExcelReport = async (req, res) => {
    try {

        const complaints = await Complaint.find()
            .populate("createdBy", "fullName email")
            .sort({ createdAt: -1 });

        const workbook = new ExcelJS.Workbook();

        const worksheet = workbook.addWorksheet("Complaints");

        worksheet.columns = [
            { header: "Title", key: "title", width: 30 },
            { header: "Category", key: "category", width: 20 },
            { header: "Student", key: "student", width: 25 },
            { header: "Email", key: "email", width: 30 },
            { header: "Status", key: "status", width: 20 },
            { header: "Priority", key: "priority", width: 15 },
            { header: "Due Date", key: "dueDate", width: 20 },
            { header: "Created At", key: "createdAt", width: 25 },
        ];

        complaints.forEach((complaint) => {

            worksheet.addRow({
                title: complaint.title,
                category: complaint.category,
                student: complaint.createdBy?.fullName,
                email: complaint.createdBy?.email,
                status: complaint.status,
                priority: complaint.priority,
                dueDate: complaint.dueDate
                    ? new Date(complaint.dueDate).toLocaleDateString()
                    : "Not Set",
                createdAt: new Date(
                    complaint.createdAt
                ).toLocaleString(),
            });

        });

        worksheet.getRow(1).font = {
            bold: true,
        };

        worksheet.getRow(1).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: {
                argb: "4F81BD",
            },
        };

        worksheet.getRow(1).font = {
            bold: true,
            color: {
                argb: "FFFFFF",
            },
        };

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=Complaint_Report.xlsx"
        );

        await workbook.xlsx.write(res);

        res.end();

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
};

const downloadPDFReport = async (req, res) => {
    try {

        const complaints = await Complaint.find()
            .populate("createdBy", "fullName email")
            .sort({ createdAt: -1 });

        const doc = new PDFDocument({
            margin: 40,
            size: "A4",
        });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=Complaint_Report.pdf"
        );

        doc.pipe(res);

        doc
            .fontSize(22)
            .text("CampusOne Complaint Report", {
                align: "center",
            });

        doc.moveDown();

        doc
            .fontSize(12)
            .text(
                `Generated On: ${new Date().toLocaleString()}`
            );

        doc.text(`Total Complaints: ${complaints.length}`);

        doc.moveDown();

        complaints.forEach((complaint, index) => {

            doc
                .fontSize(14)
                .text(`${index + 1}. ${complaint.title}`, {
                    underline: true,
                });

            doc.fontSize(11);

            doc.text(
                `Student : ${complaint.createdBy?.fullName}`
            );

            doc.text(
                `Email : ${complaint.createdBy?.email}`
            );

            doc.text(
                `Category : ${complaint.category}`
            );

            doc.text(
                `Status : ${complaint.status}`
            );

            doc.text(
                `Priority : ${complaint.priority}`
            );

            doc.text(
                `Due Date : ${
                    complaint.dueDate
                        ? new Date(
                                complaint.dueDate
                            ).toLocaleDateString()
                        : "Not Set"
                }`
            );

            doc.text(
                `Created : ${new Date(
                    complaint.createdAt
                ).toLocaleString()}`
            );

            doc.moveDown();

            doc
                .moveTo(40, doc.y)
                .lineTo(550, doc.y)
                .stroke();

            doc.moveDown();

        });

        doc.end();

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
};

module.exports = {
    downloadExcelReport,
    downloadPDFReport,
};