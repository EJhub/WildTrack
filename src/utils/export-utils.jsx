import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

/**
 * Export chart data to PDF
 * @param {string} elementId - The ID of the element containing the chart
 * @param {string} fileName - Name of the PDF file
 * @param {string} title - Title for the PDF document
 */
export const exportToPDF = async (elementId, fileName, title) => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }

    // Create a canvas from the chart element
    const canvas = await html2canvas(element, {
      scale: 2, // Better resolution
      logging: false,
      useCORS: true
    });

    // Calculate dimensions based on the canvas
    const imgWidth = 190; // A4 width in mm (slightly less than 210 for margins)
    const pageHeight = 290; // A4 height in mm (slightly less than 297 for margins)
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Add title
    pdf.setFontSize(16);
    pdf.text(title, 105, 15, { align: 'center' });
    
    // Add current date
    const date = new Date().toLocaleDateString();
    pdf.setFontSize(10);
    pdf.text(`Generated on: ${date}`, 105, 22, { align: 'center' });
    
    // Add image of the chart
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 10, 30, imgWidth, imgHeight);
    
    // Save the PDF
    pdf.save(`${fileName}.pdf`);
    
    return true;
  } catch (error) {
    console.error('PDF export error:', error);
    return false;
  }
};

/**
 * Export chart data to Excel
 * @param {object} chartData - Data from the chart
 * @param {string} fileName - Name of the Excel file
 * @param {string} sheetName - Name of the worksheet
 */
export const exportToExcel = (chartData, fileName, sheetName = 'Chart Data') => {
  try {
    if (!chartData || !chartData.labels || !chartData.datasets) {
      throw new Error('Invalid chart data format');
    }

    // Ensure sheet name is not longer than 31 characters (Excel limitation)
    const truncatedSheetName = sheetName.substring(0, 31);

    // Convert chart data to worksheet format
    const wsData = [
      // Header row
      ['Category', ...chartData.datasets.map(ds => ds.label || 'Value')]
    ];

    // Data rows
    chartData.labels.forEach((label, index) => {
      const row = [label];
      chartData.datasets.forEach(dataset => {
        row.push(dataset.data[index]);
      });
      wsData.push(row);
    });

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, truncatedSheetName);

    // Generate Excel file and trigger download
    XLSX.writeFile(wb, `${fileName}.xlsx`);
    
    return true;
  } catch (error) {
    console.error('Excel export error:', error);
    return false;
  }
};