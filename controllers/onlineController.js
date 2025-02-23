import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
// import { OnlineCustomer } from "../model/OnlineCustomer.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import twilio from "twilio";
import express from "express"
import {Otp} from "../model/Otp.js"

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendOtp = async (req, res) => {
  let { phone , name} = req.body;
  phone = `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`
  if (!phone) return res.status(400).json({ error: "Phone number is required" });
  if(!name) return res.status(400).json({error : "Name is required"});
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate OTP

  // Save OTP in MongoDB
  await Otp.create({ phone, otp });

  // Send OTP via Twilio
  try {
    await client.messages.create({
      body: `Dear ${name}, Your OTP is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });

    return res.status(200).send(new ApiResponse(200 , '' , "Otp sent successfully"))
  } catch (error) {
    res.status(500).json({ error: "Failed to send OTP", details: error.message });
  }
};

const verifyOtp = async(req,res) => {

  let { phone, otp } = req.body;

  if (!phone || !otp) return res.status(400).json({ error: "Phone and OTP are required" });
  phone = `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`
  const storedOtp = await Otp.findOne({ phone, otp });

  if (!storedOtp) return res.status(400).json({ error: "Invalid or expired OTP" });

  await Otp.deleteOne({ phone }); // Delete OTP after successful verification

  res.json({ message: "OTP verified successfully" });
}

export {
  sendOtp,
  verifyOtp
}
