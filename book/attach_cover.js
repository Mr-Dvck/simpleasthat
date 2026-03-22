const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function attachCover() {
  try {
    const coverPath = path.join(__dirname, 'cover.png');
    const pdfPath = path.join(__dirname, 'chapters', 'Simple_AI_Ebook.pdf');
    
    // Read the cover image, TOC PDF, and main text PDF
    const coverImageBytes = fs.readFileSync(coverPath);
    const tocPdfBytes = fs.readFileSync(path.join(__dirname, 'chapters', 'Simple_AI_Ebook_TOC.pdf'));
    const existingPdfBytes = fs.readFileSync(pdfPath);
    
    // Create a new blank PDF
    const finalPdf = await PDFDocument.create();
    
    // Embed the PNG cover
    const coverImage = await finalPdf.embedPng(coverImageBytes);
    
    // Add cover page
    const page = finalPdf.addPage([595.28, 841.89]);
    page.drawImage(coverImage, {
      x: 0,
      y: 0,
      width: 595.28,
      height: 841.89,
    });

    // Load and copy TOC pages
    const tocPdf = await PDFDocument.load(tocPdfBytes);
    const tocPages = await finalPdf.copyPages(tocPdf, tocPdf.getPageIndices());
    tocPages.forEach((p) => finalPdf.addPage(p));
    
    // Load and copy Main text PDF pages
    const textPdf = await PDFDocument.load(existingPdfBytes);
    const textPages = await finalPdf.copyPages(textPdf, textPdf.getPageIndices());
    textPages.forEach((p) => finalPdf.addPage(p));
    
    // Save the combined PDF
    const mergedPdfBytes = await finalPdf.save();
    fs.writeFileSync(pdfPath, mergedPdfBytes);
    
    console.log('Successfully attached Cover and TOC to the final PDF.');
  } catch (err) {
    console.error('Error attaching cover:', err);
  }
}

attachCover();
