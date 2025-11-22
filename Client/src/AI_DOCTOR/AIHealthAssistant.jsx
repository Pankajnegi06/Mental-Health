import axios from "axios";
import React, { useState } from "react";
import { toast, Toaster } from "react-hot-toast";

const AIHealthAssistant = () => {
  const [ImageURL, setImageURL] = useState(null);
  const [isShowing, setIsShowing] = useState(false);
  const [ImageFile, setImageFile] = useState(null);
  const [query, setQuery] = useState("");
  const [output, setOutput] = useState(null);
  const [processing, setProcessing] = useState(false);
  const GROQLINK = import.meta.env.VITE_GROQ_LINK;

  const setFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imgURL = URL.createObjectURL(file);
      setImageFile(file);
      setImageURL(imgURL);
    }
  };

  const closeDown = () => {
    setIsShowing(false);
    setImageURL(null);
    setImageFile(null);
  };

  const handleSubmit = async () => {
    if (!query || !query.trim()) {
      toast.error("Please type your health question.");
      return;
    }

    toast.success("Wait for the Response...");
    setProcessing(true); // Start processing immediately

    try {
      // If an image is provided, include it. Otherwise, send text-only.
      if (ImageFile) {
        const reader = new FileReader();
        reader.readAsDataURL(ImageFile);
        reader.onloadend = async () => {
          const base64Image = reader.result;

          const payload = {
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: query },
                  { type: "image_url", image_url: { url: base64Image } },
                ],
              },
            ],
            temperature: 1,
            max_completion_tokens: 1024,
            top_p: 1,
            stream: false,
          };

          const response = await axios.post(
            GROQLINK,
            payload,
            {
              headers: {
                Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
                "Content-Type": "application/json",
              },
            }
          );

          const answer = response.data.choices[0]?.message?.content;
          setTimeout(() => {
            setProcessing(false);
          }, 3000);
          setOutput(answer || "No response received.");
        };
      } else {
        // Text-only path
        const payload = {
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: query },
              ],
            },
          ],
          temperature: 1,
          max_completion_tokens: 1024,
          top_p: 1,
          stream: false,
        };

        const response = await axios.post(
          GROQLINK,
          payload,
          {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );

        const answer = response.data.choices[0]?.message?.content;
        setTimeout(() => {
          setProcessing(false);
        }, 3000);
        setOutput(answer || "No response received.");
      }
    } catch (err) {
      setOutput("Model failed: " + err.message);
      setProcessing(false); // End processing on error
    }
  };

return (
  <div className="min-h-screen flex flex-col items-center justify-start p-6 bg-gray-100">
    <Toaster />

    {/* Heading */}
    <h1 className="text-4xl sm:text-5xl font-bold text-center text-gray-900 mb-10">
      StillMind
    </h1>

    {/* Top Section */}
    <div className="flex flex-col md:flex-row w-full gap-6 mb-10 max-w-5xl">
      {/* Image Upload */}
      <div className="bg-white w-full md:w-1/2 p-6 rounded-2xl shadow-md flex flex-col items-center justify-center">
        {isShowing && (
          <img
            src={ImageURL}
            alt="Preview"
            className="rounded-xl max-h-64 mb-4"
          />
        )}

        <div className="w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                {ImageURL ? ImageFile.name : 'JPG, PNG, or PDF (MAX. 10MB)'}
              </p>
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={setFile}
            />
          </label>
          
          {ImageURL && (
            <div className="mt-2 flex items-center justify-between bg-blue-50 p-2 rounded-md">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
                <span className="text-sm text-gray-700">{ImageFile.name}</span>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setIsShowing(!isShowing)}
                  className="p-1 text-gray-500 hover:text-blue-600"
                  title={isShowing ? 'Hide preview' : 'Preview'}
                >
                  {isShowing ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  )}
                </button>
                <button 
                  onClick={closeDown}
                  className="p-1 text-gray-500 hover:text-red-600"
                  title="Remove file"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {isShowing && (
          <button
            onClick={closeDown}
            className="mt-2 px-6 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium"
          >
            Cancel Image
          </button>
        )}
      </div>

      {/* Query Input */}
      <div className="bg-white w-full md:w-1/2 p-6 rounded-2xl shadow-md flex flex-col justify-between">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type your health query here..."
          className="w-full h-56 p-4 rounded-lg border border-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-black"
        />
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleSubmit}
            className="flex-1 px-6 py-3 rounded-lg bg-black text-white font-semibold hover:bg-gray-800 transition-all duration-300"
          >
            Submit
          </button>
          <button
            onClick={() => window.location.href = '/mood-detector'}
            className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all duration-300 whitespace-nowrap"
            title="Detect your mood first for personalized advice"
          >
            😊 Detect My Mood
          </button>
        </div>
      </div>
    </div>

    {/* Output Section */}
    <div className="w-full max-w-5xl bg-white rounded-2xl shadow-md p-6 md:p-10 min-h-[200px]">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">
        Remedial & Suggestions
      </h2>
      <p className="whitespace-pre-wrap text-gray-700">{output}</p>
    </div>
  </div>
);

};

export default AIHealthAssistant;
