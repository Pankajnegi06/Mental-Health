
import React, { useEffect } from "react";
import { FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";
import aditya from '../assets/aditya.jpg';
// import { useAppContext } from "../Context/AppContext";
import { Navigate, useNavigate } from "react-router-dom";

const developers = [
  {
    name: "Aditya Kumar",
    role: "Full-Stack Developer",
    image: aditya,
    github: "https://github.com/aditya-kumar-patraan1",
    linkedin: "https://www.linkedin.com/in/aditya-kumar--?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
    instagram: "https://instagram.com/adityakr_rajput",
    about: "1900+ rated (Knight) on LeetCode and a Full Stack Developer. Skilled in building scalable web applications and real-time systems.",
    contributions: [
      "Completed full Frontend & Backend",
      "Developed Meeting system using WebRTC",
      "Built Chat System using Socket.IO",
      "Created AI Doctor functionality",
      "Integrated Nearby Hospital Locator",
      "Designed and implemented the Dashboard",
    ],
    bgColor: "#CCF381"
  }
];


const Developer = ({isLightMode}) => {

//   const {userData} = useAppContext();
  const Navigate = useNavigate();

//   useEffect(()=>{
    // console.log("But in Developer page");
    // console.log(userData);
//   },[userData]);
  
  return (
    <div className={`bg-gradient-to-br from-sky-700 via-blue-800 to-gray-900 py-9 lg:py-20 px-7 h-screen md:h-fit lg:h-fit  lg:px-10 flex flex-col items-center justify-center`}>
      <h1 className={`text-3xl lg:text-5xl font-extrabold text-center ${isLightMode ? "text-gray-800" : "text-white"} mb-16 lg:mb-12`}>
        Meet the Developer
      </h1>

      <div className=" gap-10 mx-auto">
        {developers.map((dev, index) => (
          <div
            key={index}
            className={`bg-[${dev.bgColor}] border-2 ${isLightMode?"shadow-slate-200":"border-gray-100"} rounded-3xl p-8 flex flex-col items-center text-center`}
            >
            <img
              src={dev.image}
              alt={dev.name}
              className={`lg:w-40 h-24 lg:h-40 object-cover rounded-full border-2 lg:border-4 ${isLightMode?"border-gray-200":"border-white"} shadow-md mb-4`}
            />
            <h2 className={`text-1xl lg:text-2xl font-bold ${isLightMode?"text-white":"text-white"}`}>{dev.name}</h2>
            <p className="text-white text-sm">{dev.role}</p>

            <div className="flex space-x-4 mt-4 text-xl text-white">
              <button onClick={() => window.open(dev.github, "_blank")}  type="button">
                <FaGithub className={`${isLightMode?"hover:text-gray-800":"hover:text-white"}`} />
              </button>
              <button onClick={() => window.open(dev.linkedin, "_blank")}  type="button">
                <FaLinkedin className="hover:text-blue-600" />
              </button>
              <button onClick={() => window.open(dev.instagram, "_blank")} type="button">
                <FaInstagram className="hover:text-pink-500" />
              </button>
            </div>

            <div className="mt-6 text-left w-full">
              <h3 className={`text-sm lg:text-xl font-semibold ${isLightMode?"text-gray-800":"text-white"} mb-2`}>
                About
              </h3>
              <p className={`${isLightMode?"text-gray-800":"text-white"} text-sm`}>{dev.about}</p>

              <h3 className={`text-sm lg:text-xl ${isLightMode?"text-gray-800":"text-white"} font-semibold text-gray-800 mt-4 mb-2`}>
                Contributions
              </h3>
              <ul className={`list-disc pl-3 lg:pl-5 ${isLightMode?"text-gray-800":"text-white"} text-sm lg:text-sm-1`}>
                {dev.contributions.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>

              
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Developer;