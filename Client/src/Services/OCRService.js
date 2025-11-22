import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
// Using CDN worker to avoid build issues with Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * OCR Service
 * Extracts text from images using Tesseract.js and PDFs using PDF.js
 */

/**
 * Extract text from a PDF file
 * @param {string} pdfUrl - URL to the PDF file
 * @param {Function} onProgress - Progress callback (0-100)
 * @returns {Promise<{text: string, confidence: number}>}
 */
export const extractTextFromPDF = async (pdfUrl, onProgress = null) => {
  console.log("📄 extractTextFromPDF called for:", pdfUrl);
  try {
    // Load the PDF document with CORS mode
    const loadingTask = pdfjsLib.getDocument({
      url: pdfUrl,
      withCredentials: false,
      isEvalSupported: false
    });
    
    console.log("Loading PDF document...");
    const pdf = await loadingTask.promise;
    
    console.log(`✅ PDF loaded successfully. Total pages: ${pdf.numPages}`);
    
    let fullText = '';
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      if (onProgress) {
        onProgress(Math.round((pageNum / pdf.numPages) * 100));
      }
      
      console.log(`Processing page ${pageNum}/${pdf.numPages}...`);
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Combine all text items
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
      
      console.log(`  Page ${pageNum} extracted: ${pageText.length} characters`);
      console.log(`  First 200 chars: ${pageText.substring(0, 200)}`);
    }
    
    console.log("✅ PDF extraction complete. Total text length:", fullText.length);
    console.log("First 500 characters of extracted text:");
    console.log(fullText.substring(0, 500));
    
    return {
      text: fullText.trim(),
      confidence: 100, // PDF text extraction is deterministic
      words: fullText.split(/\s+/).length
    };
  } catch (error) {
    console.error('❌ PDF extraction error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
};

/**
 * OCR Service
 * Extracts text from images using Tesseract.js
 */

/**
 * Extract text from an image file
 * @param {File|string} imageSource - File object or URL
 * @param {Function} onProgress - Progress callback (0-100)
 * @returns {Promise<{text: string, confidence: number}>}
 */
/**
 * Preprocess image for better OCR results
 * Resizes, converts to grayscale, and increases contrast
 */
const preprocessImage = (imageSource) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // 1. Resize (Scale up by 2x for better detail)
      const scaleFactor = 2;
      canvas.width = img.width * scaleFactor;
      canvas.height = img.height * scaleFactor;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Get image data for pixel manipulation
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // 2. Grayscale & 3. Contrast Enhancement
      // Contrast factor (e.g., 1.2 for 20% more contrast)
      const contrast = 1.5; 
      const intercept = 128 * (1 - contrast);
      
      for (let i = 0; i < data.length; i += 4) {
        // Convert to grayscale (Luminosity method)
        const gray = 0.21 * data[i] + 0.72 * data[i + 1] + 0.07 * data[i + 2];
        
        // Apply contrast
        let newColor = gray * contrast + intercept;
        
        // Clamping
        newColor = Math.max(0, Math.min(255, newColor));
        
        data[i] = newColor;     // Red
        data[i + 1] = newColor; // Green
        data[i + 2] = newColor; // Blue
        // Alpha (data[i+3]) remains unchanged
      }
      
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    
    img.onerror = (err) => reject(err);
    
    // Handle both File objects and URLs
    if (imageSource instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => { img.src = e.target.result; };
      reader.readAsDataURL(imageSource);
    } else {
      img.src = imageSource;
    }
  });
};

/**
 * Extract text from an image file
 * @param {File|string} imageSource - File object or URL
 * @param {Function} onProgress - Progress callback (0-100)
 * @returns {Promise<{text: string, confidence: number}>}
 */
export const extractTextFromImage = async (imageSource, onProgress = null) => {
  console.log("OCRService: Starting extraction for", imageSource);
  try {
    // Preprocess the image first
    console.log("OCRService: Preprocessing image...");
    const processedImage = await preprocessImage(imageSource);
    
    const result = await Tesseract.recognize(
      processedImage,
      'eng', // Language
      {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            if (onProgress) onProgress(Math.round(m.progress * 100));
          }
        }
      }
    );

    console.log("OCRService: Extraction complete. Confidence:", result.data.confidence);
    return {
      text: result.data.text,
      confidence: result.data.confidence,
      words: result.data.words?.length || 0
    };
  } catch (error) {
    console.error('OCRService Error:', error);
    throw new Error('Failed to extract text from image');
  }
};

/**
 * Parse health metrics from extracted text
 * Uses regex patterns to find common health values
 */
export const parseHealthMetrics = (text) => {
  console.log("🔍 parseHealthMetrics called with text length:", text?.length);
  
  const metrics = {
    bloodPressure: null,
    bloodSugar: null,
    weight: null,
    heartRate: null,
    temperature: null,
    cholesterol: null
  };

  
  const bpPattern = /(?:BP|Blood\s*Pressure)[:\s]*(\d{2,3})\s*[\/\-]\s*(\d{2,3})/i;
  const bpMatch = text.match(bpPattern);
  console.log("  BP Pattern Match:", bpMatch);
  if (bpMatch) {
    metrics.bloodPressure = {
      systolic: parseInt(bpMatch[1]),
      diastolic: parseInt(bpMatch[2]),
      unit: 'mmHg'
    };
    console.log("  ✅ Found BP:", metrics.bloodPressure);
  }

  // Blood Sugar patterns
  // Examples: "95 mg/dL", "Glucose: 110", "Sugar 85mg/dl", "HbA1c: 5.7%"
  const sugarPattern = /(?:Glucose|Sugar|Blood\s*Sugar)[:\s]*(\d{2,3})\s*(?:mg\/d[lL])?/i;
  const sugarMatch = text.match(sugarPattern);
  console.log("  Sugar Pattern Match:", sugarMatch);
  if (sugarMatch) {
    metrics.bloodSugar = {
      value: parseInt(sugarMatch[1]),
      type: 'random',
      unit: 'mg/dL'
    };
    console.log("  ✅ Found Sugar:", metrics.bloodSugar);
  }

  // Fasting sugar
  const fastingSugarPattern = /Fasting[:\s]*(\d{2,3})/i;
  const fastingMatch = text.match(fastingSugarPattern);
  console.log("  Fasting Sugar Match:", fastingMatch);
  if (fastingMatch) {
    metrics.bloodSugar = {
      value: parseInt(fastingMatch[1]),
      type: 'fasting',
      unit: 'mg/dL'
    };
    console.log("  ✅ Found Fasting Sugar:", metrics.bloodSugar);
  }

  // HbA1c
  const hba1cPattern = /HbA1c[:\s]*(\d+\.?\d*)\s*%?/i;
  const hba1cMatch = text.match(hba1cPattern);
  console.log("  HbA1c Match:", hba1cMatch);
  if (hba1cMatch) {
    metrics.bloodSugar = {
      value: parseFloat(hba1cMatch[1]),
      type: 'hba1c',
      unit: '%'
    };
    console.log("  ✅ Found HbA1c:", metrics.bloodSugar);
  }

  // Weight patterns
  // Examples: "70 kg", "Weight: 154 lbs", "68.5kg"
  const weightPattern = /(?:Weight|Wt)[:\s]*(\d{2,3}\.?\d*)\s*(kg|lbs?)/i;
  const weightMatch = text.match(weightPattern);
  console.log("  Weight Match:", weightMatch);
  if (weightMatch) {
    metrics.weight = {
      value: parseFloat(weightMatch[1]),
      unit: weightMatch[2].toLowerCase().replace('lb', 'lbs')
    };
    console.log("  ✅ Found Weight:", metrics.weight);
  }

  // Heart Rate patterns
  // Examples: "HR: 72 bpm", "Heart Rate 80", "Pulse: 65"
  const hrPattern = /(?:HR|Heart\s*Rate|Pulse)[:\s]*(\d{2,3})\s*(?:bpm)?/i;
  const hrMatch = text.match(hrPattern);
  console.log("  Heart Rate Match:", hrMatch);
  if (hrMatch) {
    metrics.heartRate = {
      value: parseInt(hrMatch[1]),
      unit: 'bpm'
    };
    console.log("  ✅ Found Heart Rate:", metrics.heartRate);
  }

  // Temperature patterns
  // Examples: "98.6°F", "Temp: 37°C", "Temperature 36.5"
  const tempPattern = /(?:Temp|Temperature)[:\s]*(\d{2,3}\.?\d*)\s*°?\s*([CF])?/i;
  const tempMatch = text.match(tempPattern);
  console.log("  Temperature Match:", tempMatch);
  if (tempMatch) {
    metrics.temperature = {
      value: parseFloat(tempMatch[1]),
      unit: tempMatch[2] ? (tempMatch[2].toUpperCase() === 'F' ? 'fahrenheit' : 'celsius') : 'celsius'
    };
    console.log("  ✅ Found Temperature:", metrics.temperature);
  }

  // Cholesterol patterns
  // Examples: "Total Cholesterol: 180", "LDL: 100", "HDL: 45"
  const cholPattern = /(?:Total\s*)?Cholesterol[:\s]*(\d{2,3})/i;
  const cholMatch = text.match(cholPattern);
  
  const ldlPattern = /LDL[:\s]*(\d{2,3})/i;
  const ldlMatch = text.match(ldlPattern);
  
  const hdlPattern = /HDL[:\s]*(\d{2,3})/i;
  const hdlMatch = text.match(hdlPattern);

  console.log("  Cholesterol Matches - Total:", cholMatch, "LDL:", ldlMatch, "HDL:", hdlMatch);

  if (cholMatch || ldlMatch || hdlMatch) {
    metrics.cholesterol = {
      total: cholMatch ? parseInt(cholMatch[1]) : null,
      ldl: ldlMatch ? parseInt(ldlMatch[1]) : null,
      hdl: hdlMatch ? parseInt(hdlMatch[1]) : null,
      unit: 'mg/dL'
    };
    console.log("  ✅ Found Cholesterol:", metrics.cholesterol);
  }

  console.log("📊 Final Metrics:", metrics);
  return metrics;
};

/**
 * Parse medications from prescription text
 * Looks for common medication patterns
 */
export const parseMedications = (text) => {
  console.log("💊 parseMedications called with text length:", text?.length);
  const medications = [];
  
  // Pattern 1: Structured format (e.g., "Tab. Paracetamol 500mg - 1-0-1 x 5 days")
  const medPattern1 = /(?:Tab\.|Capsule|Syrup|Injection)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(\d+\s*(?:mg|ml|g|IU|mcg))\s*[-–]\s*([\d\-]+)\s*(?:x|for)?\s*(\d+\s*days?)/gi;
  
  // Pattern 2: Table/List format (e.g., "Metformin 500 mg Twice daily")
  // Matches: Name (words) + Dosage (num+unit) + Frequency (words)
  const medPattern2 = /([A-Z][a-z]+(?:\s+[A-Z][a-z0-9]+)*)\s+(\d+(?:,\d+)?\s*(?:mg|ml|g|IU|mcg))\s+((?:Twice|Once|Thrice|Daily|Weekly|Monthly|Every|at|in)\s+[A-Za-z\s]+)/gi;

  let match;
  let pattern1Count = 0;
  let pattern2Count = 0;
  
  // Try Pattern 1
  console.log("  Testing Pattern 1 (Structured)...");
  while ((match = medPattern1.exec(text)) !== null) {
    pattern1Count++;
    console.log(`    Match ${pattern1Count}:`, match[0]);
    medications.push({
      name: match[1].trim(),
      dosage: match[2].trim(),
      frequency: match[3].trim(),
      duration: match[4].trim()
    });
  }
  console.log(`  Pattern 1 found ${pattern1Count} medications`);

  // Try Pattern 2
  console.log("  Testing Pattern 2 (Table format)...");
  while ((match = medPattern2.exec(text)) !== null) {
    // Avoid duplicates if already found
    if (!medications.some(m => m.name === match[1].trim())) {
      pattern2Count++;
      console.log(`    Match ${pattern2Count}:`, match[0]);
      medications.push({
        name: match[1].trim(),
        dosage: match[2].trim(),
        frequency: match[3].trim(),
        duration: "Ongoing" // Default for this format
      });
    }
  }
  console.log(`  Pattern 2 found ${pattern2Count} new medications`);
  console.log(`💊 Total Medications Found: ${medications.length}`, medications);

  return medications;
};

/**
 * Check if file is an image (for OCR processing)
 */
export const isImageFile = (fileName) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'bmp', 'tiff', 'gif'];
  const extension = fileName.split('.').pop().toLowerCase();
  return imageExtensions.includes(extension);
};

/**
 * Convert file to data URL for Tesseract
 */
export const fileToDataURL = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
