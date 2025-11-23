import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaFilePdf, FaTrash, FaEdit, FaMagic, FaPills } from "react-icons/fa";
import { toast } from "react-toastify";
import { extractTextFromImage, parseHealthMetrics, parseMedications, isImageFile } from "../Services/OCRService";
import "../App.css";

const RecordSection = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [data, setData] = useState([]);
  const [fileType, setFileType] = useState("other");
  const [notes, setNotes] = useState("");
  const [ocrProgress, setOcrProgress] = useState(0);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET;
  
  const openWidget = () => {
    if (!window.cloudinary) {
      toast.error("Cloudinary widget not loaded");
      return;
    }

    setUploading(true);
    setExtractedData(null);
    
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: CLOUD_NAME,
        uploadPreset: UPLOAD_PRESET,
        resourceType: 'raw', // Raw for PDFs and documents
        multiple: false,
        clientAllowedFormats: ['pdf', 'jpg', 'jpeg', 'png'],
        sources: ['local', 'url', 'camera'],
      },
      async (error, result) => {
        if (!error && result && result.event === "success") {
          setUploadedUrl(result.info.secure_url);
          const fileName = result.info.original_filename;
          const fileUrl = result.info.secure_url;

          // Initialize OCR variables (will be populated if image or PDF)
          let extractedText = "";
          let healthMetrics = null;
          let medications = [];
          let summary = "";

          // Check file type - check both filename and URL
          let ocrData = null;
          const isPDF = fileName.toLowerCase().endsWith('.pdf') || fileUrl.toLowerCase().includes('.pdf');
          const isImage = isImageFile(fileName) || isImageFile(fileUrl);
          
          console.log("🔍 File Type Detection:");
          console.log("  - File name:", fileName);
          console.log("  - File URL:", fileUrl);
          console.log("  - Is PDF?", isPDF);
          console.log("  - Is Image?", isImage);
          
          if (isPDF) {
            // PDFs are processed server-side - no client processing needed
            console.log("📄 PDF detected - will be processed server-side");
            toast.info("PDF will be analyzed on upload...");
          } else if (isImage) {
            // Extract text from image using OCR
            try {
              setIsProcessingOCR(true);
              toast.info("Extracting text from image...");
              
              // Perform OCR
              const ocrResult = await extractTextFromImage(fileUrl, (progress) => {
                setOcrProgress(progress);
              });
              extractedText = ocrResult.text;
              
              console.log("--- RAW OCR TEXT ---");
              console.log(extractedText);
              console.log("--------------------");

              if (extractedText) {
                healthMetrics = parseHealthMetrics(extractedText);
                medications = parseMedications(extractedText);
                
                console.log("Parsed Metrics:", healthMetrics);
                console.log("Parsed Medications:", medications);
                
                // Simple summary generation based on findings
                const metricsCount = Object.values(healthMetrics).filter(v => v !== null).length;
                const medsCount = medications.length;
                
                if (metricsCount > 0 || medsCount > 0) {
                  summary = `Found ${metricsCount} health metrics and ${medsCount} medications.`;
                  if (healthMetrics.bloodPressure) summary += ` BP: ${healthMetrics.bloodPressure.systolic}/${healthMetrics.bloodPressure.diastolic}.`;
                  if (healthMetrics.bloodSugar) summary += ` Sugar: ${healthMetrics.bloodSugar.value}.`;
                } else {
                  summary = "Document text extracted, but no specific health data identified.";
                }
              }

              ocrData = {
                extractedText: ocrResult.text,
                healthMetrics,
                medications,
                confidence: ocrResult.confidence
              };

              setExtractedData(ocrData);
              
              if (Object.values(healthMetrics || {}).some(v => v !== null)) {
                toast.success(`Found health data! Confidence: ${Math.round(ocrResult.confidence)}%`);
              } else {
                toast.info("Text extracted, but no health metrics detected");
              }
            } catch (ocrError) {
              console.error("OCR failed:", ocrError);
              toast.warning("Could not extract text from image");
            } finally {
              setIsProcessingOCR(false);
              setOcrProgress(0);
            }
          } else {
            console.log("⚠️ File type not supported for text extraction:", fileName);
            toast.info("File uploaded. Text extraction only works with images and PDFs.");
          }

          // Upload to backend
          try {
            const uploadData = {
              fileName: result.info.original_filename,
              fileLink: result.info.secure_url,
              fileType: fileType,
              notes: notes,
              extractedText,
              healthMetrics,
              medications,
              summary
            };
            
            console.log("📤 Uploading to server:");
            console.log("  - File Name:", uploadData.fileName);
            console.log("  - File Type:", uploadData.fileType);
            console.log("  - Extracted Text Length:", uploadData.extractedText?.length || 0);
            console.log("  - Health Metrics:", uploadData.healthMetrics);
            console.log("  - Medications Count:", uploadData.medications?.length || 0);
            console.log("  - Summary:", uploadData.summary);
            
            const res = await axios.post(
              `${BACKEND_URL}/api/record/uploadHealthRecord`,
              uploadData,
              { 
                withCredentials: true,
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );

            console.log("✅ Server Response:", res.data);

            if (res.data.success) {
              toast.success("Health record uploaded successfully!");
              // Reset form
              setFileType("other");
              setNotes("");
              setExtractedData(null);
              // Refresh list
              fetchRecords();
            }
          } catch (err) {
            console.error("❌ Upload failed:", err);
            console.error("  - Error message:", err.message);
            console.error("  - Response data:", err.response?.data);
            console.error("  - Response status:", err.response?.status);
            toast.error(err.response?.data?.message || "Failed to upload record");
          } finally {
            setUploading(false);
          }
        } else if (error) {
          console.error("Cloudinary error:", error);
          toast.error("Failed to upload file to cloud storage");
          setUploading(false);
        } else if (result.event === "close") {
            setUploading(false);
        }
      }
    );
    widget.open();
  };

  const fetchRecords = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Don't try to fetch if no token exists
      if (!token) {
        console.log("No authentication token found");
        setData([]);
        return;
      }

      const res = await axios.get(`${BACKEND_URL}/api/record/getRecords`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (res.data.success) {
        setData(res.data.myData);
      }
    } catch (e) {
      console.error("Error fetching records:", e);
      
      // Handle 401 specifically - user not authenticated
      if (e.response?.status === 401) {
        console.log("User not authenticated - please log in");
        console.log("Full error response:", e.response.data);
        
        // Check if it's a malformed token error
        if (e.response.data?.message?.includes("jwt malformed") || 
            e.response.data?.message?.includes("invalid token")) {
          // Clear the corrupted token
          localStorage.removeItem("token");
          toast.error("Your session is invalid. Please log in again.");
        }
        
        setData([]);
      } else {
        toast.error("Failed to load health records");
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) {
      return;
    }

    try {
      const res = await axios.delete(
        `${BACKEND_URL}/api/record/deleteRecord/${id}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        toast.success("Record deleted successfully");
        fetchRecords();
      }
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete record");
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const getFileTypeLabel = (type) => {
    const labels = {
      prescription: "Prescription",
      lab_report: "Lab Report",
      scan: "Scan/X-Ray",
      xray: "X-Ray",
      other: "Other"
    };
    return labels[type] || "Document";
  };

  const getFileTypeColor = (type) => {
    const colors = {
      prescription: "bg-blue-100 text-blue-800",
      lab_report: "bg-green-100 text-green-800",
      scan: "bg-purple-100 text-purple-800",
      xray: "bg-purple-100 text-purple-800",
      other: "bg-gray-100 text-gray-800"
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  // Helper function to generate download URL
  const getDownloadUrl = (url) => {
    if (!url) return "#";
    
    if (url.includes('cloudinary.com')) {
      // If it already has fl_attachment, return it
      if (url.includes('fl_attachment')) return url;
      
      // Insert fl_attachment to force download
      // Look for /upload/ and replace it with /upload/fl_attachment/
      return url.replace(/\/upload\//, '/upload/fl_attachment/');
    }
    
    return url;
  };

  const fetchRecordDetails = async (id) => {
    console.log("🔍 Fetching record details for ID:", id);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/record/getRecordById/${id}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      console.log("📥 Backend Response:", res.data);
      
      if (res.data.success) {
        console.log("✅ Record Details:", res.data.record);
        console.log("  - Summary:", res.data.record.summary);
        console.log("  - Health Metrics:", res.data.record.healthMetrics);
        console.log("  - Medications:", res.data.record.medications);
        console.log("  - Extracted Text:", res.data.record.extractedText?.substring(0, 100) + "...");
        setSelectedRecord(res.data.record);
      }
    } catch (err) {
      console.error("❌ Error fetching record details:", err);
      toast.error("Failed to load analysis details");
    }
  };

  // Analysis Modal State
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const openAnalysis = async (record) => {
    console.log("🔬 Opening Analysis Modal for:", record.title);
    console.log("  - Record ID:", record._id);
    setShowAnalysis(true);
    setLoadingDetails(true);
    // Set initial data from list view while fetching full details
    setSelectedRecord(record); 
    
    await fetchRecordDetails(record._id);
    setLoadingDetails(false);
    console.log("✅ Analysis Modal Ready");
  };

  const closeAnalysis = () => {
    setShowAnalysis(false);
    setSelectedRecord(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center hide-scrollbar gap-12 p-4">
      {/* Upload Box */}
      <div className="bg-white/50 backdrop-blur-md border border-gray-300 shadow-md p-6 rounded-2xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
          Upload Health Record
        </h2>

        {/* File Type Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Type
          </label>
          <select
            value={fileType}
            onChange={(e) => setFileType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="prescription">Prescription</option>
            <option value="lab_report">Lab Report</option>
            <option value="scan">Scan/X-Ray</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Notes */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this document..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows="3"
          />
        </div>

        <button
          onClick={openWidget}
          disabled={uploading}
          className="mb-4 w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? "Uploading..." : "Upload Document"}
        </button>

        {uploadedUrl && (
          <div className="mt-4 text-center">
            <p className="text-green-600 font-medium">Uploaded successfully!</p>
            <button
              onClick={() =>
                window.open(
                  `${uploadedUrl}`,
                  "_blank",
                  "noopener,noreferrer"
                )}
              className="text-blue-600 underline break-words"
            >
              View Document
            </button>
          </div>
        )}
      </div>

      {/* Records List */}
      <div className="w-full max-w-4xl space-y-4 overflow-y-auto h-full pr-2 custom-scroll">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Your Health Records</h3>
        
        {data.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No records found.</p>
            <p className="text-sm text-gray-400 mt-2">Upload your first health document to get started!</p>
          </div>
        ) : (
          data.map((item, index) => (
            <div
              key={item._id || index}
              className="bg-white/60 backdrop-blur-md border border-gray-200 rounded-xl hover:bg-slate-100 p-4 flex flex-wrap items-center justify-between shadow-sm hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FaFilePdf className="text-red-600 text-2xl shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-gray-800 font-medium break-words truncate">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${getFileTypeColor(item.fileType)}`}>
                      {getFileTypeLabel(item.fileType)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(item.uploadDate).toLocaleDateString()}
                    </span>
                    {/* Analysis Badge */}
                    {(item.hasMetrics || item.medicationCount > 0) && (
                      <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 flex items-center gap-1">
                        <FaMagic className="text-[10px]" /> Analyzed
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                <button
                  onClick={() => openAnalysis(item)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mr-2"
                >
                  View Analysis
                </button>
                <a
                  href={getDownloadUrl(item.fileLink)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline text-sm"
                >
                  Download
                </a>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="text-red-600 hover:text-red-800 p-2"
                  title="Delete record"
                >
                  <FaTrash className="text-sm" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Analysis Modal */}
      {showAnalysis && selectedRecord && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FaMagic className="text-indigo-500" /> Health Analysis
                </h3>
                <p className="text-sm text-gray-500 mt-1">{selectedRecord.title}</p>
              </div>
              <button 
                onClick={closeAnalysis}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto custom-scroll space-y-6">
              
              {/* Summary Section */}
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <h4 className="font-semibold text-indigo-900 mb-2">AI Summary</h4>
                <p className="text-indigo-800 text-sm leading-relaxed">
                  {selectedRecord.summary || "No summary available for this document."}
                </p>
              </div>

              {/* Metrics Grid */}
              {loadingDetails ? (
                 <div className="col-span-full text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                    <p className="text-gray-500 text-sm">Analyzing document...</p>
                 </div>
              ) : (
                <>
                  {selectedRecord.healthMetrics && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Health Metrics
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Blood Pressure */}
                        {selectedRecord.healthMetrics.bloodPressure?.systolic && (
                          <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                            <p className="text-xs text-gray-500 uppercase font-semibold">Blood Pressure</p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">
                              {selectedRecord.healthMetrics.bloodPressure.systolic}/{selectedRecord.healthMetrics.bloodPressure.diastolic}
                              <span className="text-sm text-gray-500 font-normal ml-1">mmHg</span>
                            </p>
                          </div>
                        )}
                        
                        {/* Blood Sugar */}
                        {selectedRecord.healthMetrics.bloodSugar?.value && (
                          <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                            <p className="text-xs text-gray-500 uppercase font-semibold">Blood Sugar</p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">
                              {selectedRecord.healthMetrics.bloodSugar.value}
                              <span className="text-sm text-gray-500 font-normal ml-1">mg/dL</span>
                            </p>
                            <p className="text-xs text-gray-400 mt-1 capitalize">{selectedRecord.healthMetrics.bloodSugar.type}</p>
                          </div>
                        )}

                        {/* Weight */}
                        {selectedRecord.healthMetrics.weight?.value && (
                          <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                            <p className="text-xs text-gray-500 uppercase font-semibold">Weight</p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">
                              {selectedRecord.healthMetrics.weight.value}
                              <span className="text-sm text-gray-500 font-normal ml-1">{selectedRecord.healthMetrics.weight.unit}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Medications */}
                  {selectedRecord.medications && selectedRecord.medications.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        Medications Found
                      </h4>
                      <div className="space-y-3">
                        {selectedRecord.medications.map((med, idx) => (
                          <div key={idx} className="flex items-start gap-3 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                              <FaPills />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{med.name}</p>
                              <p className="text-sm text-gray-600">
                                {med.dosage} • {med.frequency} • {med.duration}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Insights Section */}
                  {selectedRecord.insights ? (
                    <div className="mt-6 space-y-4">
                      {/* Health Status Badge */}
                      <div className={`p-4 rounded-xl border-2 ${
                        selectedRecord.insights.healthStatus === 'normal' ? 'bg-green-50 border-green-200' :
                        selectedRecord.insights.healthStatus === 'attention' ? 'bg-yellow-50 border-yellow-200' :
                        'bg-red-50 border-red-200'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-2xl ${
                            selectedRecord.insights.healthStatus === 'normal' ? 'text-green-600' :
                            selectedRecord.insights.healthStatus === 'attention' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {selectedRecord.insights.healthStatus === 'normal' ? '✅' :
                             selectedRecord.insights.healthStatus === 'attention' ? '💡' : '⚠️'}
                          </span>
                          <h4 className="font-bold text-gray-800">Health Status</h4>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {selectedRecord.insights.overview}
                        </p>
                      </div>

                      {/* Suggestions */}
                      {selectedRecord.insights.suggestions && selectedRecord.insights.suggestions.length > 0 && (
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                          <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                            <span className="text-lg">💡</span> Health Suggestions
                          </h4>
                          <ul className="space-y-2">
                            {selectedRecord.insights.suggestions.map((suggestion, idx) => (
                              <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                                <span className="mt-1">•</span>
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Mental Health Tips */}
                      {selectedRecord.insights.mentalHealthTips && selectedRecord.insights.mentalHealthTips.length > 0 && (
                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                          <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                            <span className="text-lg">🧠</span> Mental Health Tips
                          </h4>
                          <ul className="space-y-2">
                            {selectedRecord.insights.mentalHealthTips.map((tip, idx) => (
                              <li key={idx} className="text-sm text-purple-800 flex items-start gap-2">
                                <span className="mt-1">•</span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Lifestyle Recommendations */}
                      {selectedRecord.insights.lifestyleRecommendations && selectedRecord.insights.lifestyleRecommendations.length > 0 && (
                        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                          <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                            <span className="text-lg">🌱</span> Lifestyle Recommendations
                          </h4>
                          <ul className="space-y-2">
                            {selectedRecord.insights.lifestyleRecommendations.map((rec, idx) => (
                              <li key={idx} className="text-sm text-green-800 flex items-start gap-2">
                                <span className="mt-1">•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-6 bg-gray-50 p-6 rounded-xl border border-gray-200 text-center">
                      <p className="text-gray-600 text-sm mb-2">
                        <span className="text-2xl mb-2 block">🤖</span>
                        AI insights are being generated for this record.
                      </p>
                      <p className="text-gray-500 text-xs">
                        Refresh the analysis to see personalized health suggestions.
                      </p>
                    </div>
                  )}
                </>
              )}

                  {/* Empty State */}
                  {(!selectedRecord.healthMetrics?.bloodPressure?.systolic && 
                    !selectedRecord.healthMetrics?.bloodSugar?.value &&
                    !selectedRecord.healthMetrics?.weight?.value &&
                    (!selectedRecord.medications || selectedRecord.medications.length === 0)) && (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <p className="text-gray-500 text-sm">No structured health data detected in this document.</p>
                    </div>
                  )}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={closeAnalysis}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordSection;

