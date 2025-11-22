import React from "react";
import toast, { Toaster } from "react-hot-toast";
import { IoOpenOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../Context/AppContext";

const LocationFeature = () => {
  const navigate = useNavigate();
  const {userData} = useAppContext();

  return (
    <>
    <Toaster/>
    <div className="bg-gradient-to-bl from-gray-900 via-blue-800 to-sky-700 w-full px-4 sm:px-6 md:px-10 lg:px-16 py-16 sm:py-20 flex justify-center items-center overflow-x-hidden">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-7xl p-6 sm:p-8 md:p-14 flex flex-col md:flex-row items-center gap-8 sm:gap-10">
        
        {/* Left Side Content */}
        <div className="flex flex-col gap-6 sm:gap-8 w-full md:w-1/2">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white leading-snug text-left">
            Tired of Searching for Nearby Clinics or Hospitals?
          </h2>
          <p className="text-base sm:text-lg md:text-xl font-light text-white text-left">
            No more endless scrolling or confusing maps. With{" "}
            <span className="font-semibold text-yellow-300">IntelliLocate</span>, Dr.
            IntelliCare’s smart location tool, you can instantly find the
            nearest clinics and hospitals around you — fast, reliable, and
            AI-powered. Whether you're at home or traveling, IntelliLocate helps
            you connect to trusted healthcare providers in seconds. Just one
            click, and you're on your way to better care.
          </p>
          <div className="flex justify-center lg:justify-start md:justify-start">
            <button
            onClick={() => !userData
              ? toast.error("Login/Register to access the tools")
              : (!userData.isAccountVerified
              ? toast.error("Verify Account to access the tools")
              : navigate("/LocationTracker"))}
            className="items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-semibold px-6 py-3 rounded-full shadow-md cursor-pointer transition duration-300 w-fit flex justify-center md:justify-start"
          >
            <p>Use IntelliLocate</p>
            <IoOpenOutline />
          </button>
          </div>
        </div>

        {/* Right Side Image */}
        <div className="w-full md:w-1/2 flex justify-center">
          <img
            src="https://th.bing.com/th/id/OIP.IKCIkLAEpKIHplq6IuyJJQHaGA?rs=1&pid=ImgDetMain"
            alt="Location Finder Illustration"
            className="rounded-xl shadow-lg w-full max-w-xs sm:max-w-sm md:max-w-md object-cover"
          />
        </div>
      </div>
    </div></>
  );
};

export default LocationFeature;
