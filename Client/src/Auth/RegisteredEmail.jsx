import axios from "axios";
import React, { useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { FiMail } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const RegisteredEmail = ({ isLightMode, setisLightMode }) => {
  const Navigate = useNavigate();
  const [email, setEmail] = useState("");
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  function sentToBackend() {
    axios
      .post(`${BACKEND_URL}/api/auth/verifyOTPforPasswordReset/`,{email})
      .then(() => {
        // console.log(`Email sent to Backend to send OTP for reset Password`);
        toast.success("Email submitted. Please check your inbox.");
        localStorage.setItem("registeredEmail", email);
        Navigate("/otp-verification");
      })
      .catch((e) => {
        // console.log(`Email was not sent to backend.`);
        toast.error("Something went wrong. Please try again.");
      });
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || email === "") {
      toast.error("Please enter your registered email");
      return;
    }

    sentToBackend();
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8  bg-gradient-to-br from-sky-700 via-blue-800 to-gray-900
      }`}
    >
      <div
        className={`w-full  bg-gradient-to-br from-sky-700 via-blue-800 to-gray-900 max-w-md sm:max-w-lg md:max-w-xl rounded-xl shadow-xl p-6 sm:p-8 md:p-10 }`}
      >
        <h2
          className={`text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6 text-white
          }`}
        >
          Enter Registered Email
        </h2>
        <p
          className={`text-sm sm:text-base text-center mb-6 text-yellow-300
          }`}
        >
          Please enter the email you used during registration.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input with Icon */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiMail
                className={`text-lg sm:text-xl text-yellow-300
                }`}
              />
            </div>
            <input
              type="email"
              placeholder="Registered Email Address"
              className={`pl-12 pr-4 py-3 w-full rounded-lg border bg-transparent focus:outline-none focus:ring-2 border-yellow-300 focus:ring-yellow-300 text-yellow-300
              }`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-3 rounded-lg font-semibold transition text-white bg-yellow-300 hover:bg-yellow-400 cursor-pointer`}
          >
            Submit Email
          </button>
        </form>

        <Toaster />
      </div>
    </div>
  );
};

export default RegisteredEmail;
