const mongoose = require("mongoose");

/**
 * Health Record Schema
 * Stores uploaded health documents (prescriptions, lab reports, scans)
 * with extracted data and AI-generated insights
 */
const healthRecordSchema = new mongoose.Schema({
  // User reference
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  // File metadata
  fileName: {
    type: String,
    required: true
  },
  fileLink: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['prescription', 'lab_report', 'scan', 'xray', 'other'],
    default: 'other'
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },

  // OCR extracted text (raw)
  extractedText: {
    type: String,
    default: ''
  },

  // Structured health metrics extracted from document
  healthMetrics: {
    // Blood Pressure
    bloodPressure: {
      systolic: Number,
      diastolic: Number,
      unit: { type: String, default: 'mmHg' },
      date: Date
    },
    
    // Blood Sugar
    bloodSugar: {
      value: Number,
      type: { type: String, enum: ['fasting', 'random', 'post_meal', 'hba1c'] },
      unit: { type: String, default: 'mg/dL' },
      date: Date
    },
    
    // Weight
    weight: {
      value: Number,
      unit: { type: String, enum: ['kg', 'lbs'], default: 'kg' },
      date: Date
    },
    
    // Heart Rate
    heartRate: {
      value: Number,
      unit: { type: String, default: 'bpm' },
      date: Date
    },
    
    // Body Temperature
    temperature: {
      value: Number,
      unit: { type: String, enum: ['celsius', 'fahrenheit'], default: 'celsius' },
      date: Date
    },
    
    // BMI
    bmi: {
      value: Number,
      date: Date
    },
    
    // Cholesterol
    cholesterol: {
      total: Number,
      ldl: Number,
      hdl: Number,
      triglycerides: Number,
      unit: { type: String, default: 'mg/dL' },
      date: Date
    },
    
    // Other lab values (flexible)
    otherMetrics: [{
      name: String,
      value: String,
      unit: String,
      normalRange: String,
      date: Date
    }]
  },

  // Medications extracted from prescription
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    duration: String,
    startDate: Date,
    endDate: Date,
    instructions: String
  }],

  // AI-generated summary and insights
  summary: {
    type: String,
    default: ''
  },
  insights: {
    healthStatus: { type: String, enum: ['normal', 'attention', 'concerning'], default: 'normal' },
    overview: { type: String, default: '' },
    keyFindings: [{ type: String }],
    suggestions: [{ type: String }],
    mentalHealthTips: [{ type: String }],
    lifestyleRecommendations: [{ type: String }]
  },

  // User-added tags and notes
  tags: [{
    type: String
  }],
  notes: {
    type: String,
    default: ''
  },

  // Processing status
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
healthRecordSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
healthRecordSchema.index({ user: 1, uploadDate: -1 });
healthRecordSchema.index({ user: 1, fileType: 1 });

const HealthRecord = mongoose.model("HealthRecord", healthRecordSchema);

module.exports = HealthRecord;
