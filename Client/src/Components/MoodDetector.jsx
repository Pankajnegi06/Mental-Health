import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import { FiCamera, FiX, FiRefreshCw } from 'react-icons/fi';
import { useAppContext } from '../Context/AppContext';

const MoodDetector = () => {
  const { BACKEND_URL } = useAppContext();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [stream, setStream] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [moodResult, setMoodResult] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);

  // Mood emoji mapping
  const moodEmojis = {
    happy: '😊',
    sad: '😢',
    anxious: '😰',
    angry: '😠',
    neutral: '😐',
    surprised: '😲',
    fearful: '😨',
    excited: '🤩',
    tired: '😴',
    stressed: '😫'
  };

  // Start camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setStream(mediaStream);
      setCameraActive(true);
      toast.success('Camera activated');
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Failed to access camera. Please grant permission.');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraActive(false);
      setCapturedImage(null);
      setMoodResult(null);
    }
  };

  // Capture image from video
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
    
    return imageData;
  };

  // Analyze mood
  const analyzeMood = async () => {
    try {
      setAnalyzing(true);
      toast.loading('Analyzing your mood...');

      const imageData = captureImage();
      if (!imageData) {
        toast.error('Failed to capture image');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to use this feature');
        return;
      }

      const response = await axios.post(
        `${BACKEND_URL}/api/mood-detection/analyze`,
        { imageData },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      toast.dismiss();
      
      if (response.data.status === 1) {
        setMoodResult(response.data.data);
        toast.success('Mood detected successfully!');
        stopCamera();
      } else {
        toast.error(response.data.message || 'Failed to analyze mood');
      }

    } catch (error) {
      toast.dismiss();
      console.error('Error analyzing mood:', error);
      toast.error(error.response?.data?.message || 'Failed to analyze mood');
    } finally {
      setAnalyzing(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster position="top-center" />
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Mood Detector</h1>
          <p className="text-gray-600">Analyze your emotional state using AI</p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          {!cameraActive && !moodResult && (
            <div className="text-center py-12">
              <div className="mb-6">
                <FiCamera className="w-24 h-24 mx-auto text-indigo-500" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Ready to detect your mood?
              </h2>
              <p className="text-gray-600 mb-8">
                We'll analyze your facial expression to determine your emotional state
                and provide personalized recommendations.
              </p>
              <button
                onClick={startCamera}
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors duration-200"
              >
                Start Camera
              </button>
            </div>
          )}

          {cameraActive && (
            <div className="space-y-6">
              {/* Video Preview */}
              <div className="relative rounded-lg overflow-hidden bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-auto"
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {capturedImage && (
                  <div className="absolute inset-0 bg-black">
                    <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={analyzeMood}
                  disabled={analyzing}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {analyzing ? (
                    <>
                      <FiRefreshCw className="animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <FiCamera />
                      Detect My Mood
                    </>
                  )}
                </button>
                
                <button
                  onClick={stopCamera}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200 flex items-center gap-2"
                >
                  <FiX />
                  Cancel
                </button>
              </div>
            </div>
          )}

          {moodResult && (
            <div className="space-y-6">
              {/* Mood Result */}
              <div className="text-center py-8">
                <div className="text-8xl mb-4">
                  {moodEmojis[moodResult.mood] || '😐'}
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2 capitalize">
                  {moodResult.mood.replace('_', ' ')}
                </h2>
                <p className="text-gray-600 mb-4">
                  Confidence: {moodResult.confidence}%
                </p>
                {moodResult.facialIndicators && (
                  <p className="text-sm text-gray-500 italic">
                    {moodResult.facialIndicators}
                  </p>
                )}
              </div>

              {/* Recommendations */}
              {moodResult.recommendations && (
                <div className="bg-indigo-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Recommendations for You
                  </h3>
                  
                  {moodResult.recommendations.summary && (
                    <p className="text-gray-700 mb-4">
                      {moodResult.recommendations.summary}
                    </p>
                  )}

                  {moodResult.recommendations.activities && moodResult.recommendations.activities.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Suggested Activities:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {moodResult.recommendations.activities.map((activity, index) => (
                          <li key={index} className="text-gray-700">{activity}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {moodResult.recommendations.tips && moodResult.recommendations.tips.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Quick Tips:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {moodResult.recommendations.tips.map((tip, index) => (
                          <li key={index} className="text-gray-700">{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    setMoodResult(null);
                    setCapturedImage(null);
                    startCamera();
                  }}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors duration-200"
                >
                  Detect Again
                </button>
                <button
                  onClick={() => window.location.href = '/mental-health'}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors duration-200"
                >
                  View Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MoodDetector;
