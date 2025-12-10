import axios from "axios";
import React, { useState, useRef, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import { FiSend, FiImage, FiX, FiSmile } from "react-icons/fi";

const AIHealthAssistant = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your mental health assistant. How can I help you today? 😊",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [ImageURL, setImageURL] = useState(null);
  const [ImageFile, setImageFile] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const GROQLINK = import.meta.env.VITE_GROQ_LINK;

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const setFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imgURL = URL.createObjectURL(file);
      setImageFile(file);
      setImageURL(imgURL);
      toast.success("Image attached!");
    }
  };

  const removeImage = () => {
    setImageURL(null);
    setImageFile(null);
    toast.success("Image removed");
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !ImageFile) {
      toast.error("Please type a message or attach an image");
      return;
    }

    // Add user message to chat
    const userMessage = {
      role: "user",
      content: inputMessage,
      image: ImageURL,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      let payload;
      
      if (ImageFile) {
        const reader = new FileReader();
        reader.readAsDataURL(ImageFile);
        
        reader.onloadend = async () => {
          const base64Image = reader.result;

          payload = {
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: inputMessage || "Analyze this image" },
                  { type: "image_url", image_url: { url: base64Image } },
                ],
              },
            ],
            temperature: 0.8,
            max_completion_tokens: 1024,
            top_p: 1,
            stream: false,
          };

          const response = await axios.post(GROQLINK, payload, {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
              "Content-Type": "application/json",
            },
          });

          const answer = response.data.choices[0]?.message?.content || "No response received.";
          
          setMessages(prev => [...prev, {
            role: "assistant",
            content: answer,
            timestamp: new Date()
          }]);
          
          setIsTyping(false);
          removeImage();
        };
      } else {
        payload = {
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          messages: [
            {
              role: "user",
              content: [{ type: "text", text: inputMessage }],
            },
          ],
          temperature: 0.8,
          max_completion_tokens: 1024,
          top_p: 1,
          stream: false,
        };

        const response = await axios.post(GROQLINK, payload, {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
        });

        const answer = response.data.choices[0]?.message?.content || "No response received.";
        
        setMessages(prev => [...prev, {
          role: "assistant",
          content: answer,
          timestamp: new Date()
        }]);
        
        setIsTyping(false);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      }]);
      setIsTyping(false);
      toast.error("Failed to get response: " + err.message);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      role: "assistant",
      content: "Chat cleared! How can I help you? 😊",
      timestamp: new Date()
    }]);
    toast.success("Chat cleared");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <FiSmile className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">StillMind Assistant</h1>
              <p className="text-xs text-gray-500">Your mental health companion</p>
            </div>
          </div>
          <div className="flex gap-2">
           
            <button
              onClick={clearChat}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Clear Chat
            </button>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-800 shadow-md border border-gray-100'
                }`}
              >
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attached"
                    className="rounded-lg mb-2 max-h-48 object-cover"
                  />
                )}
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-indigo-200' : 'text-gray-400'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start animate-fadeIn">
              <div className="bg-white text-gray-800 shadow-md border border-gray-100 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          {/* Image Preview */}
          {ImageURL && (
            <div className="mb-3 relative inline-block">
              <img
                src={ImageURL}
                alt="Preview"
                className="h-20 rounded-lg border-2 border-indigo-200"
              />
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Input Box */}
          <div className="flex items-end gap-2">
            <label className="cursor-pointer p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              <FiImage className="w-5 h-5 text-gray-600" />
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={setFile}
              />
            </label>

            <div className="flex-1 bg-gray-100 rounded-lg px-4 py-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                className="w-full bg-transparent resize-none focus:outline-none text-gray-800 placeholder-gray-400"
                rows="1"
                style={{ maxHeight: '120px' }}
              />
            </div>

            <button
              onClick={handleSendMessage}
              disabled={isTyping}
              className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSend className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-2 text-center">
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AIHealthAssistant;
