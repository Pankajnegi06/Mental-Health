import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useAppContext } from "../Context/AppContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const VerifyEmail = ({ isLightMode }) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { BACKEND_URL } = useAppContext();
  const Navigate = useNavigate();

  const submitOTP = async () => {
    if (!otp || otp.trim().length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/auth/verifyEmail`,
        { otp: otp.trim() },
        { withCredentials: true }
      );

      if (response.data.status === 1) {
        toast.success("Email verified successfully! 🎉");
        setTimeout(() => {
          Navigate("/");
        }, 1500);
      } else {
        toast.error(response.data.message || "Verification failed");
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error(error.response?.data?.message || "OTP is incorrect or expired!");
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setResending(true);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/auth/sendVerifyOTP`,
        {},
        { withCredentials: true }
      );

      if (response.data.status === 1) {
        toast.success("New OTP sent to your email! 📧");
        setOtp(""); // Clear the input
      } else {
        toast.error(response.data.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setResending(false);
    }
  };

  useEffect(() => {
    const sendInitialOTP = async () => {
      try {
        const response = await axios.post(
          `${BACKEND_URL}/api/auth/sendVerifyOTP`,
          {},
          { withCredentials: true }
        );

        if (response.data.status === 1) {
          toast.success("OTP sent to your email! 📧");
        } else {
          toast.error(response.data.message || "Failed to send OTP");
        }
      } catch (error) {
        console.error("Send OTP error:", error);
        toast.error(error.response?.data?.message || "Failed to send OTP. Please try again.");
      }
    };

    sendInitialOTP();
  }, [BACKEND_URL]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      submitOTP();
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className={`w-screen h-screen flex items-center justify-center px-4 bg-gradient-to-br from-sky-700 via-blue-800 to-gray-900`}>
        <div className={`w-full max-w-md rounded-2xl p-8 border shadow-lg flex flex-col items-center gap-6 
          bg-gradient-to-br from-sky-700 via-blue-800 to-gray-900`}>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
              Verify Your Email
            </h2>
            <p className="text-sm text-gray-300">
              We've sent a 6-digit OTP to your email address
            </p>
          </div>

          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 6);
              setOtp(value);
            }}
            onKeyPress={handleKeyPress}
            maxLength={6}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest font-bold"
            disabled={loading}
          />

          <button
            onClick={submitOTP}
            disabled={loading || otp.length !== 6}
            className="w-full text-white font-medium py-3 rounded-lg transition active:scale-95 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </>
            ) : (
              "Verify OTP"
            )}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-300 mb-2">
              Didn't receive the code?
            </p>
            <button
              onClick={resendOTP}
              disabled={resending}
              className="text-white font-medium underline hover:text-blue-300 transition disabled:opacity-50"
            >
              {resending ? "Sending..." : "Resend OTP"}
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center">
            OTP is valid for 24 hours
          </p>
        </div>
      </div>
    </>
  );
};

export default VerifyEmail;