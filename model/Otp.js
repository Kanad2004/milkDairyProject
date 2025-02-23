import mongoose from "mongoose"

const otpSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 }, // Auto-delete after 5 min
});

export const Otp = mongoose.model("Otp", otpSchema);