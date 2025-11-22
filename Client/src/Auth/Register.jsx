import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { FiUser, FiMail, FiLock } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppContext } from "../Context/AppContext";

const Register = () => {
  const Navigate = useNavigate();
  const location = useLocation();
  const { BACKEND_URL, setIsLoggedIn, isLoggedIn, userData, getUserData } = useAppContext();
  const [formData, setFormdata] = useState({
    name: "",
    email: "",
    password: "",
  });

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const myData = await axios.post(`${BACKEND_URL}/api/auth/register`, formData, {
        withCredentials: true,
      });

      setFormdata({ name: "", email: "", password: "" });
      
      if (myData.data.status === 1) {
        toast.success("Registered Successfully...");
        // Store token
        if (myData.data.token) {
          localStorage.setItem("token", myData.data.token);
        }
        setIsLoggedIn(true);
        
        try {
          await getUserData();
        } catch (error) {
          console.error("Error fetching user data:", error);
          // Continue even if getUserData fails
        }
        
        // Check if redirected from questionnaire
        if (location.state?.fromQuestionnaire) {
          // Redirect to Dashboard to view detailed reports
          Navigate("/Dashboard");
        } else {
          Navigate("/home");
        }
      } else {
        // Show detailed backend error if present
        if (myData.data.message) {
          toast.error(myData.data.message);
        } else if (myData.data['error-message']) {
          toast.error(myData.data['error-message']);
        } else {
          toast.error("Registration not done...");
        }
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("Registration error:", error);
      // Only show error if registration actually failed
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.['error-message']) {
        toast.error(error.response.data['error-message']);
      } else {
        toast.error("Something went wrong during registration...");
      }
      setIsLoggedIn(false);
    }
  }

  function handleChange(e) {
    setFormdata({ ...formData, [e.target.name]: e.target.value });
  }

  function showToaster() {
    if (!formData.email || !formData.password || !formData.name) {
      toast.error(`Please fill all details.`);
    }
  }

  useEffect(() => {}, [formData]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-10 bg-gray-50">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl rounded-xl shadow-lg p-6 sm:p-8 md:p-10 bg-white">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-center mb-6 sm:mb-8 text-gray-900">
          Create Your Account
        </h2>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2 text-gray-700">
              Name
            </label>
            <div className="relative">
              <FiUser className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500" />
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-700">
              Email
            </label>
            <div className="relative">
              <FiMail className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500" />
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2 text-gray-700">
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500" />
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            <button
              type="submit"
              onClick={showToaster}
              className="w-full sm:w-auto px-6 py-3 rounded-lg font-medium text-white bg-gray-900 hover:bg-gray-800 transition cursor-pointer"
            >
              Register
            </button>

            <button
              type="button"
              className="text-sm text-gray-600 hover:underline cursor-pointer"
              onClick={() => Navigate("/login")}
            >
              Already have an account?
            </button>
          </div>
        </form>

        <Toaster />
      </div>
    </div>
  );
};

export default Register;
