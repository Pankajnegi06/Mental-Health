const express = require('express');
const { login, register, logout, sendVerifyOTP, verifyEmail, verifyOTPforPasswordReset, CheckverifyOTPforPasswordReset, resetPassword, isAuthenticated } = require('../Controllers/myControllers');
const userAuth = require('../Middleware/userAuth');
const myRouter = express.Router();

// Login route
myRouter.post("/login", login);

// Register route
myRouter.post("/register", register);
myRouter.post("/logout", (req, res) => {
    // Clear the token cookie
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });
    
    // Call the original logout function
    logout(req, res);
});
myRouter.post("/sendVerifyOTP", userAuth, sendVerifyOTP);
myRouter.post("/verifyEmail", userAuth, verifyEmail);
myRouter.get("/isAuthenticated", userAuth, isAuthenticated);
myRouter.post("/verifyOTPforPasswordReset", verifyOTPforPasswordReset);
myRouter.post("/CheckverifyOTPforPasswordReset", CheckverifyOTPforPasswordReset);
myRouter.put("/resetPassword", resetPassword);

module.exports = myRouter;