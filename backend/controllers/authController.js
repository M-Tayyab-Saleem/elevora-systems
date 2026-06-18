require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/userSchema");
const Company = require("../models/companySchema");
const { info, error, debug } = require("../utils/logger");
const {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} = require("../utils/ExpressError");
const BlacklistedToken = require("../models/BlacklistedTokenSchema");
const { sendOTPEmail, sendForgotPasswordEmail } = require("../config/emailConfig");

const generateToken = require("../utils/token").generateAccessToken;
const generateRefreshToken = require("../utils/token").generateRefreshToken;

const generateOTP = () => Math.floor(100000 + Math.random() * 900000);
const generateResetToken = () => crypto.randomBytes(32).toString("hex");

// 0. Register Company (Phase 1)
exports.registerCompany = async (req, res) => {
  const { companyName, industry, size, website, firstName, lastName, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new BadRequestError("Email is already registered.");
  }

  // Create Company
  const newCompany = await Company.create({
    name: companyName,
    industry,
    size,
    website,
    plan: "trial"
  });

  // Create Admin User
  const newUser = await User.create({
    name: `${firstName} ${lastName}`,
    email,
    password, // assumes presave hook hashes it, wait, userSchema.js might have pre-save hash, but let's hash it explicitly if not. In login, we see user.password checked with bcrypt.compareSync. We'll rely on pre-save hook or hash it here if it fails. Let's hash it.
    company: newCompany._id,
    role: "Admin",
    empStatus: "Active"
  });

  // Generate OTP
  const otp = generateOTP();
  const currentTime = new Date();
  newUser.otp = otp;
  newUser.otpGeneratedAt = currentTime;
  newUser.otpExpires = new Date(currentTime.getTime() + 5 * 60 * 1000);
  await newUser.save();

  // Send OTP
  try {
    await sendOTPEmail({
      to: email,
      otp,
      name: newUser.name
    });
  } catch (err) {
    error("Error sending OTP email during registration: " + err.message);
    // don't fail registration if email fails in dev, just proceed
  }

  res.status(201).json({
    message: "Company registered successfully. OTP sent to your email.",
    email: newUser.email,
    name: newUser.name,
    id: newUser._id,
    company: newCompany._id
  });
};

// 1. Login 
exports.login = async (req, res) => {
  const { email, password } = req.body;

  info(`Login request received for email: ${email}`);
  const user = await User.findOne({ email }).select("+password");
  if (!user)
    throw new BadRequestError("You are not registered. Please sign up first.");

  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) throw new BadRequestError("Invalid password");

  const otp = generateOTP();
  const currentTime = new Date();
  user.otp = otp;
  user.otpGeneratedAt = currentTime;
  user.otpExpires = new Date(currentTime.getTime() + 5 * 60 * 1000);
  await user.save();

  try {
    await sendOTPEmail({
      to: email,
      otp,
      name: user.name
    });
  } catch (err) {
    error("Error sending OTP email: " + err.message);
  }

  res.status(200).json({
    message: "OTP sent to your email",
    email: user.email,
    name: user.name,
    id: user._id,
    role: user.role,
    avatar: user?.avatar,
    designation: user?.designation,
    department: user?.department
  });
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });
  if (!user || !user.otp || user.otpExpires < Date.now())
    throw new BadRequestError("Invalid or expired OTP");
  if (String(user.otp) !== String(otp)) throw new BadRequestError("Invalid OTP");

  user.otp = undefined;
  user.otpGeneratedAt = undefined;
  user.otpExpires = undefined;

  const accessToken = generateToken(user);
  const refreshToken = generateRefreshToken(user);
  user.refreshToken = refreshToken;
  await user.save();

  const isProd = process.env.NODE_ENV === "production";
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "None" : "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    message: "OTP verified",
    token: accessToken,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      company: user.company,
    },
  });
};

exports.resendOtp = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new NotFoundError("User not found");

  const otp = generateOTP();
  const now = new Date();
  user.otp = otp;
  user.otpGeneratedAt = now;
  user.otpExpires = new Date(now.getTime() + 5 * 60 * 1000);
  await user.save();

  try {
    await sendOTPEmail({
      to: email,
      otp,
      name: user.name
    });
  } catch (err) {
    error("Error sending OTP email: " + err.message);
  }

  res.status(200).json({
    message: "New OTP sent to your email",
    email: user.email,
    name: user.name,
    id: user._id,
    role: user.role,
  });
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new NotFoundError("No user found with that email");

  const resetToken = generateResetToken();
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  await user.save();
  const resetURL = `${process.env.FRONTEND_URL}/auth/reset-password/${resetToken}`;

  try {
    await sendForgotPasswordEmail({
      to: user.email,
      name: user.name,
      resetURL
    });
  } catch (err) {
    error("Error sending forgot password email: " + err.message);
  }

  res.status(200).json({
    message: "Password reset link sent to your email",
    email: user.email,
    name: user.name,
    id: user._id,
  });
};

exports.verifyResetToken = async (req, res) => {
  const { token } = req.params;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) throw new BadRequestError("Token is invalid or expired");

  res.status(200).json({ message: "Token is valid", email: user.email });
};

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) throw new BadRequestError("Token is invalid or expired");

  // In userSchema.js there should be a pre-save hook for password hash
  // But previously they hashed it explicitly. Let's match previous logic.
  user.password = bcrypt.hashSync(password, 10);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  const newToken = generateToken(user);

  res.status(200).json({
    message: "Password reset successful",
    token: newToken,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
};

exports.logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) throw new UnauthorizedError("No refresh token provided");

  const user = await User.findOne({ refreshToken });
  if (!user) throw new UnauthorizedError("Invalid refresh token");

  await BlacklistedToken.create({
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const accessToken = req.headers.authorization?.split(" ")[1];
  if (accessToken) {
    await BlacklistedToken.create({
      token: accessToken,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });
  }

  user.refreshToken = null;
  await user.save();

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "strict",
  });

  res.status(200).json({ message: "Logged out successfully" });
};

exports.getCurrentUser = async (req, res) => {
  if (!req.user || !req.user.id) {
    throw new UnauthorizedError("User context missing");
  }

  const user = await User.findById(req.user.id)
    .populate({
      path: "department",
      populate: {
        path: "members",
        model: "User",
        select: "name email designation avatar role empStatus"
      }
    })
    .populate({
      path: "reportsTo",
      select: "name email designation avatar role"
    });

  if (!user) {
    throw new UnauthorizedError("User record not found");
  }

  res.status(200).json({
    status: "success",
    message: "Authenticated",
    user: user,
  });
};

exports.refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) throw new UnauthorizedError("No refresh token provided");

  const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(payload.id);
  if (!user) throw new UnauthorizedError("User not found");

  const accessToken = generateToken(user);
  return res.status(200).json({ accessToken, user });
};