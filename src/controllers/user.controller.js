

import User from "../models/user.model.js";
import twilio from "twilio";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { fileUpload } from "../utils/cloudinary.js";

dotenv.config();


const signup = async (req, res) => {
    try {
        const { username, name, email, password } = req.body;
        if (!username || !email || !password || !name) {
            return res.status(400).json({ error: "All fields are required." });
        }

        if (!email.includes("@")) {
            return res.status(400).json({ error: "Invalid email format." });
        }

        const emailExist = await User.findOne({ email });
        if (emailExist) {
            return res.status(400).json({ error: "Email already exists" });
        }

        const profilePath = req.file?.path;
        let profileUrl = "https://default-profile-image-url.com/user.svg"; 

        if (profilePath) {
            const uploadProfile = await fileUpload(profilePath);
            if (uploadProfile) {
                profileUrl = uploadProfile;
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            username,
            email,
            password: hashedPassword,
            profile: profileUrl,
        });

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.RefreshToken = refreshToken;
        await user.save();
        const options = {
            httpOnly : true,
            secure : true
          } 
        res.cookie("AccessToken", accessToken,options);

        res.cookie("RefreshToken", refreshToken,options);

        return res.status(201).json({
            message: "User has been successfully created",
            accessToken,
            refreshToken
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Cannot create user",
        });
    }
};

const profileUpdate = async (req, res) => {
    try {
      const profilePath = req.file?.path;
      if (!profilePath) {
        return res.status(400).json({ error: "No file uploaded" });
      }
  
      const uploadedUrl = await fileUpload(profilePath);
      if (!uploadedUrl) {
        return res.status(500).json({ error: "Failed to upload profile image" });
      }
      
      const update = await User.findByIdAndUpdate(
        req.user._id,
        { profile: uploadedUrl},
        { new: true }
      );
      
      if (!update) {
        return res.status(404).json({ error: "User not found" });
      }
  
      res.status(200).json({ message: "Profile updated successfully", profile: update.profile });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  };
  
  const Login = async (req, res) => {
    try {
      const { email, password } = req.body;
      
  
      if (!email || !password) {
        return res.status(400).json({ msg: "Provide all required fields" });
      }
  
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(400).json({ msg: "Email does not exist" });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "Please provide a correct password" });
      }
  
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();
      user.RefreshToken = refreshToken;
      await user.save();
  
      const options = {
        httpOnly: true,
        secure: true,
      };
  
      res.cookie("AccessToken", accessToken, options);
      res.cookie("RefreshToken", refreshToken, options);
      res.status(200).json({ msg: "Login successful" });
  
    } catch (error) {
      console.error("Login error:", error.message);
      res.status(500).json({ msg: "Couldn't log in" });
    }
  };
  
export { signup ,profileUpdate,Login};
