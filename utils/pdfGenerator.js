import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

export const generatePrescriptionPdf = async (payload) => {
  const dir = path.join(process.cwd(), "public", "prescriptions");
  ensureDir(dir);

  const filename = `prescription-${payload.prescriptionId}-${Date.now()}.pdf`;
  const filePath = path.join(dir, filename);

  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    doc.fontSize(18).text("Hospital Prescription", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Prescription ID: ${payload.prescriptionId}`);
    doc.text(`Doctor: ${payload.doctorName}`);
    doc.text(`Patient: ${payload.patientName}`);
    doc.text(`Date: ${new Date().toLocaleString()}`);
    doc.moveDown();

    doc.fontSize(13).text("Diagnosis:");
    doc.fontSize(11).text(payload.diagnosis || "N/A");
    doc.moveDown();

    doc.fontSize(13).text("Medicines:");
    (payload.medicines || []).forEach((medicine, index) => {
      doc
        .fontSize(11)
        .text(
          `${index + 1}. ${medicine.name} | Dosage: ${medicine.dosage} | Frequency: ${medicine.frequency} | Duration: ${medicine.duration}`,
        );
      if (medicine.notes) {
        doc.text(`Notes: ${medicine.notes}`);
      }
    });

    doc.moveDown();
    doc.fontSize(13).text("Advice:");
    doc.fontSize(11).text(payload.advice || "N/A");

    doc.end();

    stream.on("finish", resolve);
    stream.on("error", reject);
  });

  return `/public/prescriptions/${filename}`;
};
