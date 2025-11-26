import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../Context/AppContext";
import axios from "axios";
import { useEffect } from "react";

const Profile = ({ name }) => {
  const { BACKEND_URL, setIsLoggedIn, setUserData, getUserData, userData } = useAppContext();
  const [showOptions, setShowOptions] = useState(false);
  const navigate = useNavigate();

  const logOutUser = async () => {
    try {
      // Call backend logout endpoint
      await axios.post(`${BACKEND_URL}/api/auth/logout`, {}, { withCredentials: true });
      
      // Clear all local storage
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.clear();
      
      // Update app state
      setIsLoggedIn(false);
      setUserData(null);
      
      // Navigate to home
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
      // Even if backend fails, clear local data
      localStorage.clear();
      setIsLoggedIn(false);
      setUserData(null);
      navigate("/");
    }
  };

  useEffect(()=>{
    // console.log("grf");
    getUserData();
  },[]);

  return (
    <div className="relative inline-block">
      <div
        className="rounded-full bg-white text-blue-900 h-12 w-12 font-bold shadow-md flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-yellow-300 transition-all duration-200 overflow-hidden"
        onClick={() => setShowOptions(!showOptions)}
      >
        {userData?.profileImage ? (
          <img
            src={userData.profileImage}
            alt={name || "Profile"}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <span>{name?.[0]?.toUpperCase() || "A"}</span>
        )}
      </div>

      {showOptions && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 shadow-lg rounded-md z-50">
          <ul>
            
            <li
              className="px-4 py-2 text-black hover:bg-yellow-200 cursor-pointer"
              onClick={() => {
                setShowOptions(false);
                navigate("/dashboard");
              }}
            >
              Dashboard
            </li>
            <li
              className="px-4 py-2 text-black hover:bg-yellow-200 cursor-pointer"
              onClick={() => {
                setShowOptions(false);
                navigate("/mood-journal");
              }}
            >
              Mood Journal
            </li>
            <li
              className="px-4 py-2 text-black hover:bg-yellow-200 cursor-pointer"
              onClick={() => {
                setShowOptions(false);
                navigate("/mental-health");
              }}
            >
              Overall Tracking
            </li>
            <li
              className="px-4 py-2 text-black hover:bg-yellow-200 cursor-pointer"
              onClick={() => {
                setShowOptions(false);
                logOutUser();
              }}
            >
              Logout
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Profile;
