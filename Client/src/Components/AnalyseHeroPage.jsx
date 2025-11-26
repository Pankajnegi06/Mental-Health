import React from "react";
import { motion } from "framer-motion";
import heroImg from "../assets/blogtop2.png";
import { FaBrain, FaChartLine, FaSmile, FaHeart, FaLightbulb } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AnalyseHeroPage = () => {

  const Navigate=useNavigate();

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-[#F9FAFB] to-[#EEF2F6] flex flex-col md:flex-row items-center justify-between px-6 md:px-12 lg:px-20 py-8 overflow-hidden">
      
      {/* Left Section */}
      <motion.div 
        initial={{ opacity: 0, x: -40 }} 
        animate={{ opacity: 1, x: 0 }} 
        transition={{ duration: 0.7 }} 
        className="flex flex-col gap-5 text-center md:text-left w-full md:w-1/2"
      >
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 leading-snug">
          Analyse Your <span className="text-blue-600">Mood</span>
        </h1>
        <p className="text-gray-600 text-base lg:text-lg max-w-md mx-auto md:mx-0">
          Understand your emotional patterns better. Get insights, 
          track progress, and take steps towards a healthier mindset.
        </p>

        {/* Highlights */}
        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
          <div className="flex items-center gap-2 bg-white shadow-md px-3 py-2 rounded-lg">
            <FaBrain className="text-blue-600 text-lg" />
            <p className="text-sm font-medium text-gray-700">Deep Insights</p>
          </div>
          <div className="flex items-center gap-2 bg-white shadow-md px-3 py-2 rounded-lg">
            <FaChartLine className="text-green-600 text-lg" />
            <p className="text-sm font-medium text-gray-700">Track Progress</p>
          </div>
          <div className="flex items-center gap-2 bg-white shadow-md px-3 py-2 rounded-lg">
            <FaSmile className="text-yellow-500 text-lg" />
            <p className="text-sm font-medium text-gray-700">Boost Wellbeing</p>
          </div>
        </div>

        {/* Button */}
        <motion.button 
          className="text-white mx-auto bg-blue-600 transition-all duration-300 hover:bg-blue-700 active:scale-95 flex items-center rounded-2xl px-4  py-4 w-full "
          onClick={()=>window.open("/mental-health","__blank")}
        >
          Start Analysis
        </motion.button>
      </motion.div>

      {/* Right Section with Floating Icons */}
      <motion.div 
        initial={{ opacity: 0, x: 40 }} 
        animate={{ opacity: 1, x: 0 }} 
        transition={{ duration: 0.7, delay: 0.2 }} 
        className="relative w-full md:w-1/2 flex justify-center mt-8 md:mt-0"
      >
        {/* Floating Icons */}
        <motion.div 
          animate={{ y: [ -10, 10, -10 ] }} 
          transition={{ duration: 5, repeat: Infinity }} 
          className="absolute top-0 left-0 bg-white shadow-md p-2 rounded-full text-pink-500 text-xl"
        >
          <FaHeart  className="text-3xl"/>
        </motion.div>

        <motion.div 
          animate={{ y: [ 10, -10, 10 ] }} 
          transition={{ duration: 6, repeat: Infinity }} 
          className="absolute bottom-0 right-0 bg-white shadow-md p-2 rounded-full text-yellow-500 text-xl"
        >
          <FaLightbulb className="text-3xl"/>
        </motion.div>

        <img
          src={heroImg}
          alt="Mood Analysis"
          className="w-[85%] md:w-[75%] lg:w-[65%] rounded-xl shadow-xl object-cover relative z-10"
        />
      </motion.div>
    </div>
  );
};

export default AnalyseHeroPage;
