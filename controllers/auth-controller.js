const User = require("../models/user");
const express = require("express");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");


// register controller
const registerUser = async (req, res) => {
  try {
    // extract user data from request body
    const { username, email, password, role } = req.body;

    // check if user is already registered
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        status: "failure",
        message: "User already registered with this email or username",
      });
    }
    // hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: role || "user", // default role is 'user'
    });
    // save user to database
    await newUser.save();
    if (newUser) {
      return res.status(201).json({
        status: "success",
        message: "User registered successfully",
      });
    } else {
      return res.status(400).json({
        status: "failure",
        message: "User registration failed",
      });
    }
  } catch (error) {
    console.log("Error during registration:", error);
    res.status(500).json({
      status: "failure",
      message: "Some error occurred! Please try again",
    });
  }
};

// login controller

const loginUser = async (req, res) => {
  try {
    // extract user data from request body
    const { email, password } = req.body;

    // check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        status: "failure",
        message: "User not found with this email",
      });
    }

    // compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        status: "failure",
        message: "Invalid credentials",
      });
    }

    // create user token
    const accessToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "30m" }
    );


    // login successful
    return res.status(200).json({
      status: "success",
      message: "User logged in successfully",
        accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log("Error during login:", error);
    res.status(500).json({
      status: "failure",
      message: "Some error occurred! Please try again",
    });
  }
};


const changePassword = async (req, res)=>{
  try {
    const userId = req.userInfo.userId; // Assuming req.userInfo is set by authentication middleware

    // Extract new password from request body
    const { newPassword, oldPassword } = req.body;

    // Find the user by ID
    const user = await User.findById(userId);
    if(!user){
      return res.status(404).json({ 
        status: "failure",
        message: "User not found" 
      });
    }
    // Check if the old password matches
    const isMatch =  await bcrypt.compare(oldPassword, user.password);
    if(!isMatch){
      return res.status(400).json({ 
        status: "failure",
        message: "Old password is incorrect" 
      });
    }
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);
    // Update the user's password
    user.password = hashedNewPassword;
    await user.save();
    return res.status(200).json({ 
      status: "success",
      message: "Password changed successfully" 
    });
    
    
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ 
      status: "failure",
      message: "Internal server error" 
    });
  }
}

module.exports = {
  registerUser,
  loginUser,
  changePassword
};
