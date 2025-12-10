import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaClipboardCheck, FaChartLine, FaLock, FaHeart, FaBrain, FaShieldAlt } from "react-icons/fa";

const QuestionnaireLanding = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: FaClipboardCheck,
      title: "Comprehensive Assessment",
      description: "Complete PHQ-9, GAD-7, PSS-10, and DASS-21 assessments",
      color: "from-purple-500 to-blue-500",
    },
    {
      icon: FaChartLine,
      title: "Track Your Progress",
      description: "Monitor your mental health journey over time",
      color: "from-blue-500 to-teal-500",
    },
    {
      icon: FaLock,
      title: "Secure & Private",
      description: "Your data is encrypted and kept confidential",
      color: "from-teal-500 to-green-500",
    },
    {
      icon: FaHeart,
      title: "Personalized Insights",
      description: "Get detailed analysis and recommendations",
      color: "from-pink-500 to-rose-500",
    },
  ];

  const benefits = [
    {
      icon: FaBrain,
      text: "Understand your mental health status",
    },
    {
      icon: FaShieldAlt,
      text: "Access professional resources",
    },
    {
      icon: FaChartLine,
      text: "Track improvements over time",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-teal-600/10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="inline-block mb-6"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-500 rounded-3xl flex items-center justify-center shadow-2xl">
                <FaClipboardCheck className="text-4xl text-white" />
              </div>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 bg-clip-text text-transparent">
                Mental Health
              </span>
              <br />
              <span className="text-gray-800">Assessment</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Take a comprehensive mental health assessment to understand your well-being
              and get personalized insights
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/MentalHealthQuestionnaire")}
              className="px-10 py-4 rounded-xl text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 transition-all duration-300 font-semibold text-lg shadow-2xl mb-12"
            >
              Start Assessment
            </motion.button>

            <p className="text-sm text-gray-500">
              No login required to start • Sign in to save and track your progress
            </p>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
          What You'll Get
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-4`}>
                <feature.icon className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-white/50 backdrop-blur-sm py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
            Why Take This Assessment?
          </h2>
          
          <div className="space-y-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 bg-white rounded-xl p-6 shadow-md"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="text-xl text-white" />
                </div>
                <p className="text-lg text-gray-700">{benefit.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Assessment Mode Selection */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Choose Your Assessment
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the assessment that fits your time and needs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Quick Assessment */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-purple-200 flex flex-col h-full"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6">
              <FaClipboardCheck className="text-3xl text-white" />
            </div>
            
            <h3 className="text-3xl font-bold text-gray-800 mb-3">Quick Assessment</h3>
            <p className="text-lg text-gray-600 mb-6">Perfect when you're short on time</p>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <p className="text-gray-700"><span className="font-semibold">16 questions</span> • ~5 minutes</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <p className="text-gray-700">Depression & Anxiety screening</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <p className="text-gray-700">AI-powered recommendations</p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/MentalHealthQuestionnaire", { state: { mode: "quick" } })}
              className="w-full px-8 py-4 rounded-xl text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 transition-all duration-300 font-semibold text-lg shadow-lg mt-auto"
            >
              Start Quick Assessment
            </motion.button>
          </motion.div>

          {/* Detailed Assessment */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-gradient-to-br from-purple-600 to-blue-500 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-purple-400 relative overflow-hidden flex flex-col h-full"
          >
            <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold">
              Recommended
            </div>
            
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
              <FaChartLine className="text-3xl text-white" />
            </div>
            
            <h3 className="text-3xl font-bold text-white mb-3">Detailed Assessment</h3>
            <p className="text-lg text-white/90 mb-6">Comprehensive mental health evaluation</p>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <p className="text-white"><span className="font-semibold">47 questions</span> • ~15 minutes</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <p className="text-white">Depression, Anxiety & Stress analysis</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <p className="text-white">Comprehensive AI-powered report</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <p className="text-white">Detailed coping strategies</p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/MentalHealthQuestionnaire", { state: { mode: "detailed" } })}
              className="w-full px-8 py-4 rounded-xl text-purple-600 bg-white hover:bg-gray-50 transition-all duration-300 font-semibold text-lg shadow-lg mt-auto"
            >
              Start Detailed Assessment
            </motion.button>
          </motion.div>
        </div>

        <p className="text-center text-gray-500 mt-8">
          No login required to start • Sign in to save and track your progress
        </p>
      </div>
    </div>
  );
};

export default QuestionnaireLanding;
