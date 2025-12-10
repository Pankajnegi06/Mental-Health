const PDFParser = require('pdf2json');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Extract text from a PDF file URL
 * @param {string} pdfUrl - URL to the PDF file
 * @returns {Promise<string>} - Extracted text
 */
const extractTextFromPDF = async (pdfUrl) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('📄 Extracting text from PDF:', pdfUrl);
      
      // Download the PDF file
      const response = await axios.get(pdfUrl, {
        responseType: 'arraybuffer'
      });
      
      // Create a temporary file to store the PDF
      const tempDir = os.tmpdir();
      const tempFilePath = path.join(tempDir, `pdf_${Date.now()}.pdf`);
      
      // Write the PDF buffer to a temporary file
      fs.writeFileSync(tempFilePath, Buffer.from(response.data));
      
      console.log('📝 PDF downloaded to temp file:', tempFilePath);
      
      // Create PDF parser instance
      const pdfParser = new PDFParser();
      
      // Set up event handlers
      pdfParser.on('pdfParser_dataError', (errData) => {
        console.error('❌ PDF parsing error:', errData.parserError);
        // Clean up temp file
        try {
          fs.unlinkSync(tempFilePath);
        } catch (e) {
          console.error('Failed to delete temp file:', e);
        }
        reject(new Error(`Failed to parse PDF: ${errData.parserError}`));
      });
      
      pdfParser.on('pdfParser_dataReady', (pdfData) => {
        try {
          // Extract text from all pages
          let extractedText = '';
          
          if (pdfData.Pages && pdfData.Pages.length > 0) {
            pdfData.Pages.forEach((page, pageIndex) => {
              if (page.Texts && page.Texts.length > 0) {
                page.Texts.forEach((text) => {
                  if (text.R && text.R.length > 0) {
                    text.R.forEach((r) => {
                      if (r.T) {
                        // Decode URI component (pdf2json encodes text)
                        try {
                          extractedText += decodeURIComponent(r.T) + ' ';
                        } catch (e) {
                          console.warn('⚠️ Failed to decode text chunk:', r.T);
                          extractedText += r.T + ' '; // Fallback to raw text
                        }
                      }
                    });
                  }
                });
                extractedText += '\n'; // Add newline after each page
              }
            });
          }
          
          console.log(`✅ PDF parsed successfully. Pages: ${pdfData.Pages.length}, Text length: ${extractedText.length}`);
          console.log('First 200 characters:', extractedText.substring(0, 200));
          
          // Clean up temp file
          try {
            fs.unlinkSync(tempFilePath);
          } catch (e) {
            console.error('Failed to delete temp file:', e);
          }
          
          resolve(extractedText.trim());
        } catch (error) {
          console.error('❌ Error processing PDF data:', error);
          // Clean up temp file
          try {
            fs.unlinkSync(tempFilePath);
          } catch (e) {
            console.error('Failed to delete temp file:', e);
          }
          reject(error);
        }
      });
      
      // Load and parse the PDF file
      pdfParser.loadPDF(tempFilePath);
      
    } catch (error) {
      console.error('❌ PDF extraction error:', error.message);
      reject(new Error(`Failed to extract text from PDF: ${error.message}`));
    }
  });
};

/**
 * Parse health metrics from extracted text
 * @param {string} text - Extracted text
 * @returns {Object} - Parsed health metrics
 */
const parseHealthMetrics = (text) => {
  const metrics = {
    bloodPressure: null,
    bloodSugar: null,
    weight: null,
    heartRate: null,
    temperature: null,
    cholesterol: null
  };

  // Blood Pressure
  const bpPattern = /(?:BP|Blood\s*Pressure)[:\s]*(\d{2,3})\s*[\/\-]\s*(\d{2,3})/i;
  const bpMatch = text.match(bpPattern);
  if (bpMatch) {
    metrics.bloodPressure = {
      systolic: parseInt(bpMatch[1]),
      diastolic: parseInt(bpMatch[2]),
      unit: 'mmHg'
    };
  }

  // Blood Sugar
  const sugarPattern = /(?:Glucose|Sugar|Blood\s*Sugar)[:\s]*(\d{2,3})\s*(?:mg\/d[lL])?/i;
  const sugarMatch = text.match(sugarPattern);
  if (sugarMatch) {
    metrics.bloodSugar = {
      value: parseInt(sugarMatch[1]),
      type: 'random',
      unit: 'mg/dL'
    };
  }

  // Weight
  const weightPattern = /(?:Weight|Wt)[:\s]*(\d{2,3}\.?\d*)\s*(kg|lbs?)/i;
  const weightMatch = text.match(weightPattern);
  if (weightMatch) {
    metrics.weight = {
      value: parseFloat(weightMatch[1]),
      unit: weightMatch[2].toLowerCase().replace('lb', 'lbs')
    };
  }

  // Heart Rate
  const hrPattern = /(?:HR|Heart\s*Rate|Pulse)[:\s]*(\d{2,3})\s*(?:bpm)?/i;
  const hrMatch = text.match(hrPattern);
  if (hrMatch) {
    metrics.heartRate = {
      value: parseInt(hrMatch[1]),
      unit: 'bpm'
    };
  }

  // Temperature
  const tempPattern = /(?:Temp|Temperature)[:\s]*(\d{2,3}\.?\d*)\s*°?\s*([CF])?/i;
  const tempMatch = text.match(tempPattern);
  if (tempMatch) {
    metrics.temperature = {
      value: parseFloat(tempMatch[1]),
      unit: tempMatch[2] ? (tempMatch[2].toUpperCase() === 'F' ? 'fahrenheit' : 'celsius') : 'celsius'
    };
  }

  // Cholesterol
  const cholPattern = /(?:Total\s*)?Cholesterol[:\s]*(\d{2,3})/i;
  const cholMatch = text.match(cholPattern);
  const ldlPattern = /LDL[:\s]*(\d{2,3})/i;
  const ldlMatch = text.match(ldlPattern);
  const hdlPattern = /HDL[:\s]*(\d{2,3})/i;
  const hdlMatch = text.match(hdlPattern);

  if (cholMatch || ldlMatch || hdlMatch) {
    metrics.cholesterol = {
      total: cholMatch ? parseInt(cholMatch[1]) : null,
      ldl: ldlMatch ? parseInt(ldlMatch[1]) : null,
      hdl: hdlMatch ? parseInt(hdlMatch[1]) : null,
      unit: 'mg/dL'
    };
  }

  return metrics;
};

/**
 * Parse medications from extracted text
 * @param {string} text - Extracted text
 * @returns {Array} - Parsed medications
 */
const parseMedications = (text) => {
  const medications = [];
  
  // Pattern 1: Structured format
  const medPattern1 = /(?:Tab\.|Capsule|Syrup|Injection)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(\d+\s*(?:mg|ml|g|IU|mcg))\s*[-–]\s*([\d\-]+)\s*(?:x|for)?\s*(\d+\s*days?)/gi;
  
  // Pattern 2: Table format
  const medPattern2 = /([A-Z][a-z]+(?:\s+[A-Z][a-z0-9]+)*)\s+(\d+(?:,\d+)?\s*(?:mg|ml|g|IU|mcg))\s+((?:Twice|Once|Thrice|Daily|Weekly|Monthly|Every|at|in)\s+[A-Za-z\s]+)/gi;

  let match;
  
  while ((match = medPattern1.exec(text)) !== null) {
    medications.push({
      name: match[1].trim(),
      dosage: match[2].trim(),
      frequency: match[3].trim(),
      duration: match[4].trim()
    });
  }

  while ((match = medPattern2.exec(text)) !== null) {
    if (!medications.some(m => m.name === match[1].trim())) {
      medications.push({
        name: match[1].trim(),
        dosage: match[2].trim(),
        frequency: match[3].trim(),
        duration: "Ongoing"
      });
    }
  }

  return medications;
};

module.exports = {
  extractTextFromPDF,
  parseHealthMetrics,
  parseMedications
};
