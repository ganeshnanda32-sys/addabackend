import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    phone: { type: String, unique: true, required: true },
    password: { type: String, required: true },

    username: { type: String }, // REQUIRED later
    profilePic: { type: String }, // optional (URL)

    isVerified: { type: Boolean, default: false },
    isProfileCompleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
