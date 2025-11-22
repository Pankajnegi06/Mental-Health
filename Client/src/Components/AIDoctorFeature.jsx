import React from "react";
import { IoOpenOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../Context/AppContext";
import toast, { Toaster } from "react-hot-toast";

const AIDoctorFeature = () => {
  const navigate = useNavigate();
  const {userData} = useAppContext();

  return (
    <>
    <Toaster/>
    <div className="bg-gradient-to-br from-sky-700 via-blue-800 to-gray-900 px-4 sm:px-6 md:px-10 lg:px-16 py-16 sm:py-20 w-full flex justify-center items-center overflow-x-hidden">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-7xl flex flex-col md:flex-row items-center gap-10 md:gap-20 p-6 sm:p-8 md:p-16">
        
        {/* Left Content */}
        <div className="flex flex-col gap-6 w-full md:w-1/2">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-white leading-tight text-left">
            Need Instant Medical Help or Advice?
          </h2>

          <p className="text-white text-sm sm:text-base md:text-lg font-light text-left leading-relaxed">
            Say hello to{" "}
            <span className="font-semibold text-yellow-300">IntelliAid</span>, your
            24×7 intelligent health assistant powered by Dr. IntelliCare. Whether you're
            unsure about symptoms, need quick remedies, or just want a second opinion —
            IntelliAid is here to help.
            <br />
            <br />
            You can even upload images of your health concerns and get real-time,
            AI-powered medical suggestions from our expert-trained system. No queues, no
            delays — just smart, accessible care wherever you are.
          </p>

          {/* Button (responsive aligned) */}
          <div className="flex justify-center md:justify-start">
            <button
              onClick={() => {
                if (!userData) {
                  toast.error("Login/Register to access the tools");
                } else {
                  // Allow access even without verification
                  navigate("/AIHealthAssistant");
                }
              }}
              className="mt-2 bg-yellow-400 hover:bg-yellow-500 cursor-pointer text-blue-900 font-semibold px-6 py-3 rounded-full shadow-lg flex items-center gap-2 w-fit transition duration-300"
            >
              <span>Use IntelliAid</span>
              <IoOpenOutline className="text-xl" />
            </button>
          </div>
        </div>

        {/* Right Image */}
        <div className="w-full md:w-1/2 flex justify-center items-center">
          <img
            src="https://cff2.earth.com/uploads/2023/12/15181453/AI_doctor-assistance_research_diagnosis_1medium.jpg"
            alt="AI Doctor"
            className="rounded-2xl shadow-lg w-full max-w-xs sm:max-w-sm md:max-w-md object-cover"
          />
        </div>
      </div>
    </div>
    </>
  );
};

export default AIDoctorFeature;