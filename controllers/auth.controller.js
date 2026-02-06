import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Otp from "../models/Otp.js";
import { generateOtp } from "../utils/otp.js";

// SEND OTP
export const sendOtp = async (req, res) => {
  const { phone } = req.body;

  const otp = generateOtp();

  await Otp.deleteMany({ phone });

  await Otp.create({
    phone,
    otp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000)
  });

  console.log("OTP:", otp);

  res.json({ message: "OTP sent" });
};

// VERIFY OTP + REGISTER
export const register = async (req, res) => {
  const { phone, otp, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  const otpRecord = await Otp.findOne({ phone, otp });
  if (!otpRecord || otpRecord.expiresAt < Date.now()) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  const existingUser = await User.findOne({ phone });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    phone,
    password: hashedPassword,
    isVerified: true
  });

  await Otp.deleteMany({ phone });

  // TEMP TOKEN (used to complete profile)
  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  res.json({
    message: "OTP verified. Complete profile.",
    token
  });
};


// LOGIN
export const login = async (req, res) => {
  const { phone, password } = req.body;

  const user = await User.findOne({ phone });
  if (!user) return res.status(404).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: "Invalid password" });

  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token, user });
};



export const completeProfile = async (req, res) => {
  const { username, profilePic } = req.body;

  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }

  const user = await User.findById(req.userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.username = username;
  user.profilePic = profilePic || null;
  user.isProfileCompleted = true;

  await user.save();

  res.json({
    message: "Profile completed successfully",
    user
  });
};
