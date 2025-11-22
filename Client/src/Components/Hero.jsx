import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUserMd, FaHeartbeat, FaStethoscope } from "react-icons/fa";
import { useAppContext } from "../Context/AppContext";
import { toast, Toaster } from "react-hot-toast";

const Hero = () => {
  const navigate = useNavigate();
  const { userData } = useAppContext();

  return (
    <>
      <Toaster />
      <div className="w-full bg-gradient-to-br from-sky-700 h-fit via-blue-800 to-gray-900 flex justify-center px-4 py-28">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center text-white max-full h-fit  space-y-8 "
        >
          {/* Responsive Icons */}
          <div className="flex justify-center gap-11 text-5xl sm:text-6xl md:text-7xl text-yellow-300">
            <FaUserMd className="animate-pulse" />
            <FaHeartbeat className="animate-bounce" />
            <FaStethoscope className="animate-pulse" />
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight">
            Welcome to <span className="text-yellow-400">Dr. IntelliCare</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl md:text-2xl font-light text-slate-200 px-4">
            Your Personal AI Medical Doctor — Available 24/7 for Consultations,
            Appointments & Assistance.
          </p>

          {/* Button */}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              !userData
                ? toast.error("Login/Register to access the tools")
                : !userData.isAccountVerified
                ? toast.error("Verify Account to access the tools")
                : navigate("/Dashboard")
            }
            className="mt-2 bg-yellow-400  text-blue-900 font-semibold px-6 py-3 rounded-full shadow-md transition hover:border border-yellow-500 hover:bg-transparent hover:text-yellow-500"
          >
            Check your Appointments
          </motion.button>
        </motion.div>
      </div>
    </>
  );
};

export default Hero;
