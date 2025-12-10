import React, { useState } from "react";
import { FaUserDoctor } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";
import Buttons from "./Buttons";
import { useAppContext } from "../Context/AppContext";
import Profile from "./Profile";
import axios from "axios";

const Navbar = () => {
  const navigate = useNavigate();
  const { isLoggedIn, userData, setIsLoggedIn, setUserData, BACKEND_URL } = useAppContext();
  const [isMenuOpen, setMenuOpen] = useState(false);

  const menuItems = [
    { text: "Home", path: "/home" },
    { text: "AI Assistant", path: "/ai-health-assistant" },
    { text: "Dashboard", path: "/dashboard" },
    { text: "Mood Journal", path: "/mood-journal" },
    { text: "Mental Health", path: "/questionnaire" },
    { text: "Health Dashboard", path: "/mental-health" },
    { text: "About", path: "/about" },
    { text: "Contact", path: "/contact" },
  ];

  // For backward compatibility
  const routes = menuItems.reduce((acc, item) => {
    acc[item.text] = item.path;
    return acc;
  }, {});

  const changePage = (item) => {
    const path = typeof item === "string" ? routes[item] : item.path;
    navigate(path);
    setMenuOpen(false);
  };

  const logout = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/auth/logout`, {}, { withCredentials: true });
      setIsLoggedIn(false);
      setUserData(null);
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="bg-white w-full px-6 py-4 shadow-md flex justify-between items-center relative z-50">
      {/* Logo */}
      <div
        onClick={() => navigate("/home")}
        className="flex items-center gap-2 text-gray-800 cursor-pointer text-xl font-bold"
      >
        <span className="text-2xl">StillMind</span>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center justify-center gap-8">
        {menuItems.map((item) => (
          <a
            key={item.path}
            href={item.path}
            className="text-gray-600 hover:text-gray-900 font-medium text-sm cursor-pointer transition-colors duration-200 whitespace-nowrap"
          >
            {item.text}
          </a>
        ))}
      </div>

      {/* Desktop Profile or Buttons */}
      <div className="hidden md:flex">
        {isLoggedIn ? <Profile name={userData?.name} /> : <Buttons />}
      </div>

      {/* Mobile Menu Icon */}
      <div
        className="md:hidden text-gray-800 text-2xl cursor-pointer"
        onClick={() => setMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? <HiX /> : <HiMenu />}
      </div>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white text-gray-800 z-50 flex flex-col gap-2 px-6 py-4 shadow-xl md:hidden max-h-[90vh] overflow-y-auto border-t border-gray-200">
          {menuItems.map((item) => (
            <a
              key={item.path}
              href={item.path}
              className="hover:bg-gray-100 rounded-lg p-3 transition-colors cursor-pointer block"
            >
              <p className="text-left text-base font-medium">{item.text}</p>
            </a>
          ))}

          {/* Mobile Profile/Login Buttons */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            {isLoggedIn ? (
              <div className="flex flex-col items-center gap-4">
                <Profile name={userData?.name} />
                <button
                  onClick={logout}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium w-full max-w-xs"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Buttons />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
