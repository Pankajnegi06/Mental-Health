import React, { useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { FiLock } from 'react-icons/fi';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const ResetPassword = () => {  
  const location = useLocation();
  const email = location.state?.email || localStorage.getItem("registeredEmail");
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const Navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;


  const handleReset = (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error('Please fill in both fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const myData = {
      email,
      password
    }

    axios.put(`${BACKEND_URL}/api/auth/resetPassword`, myData).then(() => {
      // console.log("Data sent to backend");
    }).catch((e) => {
      // console.log("Data not sent to Backend");
    });
    
    setPassword('');
    setConfirmPassword('');
    Navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-700 via-blue-800 to-gray-900 flex items-center justify-center px-4">
      <div className="rounded-xl bg-gradient-to-br from-sky-700 via-blue-800 to-gray-900 shadow-xl p-10 w-full max-w-lg">
        <h2 className="text-2xl lg:text-3xl font-bold mb-6 text-center text-white">
          Reset Your Password
        </h2>

        <form onSubmit={handleReset} className="space-y-6">
          {/* New Password */}
          <div>
            <label className="text-center lg:text-start block text-white font-medium mb-2">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-yellow-400">
                <FiLock className="text-lg" />
              </div>
              <input
                type="password"
                placeholder="Enter new password"
                className="w-full pl-10 pr-4 py-3 border border-yellow-600 rounded-lg bg-transparent text-yellow-200 placeholder-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="text-center lg:text-start block text-white font-medium mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-yellow-400">
                <FiLock className="text-lg" />
              </div>
              <input
                type="password"
                placeholder="Confirm new password"
                className="w-full pl-10 pr-4 py-3 border border-yellow-600 rounded-lg bg-transparent text-yellow-200 placeholder-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full cursor-pointer bg-yellow-400 hover:bg-yellow-500 text-white hover:text-white py-3 rounded-lg font-semibold transition"
          >
            Reset Password
          </button>
        </form>

        <Toaster />
      </div>
    </div>
  );
};

export default ResetPassword;
