import React, { useState } from "react";
import ProfileSection from "./ProfileSection";
import AppointmentTabel from "./AppointmentTabel";
import RecordSection from "./RecordSection";
import "../App.css";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("Profile");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false); // Auto close sidebar on mobile
  };

  return (
    <div className="flex h-screen bg-white text-white relative">
      {/* Hamburger Icon for Mobile (only when sidebar is closed) */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className={`sm:hidden fixed top-4 left-4 z-50 p-2 text-blue-900 bg-white rounded-md shadow-md transition-opacity duration-200 ${
          isSidebarOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        ☰
      </button>

      {/* Sidebar */}
      <div
        className={`fixed sm:static top-0 left-0 z-40 h-full w-64 bg-blue-950 text-white p-6 flex flex-col gap-6 shadow-2xl border-r border-blue-800 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
        }`}
      >
        {/* Cross Icon for Mobile (only when sidebar is open) */}
        <button
          onClick={() => setIsSidebarOpen(false)}
          className={`sm:hidden absolute top-4 right-4 text-white text-xl transition-opacity duration-200 ${
            isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          ✖
        </button>

        <h2 className="text-2xl font-bold text-center mb-6 tracking-wide mt-8 sm:mt-0">
          Dashboard
        </h2>

        <button
          className={`text-left cursor-pointer font-medium px-4 py-2 rounded-lg transition-all duration-200 ${
            activeTab === "Profile" ? "bg-blue-700 shadow-md" : "hover:bg-blue-800"
          }`}
          onClick={() => handleTabClick("Profile")}
        >
          👤 Profile
        </button>

        <button
          className={`text-left cursor-pointer font-medium px-4 py-2 rounded-lg transition-all duration-200 ${
            activeTab === "Health Records" ? "bg-blue-700 shadow-md" : "hover:bg-blue-800"
          }`}
          onClick={() => handleTabClick("Health Records")}
        >
          📂 Health Records
        </button>

        <button
          className={`text-left cursor-pointer font-medium px-4 py-2 rounded-lg transition-all duration-200 ${
            activeTab === "Appointments" ? "bg-blue-700 shadow-md" : "hover:bg-blue-800"
          }`}
          onClick={() => handleTabClick("Wishlist")}
        >
          📅 Wishlist
        </button>

        <button
          className="text-left cursor-pointer font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:bg-blue-800 mt-4 border-t border-blue-700 pt-4"
          onClick={() => window.location.href = "/questionnaire"}
        >
          📋 Take Assessment
        </button>

        <button
          className="text-left cursor-pointer font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:bg-blue-800 mt-4 border-t border-blue-700 pt-4"
          onClick={() => window.location.href = "/mental-health"}
        >
          🧠 Mental Health
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto custom-scroll w-full flex flex-col justify-center sm:ml-0">
        <h1 className="text-3xl font-bold mb-4 text-gray-800 text-center">{activeTab}</h1>

        <div className="backdrop-blur-md bg-white/50 hide-scrollbar border border-white/30 text-gray-900 p-6 rounded-xl shadow-xl shadow-slate-200 min-h-[70vh] overflow-y-auto ">
          {activeTab === "Profile" && <ProfileSection />}
          {activeTab === "Health Records" && <RecordSection />}
          {activeTab === "Wishlist" && <AppointmentTabel />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
