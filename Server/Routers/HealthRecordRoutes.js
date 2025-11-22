const express = require("express");
const router = express.Router();
const {
  uploadHealthRecord,
  getRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
  getMetricsSummary,
  downloadFile
} = require("../Controllers/HealthRecordController");
const { isAuthenticated } = require("../Middleware/authMiddleware");

/**
 * Health Record Routes
 * All routes require authentication
 */

// Upload a new health record
router.post("/uploadHealthRecord", isAuthenticated, uploadHealthRecord);

// Get all health records for the authenticated user
router.get("/getRecords", isAuthenticated, getRecords);

// Get a specific health record by ID
router.get("/getRecordById/:id", isAuthenticated, getRecordById);

// Update health record (notes, tags, fileType)
router.put("/updateRecord/:id", isAuthenticated, updateRecord);

// Delete a health record
router.delete("/deleteRecord/:id", isAuthenticated, deleteRecord);

// Get health metrics summary (for charts)
router.get("/getMetricsSummary", isAuthenticated, getMetricsSummary);

// Download file via proxy
router.get("/download/:id", isAuthenticated, downloadFile);

module.exports = router;
