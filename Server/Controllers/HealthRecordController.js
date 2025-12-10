const HealthRecord = require("../Models/HealthRecordSchema");
const User = require("../Models/Schema");
const cloudinary = require('cloudinary').v2;
const axios = require('axios');
const { extractTextFromPDF, parseHealthMetrics, parseMedications } = require('../Utils/pdfExtractor');
const { generateHealthSummary } = require('../Utils/aiHealthSummary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

/**
 * Health Record Controller
 * Handles CRUD operations for health records
 */

// ... (existing code) ...

/**
 * Download file from Cloudinary with authentication
 * GET /api/record/download/:id
 */
const downloadFile = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    // Find the record and verify ownership
    const record = await HealthRecord.findOne({ _id: id, user: userId });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Record not found or access denied"
      });
    }

    // Simplified download logic: Redirect to the Cloudinary URL with fl_attachment
    // This relies on the file being accessible (which it seems to be since "View" works)
    // and lets Cloudinary handle the download headers.
    
    let downloadUrl = record.fileLink;
    
    // Insert fl_attachment to force download if it's a Cloudinary URL
    if (downloadUrl.includes('cloudinary.com') && !downloadUrl.includes('fl_attachment')) {
        const uploadIndex = downloadUrl.indexOf('/upload/');
        if (uploadIndex !== -1) {
            downloadUrl = downloadUrl.replace('/upload/', '/upload/fl_attachment/');
        }
    }
    
    console.log("Redirecting to:", downloadUrl);
    return res.redirect(downloadUrl);

  } catch (error) {
    console.error("Error downloading file:", error);
    return res.status(500).json({
        success: false,
        message: "Failed to download file",
        error: error.message
    });
  }
};




/**
 * Upload a new health record
 * POST /api/record/uploadHealthRecord
 */
const uploadHealthRecord = async (req, res) => {
  try {
    console.log("📤 Upload Request Body:", JSON.stringify(req.body, null, 2));
    
    const { 
      cloudinaryUrl,  // Legacy support
      fileLink,       // New parameter name
      fileName, 
      fileType, 
      notes, 
      tags,
      extractedText,
      healthMetrics,
      medications,
      summary
    } = req.body;
    
    // Support both parameter names
    const fileUrl = fileLink || cloudinaryUrl;
    
    console.log("Extracted Data:");
    console.log("  - File URL:", fileUrl);
    console.log("  - Extracted Text Length:", extractedText?.length || 0);
    console.log("  - Health Metrics:", healthMetrics);
    console.log("  - Medications:", medications);
    console.log("  - Summary:", summary);
    
    // Get user ID from authenticated request
    const userId = req.user?._id || req.body.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    if (!fileUrl || !fileName) {
      return res.status(400).json({
        success: false,
        message: "File URL and name are required"
      });
    }

    // Server-side PDF extraction for PDF files
    let finalExtractedText = extractedText || '';
    let finalHealthMetrics = healthMetrics || {};
    let finalMedications = medications || [];
    let finalSummary = summary || '';
    let aiInsights = null;

    // Check if it's a PDF file and no text was extracted yet (server-side processing)
    // Note: Client sends empty string "" for PDFs, so we check for empty/missing text
    const isPDF = fileUrl.toLowerCase().includes('.pdf');
    console.log('📋 PDF Detection:');
    console.log('  - File URL:', fileUrl);
    console.log('  - Is PDF?', isPDF);
    console.log('  - Extracted Text Length:', finalExtractedText?.length || 0);
    console.log('  - Will extract?', isPDF && (!finalExtractedText || finalExtractedText.trim() === ''));
    
    if (isPDF && (!finalExtractedText || finalExtractedText.trim() === '')) {
      try {
        console.log('🔄 Server-side PDF extraction starting...');
        console.log('  - PDF URL:', fileUrl);
        
        // Extract text from PDF
        finalExtractedText = await extractTextFromPDF(fileUrl);
        console.log(`✅ Extracted ${finalExtractedText.length} characters from PDF`);
        console.log('  - First 200 chars:', finalExtractedText.substring(0, 200));
        
        // Parse health metrics and medications
        finalHealthMetrics = parseHealthMetrics(finalExtractedText);
        finalMedications = parseMedications(finalExtractedText);
        
        console.log('📊 Parsed health metrics:', JSON.stringify(finalHealthMetrics, null, 2));
        console.log('💊 Parsed medications:', JSON.stringify(finalMedications, null, 2));
        
        // Generate AI health summary
        console.log('🤖 Generating AI summary...');
        aiInsights = generateHealthSummary(finalHealthMetrics, finalMedications, finalExtractedText);
        finalSummary = aiInsights.overview;
        
        console.log('✅ AI Summary generated:', finalSummary);
      } catch (pdfError) {
        console.error('❌ PDF processing error:', pdfError.message);
        console.error('Full error:', pdfError);
        console.error('Stack trace:', pdfError.stack);
        // Continue with upload even if PDF processing fails
        finalSummary = `PDF uploaded successfully, but text extraction failed. Error: ${pdfError.message}`;
      }
    }

    // Generate AI insights if not already generated (e.g. for images where client sent metrics)
    if (!aiInsights && (finalExtractedText || Object.keys(finalHealthMetrics).length > 0)) {
      console.log('🤖 Generating AI summary for uploaded content...');
      aiInsights = generateHealthSummary(finalHealthMetrics, finalMedications, finalExtractedText);
      
      // If client didn't provide a summary, use the one from AI
      if (!finalSummary || finalSummary === "Document text extracted, but no specific health data identified.") {
        finalSummary = aiInsights.overview;
      }
    }

    // Determine processing status based on OCR data
    let processingStatus = 'pending';
    if (finalExtractedText) {
      processingStatus = 'completed';
    }

    // Create new health record
    const newRecord = new HealthRecord({
      user: userId,
      fileName: fileName,
      fileLink: fileUrl,
      fileType: fileType || 'other',
      notes: notes || '',
      tags: tags || [],
      extractedText: finalExtractedText,
      healthMetrics: finalHealthMetrics,
      medications: finalMedications,
      summary: finalSummary,
      insights: aiInsights,
      processingStatus: processingStatus
    });

    console.log("💾 Saving record to database...");
    await newRecord.save();
    console.log("✅ Record saved successfully with ID:", newRecord._id);

    return res.status(201).json({
      success: true,
      message: "Health record uploaded successfully",
      newRecord: {
        _id: newRecord._id,
        fileName: newRecord.fileName,
        fileLink: newRecord.fileLink,
        fileType: newRecord.fileType,
        uploadDate: newRecord.uploadDate,
        processingStatus: newRecord.processingStatus,
        hasMetrics: !!(healthMetrics?.bloodPressure?.systolic || healthMetrics?.bloodSugar?.value || healthMetrics?.weight?.value),
        medicationCount: medications?.length || 0
      }
    });

  } catch (error) {
    console.error("❌ Error uploading health record:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload health record",
      error: error.message
    });
  }
};

/**
 * Get all health records for a user
 * GET /api/record/getRecords
 */
const getRecords = async (req, res) => {
  try {
    const userId = req.user?._id || req.query.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    // Optional filters
    const { fileType, startDate, endDate, limit = 50 } = req.query;
    
    let query = { user: userId };
    
    // Apply filters
    if (fileType) {
      query.fileType = fileType;
    }
    
    if (startDate || endDate) {
      query.uploadDate = {};
      if (startDate) query.uploadDate.$gte = new Date(startDate);
      if (endDate) query.uploadDate.$lte = new Date(endDate);
    }

    const records = await HealthRecord.find(query)
      .sort({ uploadDate: -1 })
      .limit(parseInt(limit))
      .select('-extractedText'); // Don't send raw OCR text in list view

    return res.status(200).json({
      success: true,
      count: records.length,
      myData: records.map(record => ({
        _id: record._id,
        title: record.fileName,
        fileLink: record.fileLink,
        fileType: record.fileType,
        uploadDate: record.uploadDate,
        summary: record.summary,
        tags: record.tags,
        processingStatus: record.processingStatus,
        hasMetrics: !!(record.healthMetrics?.bloodPressure || 
                       record.healthMetrics?.bloodSugar || 
                       record.healthMetrics?.weight),
        medicationCount: record.medications?.length || 0
      }))
    });

  } catch (error) {
    console.error("Error fetching health records:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch health records",
      error: error.message
    });
  }
};

/**
 * Get a single health record by ID
 * GET /api/record/getRecordById/:id
 */
const getRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    let record = await HealthRecord.findOne({ _id: id, user: userId });
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Health record not found"
      });
    }

    // Regenerate insights if missing (for old records)
    if (!record.insights && (record.healthMetrics || record.medications?.length > 0 || record.extractedText)) {
      console.log('🔄 Regenerating insights for record:', record._id);
      const aiInsights = generateHealthSummary(
        record.healthMetrics || {},
        record.medications || [],
        record.extractedText || ''
      );
      
      // Update the record with new insights
      record.insights = aiInsights;
      if (!record.summary || record.summary === "Document text extracted, but no specific health data identified.") {
        record.summary = aiInsights.overview;
      }
      
      await record.save();
      console.log('✅ Insights regenerated successfully');
    }

    return res.status(200).json({
      success: true,
      record: record
    });

  } catch (error) {
    console.error("Error fetching health record:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch health record",
      error: error.message
    });
  }
};

/**
 * Update health record notes and tags
 * PUT /api/record/updateRecord/:id
 */
const updateRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    const { notes, tags, fileType } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const updateData = {};
    if (notes !== undefined) updateData.notes = notes;
    if (tags !== undefined) updateData.tags = tags;
    if (fileType !== undefined) updateData.fileType = fileType;
    updateData.updatedAt = Date.now();

    const record = await HealthRecord.findOneAndUpdate(
      { _id: id, user: userId },
      updateData,
      { new: true }
    );
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Health record not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Health record updated successfully",
      record: record
    });

  } catch (error) {
    console.error("Error updating health record:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update health record",
      error: error.message
    });
  }
};

/**
 * Delete a health record
 * DELETE /api/record/deleteRecord/:id
 */
const deleteRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const record = await HealthRecord.findOneAndDelete({ _id: id, user: userId });
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Health record not found"
      });
    }

    // TODO: Delete file from Cloudinary (optional)

    return res.status(200).json({
      success: true,
      message: "Health record deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting health record:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete health record",
      error: error.message
    });
  }
};

/**
 * Get health metrics summary
 * GET /api/record/getMetricsSummary
 */
const getMetricsSummary = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { days = 30 } = req.query;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - parseInt(days));

    // Get all records with health metrics
    const records = await HealthRecord.find({
      user: userId,
      uploadDate: { $gte: dateThreshold },
      $or: [
        { 'healthMetrics.bloodPressure': { $exists: true } },
        { 'healthMetrics.bloodSugar': { $exists: true } },
        { 'healthMetrics.weight': { $exists: true } },
        { 'healthMetrics.heartRate': { $exists: true } }
      ]
    }).sort({ uploadDate: -1 });

    // Extract metrics for charting
    const bpData = [];
    const sugarData = [];
    const weightData = [];
    const heartRateData = [];

    records.forEach(record => {
      if (record.healthMetrics?.bloodPressure?.systolic) {
        bpData.push({
          date: record.healthMetrics.bloodPressure.date || record.uploadDate,
          systolic: record.healthMetrics.bloodPressure.systolic,
          diastolic: record.healthMetrics.bloodPressure.diastolic
        });
      }
      
      if (record.healthMetrics?.bloodSugar?.value) {
        sugarData.push({
          date: record.healthMetrics.bloodSugar.date || record.uploadDate,
          value: record.healthMetrics.bloodSugar.value,
          type: record.healthMetrics.bloodSugar.type
        });
      }
      
      if (record.healthMetrics?.weight?.value) {
        weightData.push({
          date: record.healthMetrics.weight.date || record.uploadDate,
          value: record.healthMetrics.weight.value,
          unit: record.healthMetrics.weight.unit
        });
      }
      
      if (record.healthMetrics?.heartRate?.value) {
        heartRateData.push({
          date: record.healthMetrics.heartRate.date || record.uploadDate,
          value: record.healthMetrics.heartRate.value
        });
      }
    });

    return res.status(200).json({
      success: true,
      summary: {
        bloodPressure: bpData,
        bloodSugar: sugarData,
        weight: weightData,
        heartRate: heartRateData,
        totalRecords: records.length
      }
    });

  } catch (error) {
    console.error("Error fetching metrics summary:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch metrics summary",
      error: error.message
    });
  }
};

module.exports = {
  uploadHealthRecord,
  getRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
  getMetricsSummary,
  downloadFile
};
