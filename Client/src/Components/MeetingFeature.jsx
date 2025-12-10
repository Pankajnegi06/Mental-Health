import React from "react";
import { IoVideocamSharp, IoMicSharp, IoChatbubbleEllipsesSharp } from "react-icons/io5";
import { FaUserShield } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useAppContext } from "../Context/AppContext";

const MeetingFeature = () => {
  const navigate = useNavigate();
  const {userData} = useAppContext();

  return (
   <> 
   <Toaster/>
   <div className="bg-gradient-to-bl from-gray-900 via-blue-800 to-sky-700 w-full px-4 sm:px-6 md:px-10 lg:px-16 py-16 sm:py-20 flex justify-center items-center overflow-x-hidden">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-7xl flex flex-col md:flex-row items-center gap-10 md:gap-20 p-6 sm:p-8 md:p-16">
        
        {/* Left Content */}
        <div className="flex flex-col gap-6 w-full md:w-1/2">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-white leading-tight text-left">
            Virtual Health Meets Made Easy
          </h2>

          <p className="text-white text-sm sm:text-base md:text-lg font-light text-left leading-relaxed">
            Introducing <span className="text-yellow-300 font-semibold">IntelliConnect</span> – your secure virtual meeting room
            for doctor-patient communication.
            <br /><br />
            Instantly join private rooms with end-to-end privacy using a unique room key. Share concerns, voice symptoms, and
            even show visible signs using live <span className="text-blue-300 font-semibold">camera</span> support.
            <br /><br />
            Equipped with <span className="text-blue-300 font-semibold">microphone</span>, <span className="text-blue-300 font-semibold">chatbox</span>, and optional <span className="text-blue-300 font-semibold">image sharing</span>,
            IntelliConnect ensures your interaction is smooth, fast, and effective.
          </p>

          {/* Responsive Button Center */}
          <div className="flex justify-center md:justify-start">
            <button
              onClick={() => !userData
              ? toast.error("Login/Register to access the tools")
              : (!userData.isAccountVerified
              ? toast.error("Verify Account to access the tools")
              :  navigate("/lobby"))}
              className="mt-2 bg-yellow-400 hover:bg-yellow-500 cursor-pointer text-blue-900 font-semibold px-6 py-3 rounded-full shadow-lg flex items-center gap-2 w-fit transition duration-300"
            >
              <span>Start Secure Meeting</span>
              <IoVideocamSharp className="text-xl" />
            </button>
          </div>
        </div>

        {/* Right Image with Icons */}
        <div className="w-full md:w-1/2 flex justify-center items-center">
          <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md">
            <img
              src="https://img.freepik.com/premium-photo/doctor-conducting-virtual-consultation-with-patient_1280275-220182.jpg"
              alt="Virtual Meeting"
              className="rounded-2xl shadow-lg object-cover w-full"
            />

            {/* Icon overlays */}
            <div className="absolute top-3 left-3 bg-white/20 backdrop-blur p-2 rounded-full text-white">
              <IoMicSharp className="text-lg" />
            </div>
            <div className="absolute top-3 right-3 bg-white/20 backdrop-blur p-2 rounded-full text-white">
              <IoChatbubbleEllipsesSharp className="text-lg" />
            </div>
            <div className="absolute bottom-3 right-3 bg-white/20 backdrop-blur p-2 rounded-full text-white">
              <FaUserShield className="text-lg" />
            </div>
          </div>
        </div>
      </div>
    </div></>
  );
};

export default MeetingFeature;
