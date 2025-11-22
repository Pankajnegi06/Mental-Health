import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useAppContext } from "../Context/AppContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const VerifyEmail = ({ isLightMode }) => {
  const [otp, setOtp] = useState("");
  const { BACKEND_URL } = useAppContext();
  const Navigate = useNavigate();

  const submitOTP = async () => {
    await axios
      .post(`${BACKEND_URL}/api/auth/verifyEmail`, { otp }, { withCredentials: true })
      .then((res) => {
        toast.success("Verification Done Successfully..");
        Navigate("/");
      })
      .catch((e) => {
        toast.error("OTP is Incorrect!");
      });
  };

  useEffect(() => {
    axios
      .post(`${BACKEND_URL}/api/auth/sendVerifyOTP`, {}, { withCredentials: true })
      .then(() => {
        toast.success("OTP sent to your Email");
      })
      .catch(() => {
        toast.error("Internal Error in sending OTP");
      });
  }, []);

  return (
    <>
      <Toaster />
      <div className={`w-screen h-screen flex items-center justify-center px-4 bg-gradient-to-br from-sky-700 via-blue-800 to-gray-900`}>
        <div className={`w-full max-w-md rounded-2xl p-8 border shadow-lg flex flex-col items-center gap-6 
          bg-gradient-to-br from-sky-700 via-blue-800 to-gray-900`}>
          
          <h2 className={`text-2xl lg:text-3xl font-bold text-center ${isLightMode ? "text-gray-800" : "text-white"}`}>
            Verify Your Email
          </h2>

          <p className={`text-sm text-center ${isLightMode ? "text-gray-600" : "text-gray-300"}`}>
            Please enter the OTP sent to your email address.
          </p>

          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className={`w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 
                border-gray-300 text-white focus:ring-blue-500`}
          />

          <button
            onClick={submitOTP}
            className={`w-full text-white font-medium py-2 rounded-md transition active:scale-95 
            bg-blue-600 hover:bg-blue-700`}>
            Verify OTP
          </button>
        </div>
      </div>
    </>
  );
};

export default VerifyEmail;