import React from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { IoLogoAngular } from "react-icons/io";
import { FaUserDoctor } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import "../App.css";
import "../index.css";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <div className="h-auto bg-gradient-to-bl from-gray-900 via-blue-800 to-sky-700 w-full px-4 sm:px-10 py-6">
      <div className="rounded-2xl bg-white/25 backdrop-blur-md p-7">
        {/* Logo + Social Icons in same row always */}
        <div className="flex items-center justify-between flex-wrap px-2">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <FaUserDoctor className="text-white text-xl sm:text-2xl" />
            <p className="text-white text-sm sm:text-base font-semibold">
              Dr. IntelliCare
            </p>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-4 mt-2 sm:mt-0">
            <FaGithub
              className="text-slate-200 hover:text-white text-xl cursor-pointer"
              onClick={() =>
                window.open(
                  "https://github.com/aditya-kumar-patraan1/",
                  "_blank",
                  "noopener,noreferrer"
                )
              }
            />
            <FaLinkedin
              className="text-slate-200 hover:text-white text-xl cursor-pointer"
              onClick={() =>
                window.open(
                  "https://www.linkedin.com/in/aditya-kumar--/",
                  "_blank",
                  "noopener,noreferrer"
                )
              }
            />
          </div>
        </div>
      </div>

      {/* Bottom Credits */}
      <div className="flex flex-col items-center gap-2 mt-4">
        <div className="flex items-center gap-2">
          <IoLogoAngular className="text-orange-600 text-lg" />
         
        </div>
        <p className="text-white text-center text-xs myhighlights">
          © 2025 Dr. IntelliCare, Inc. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Footer;
