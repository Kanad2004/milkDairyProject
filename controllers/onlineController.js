import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { OnlineCustomer } from "../model/OnlineCustomer.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import twilio from 'twilio';

const getOrderFrom = asyncHandler(async (err,req,res,next) => {
    
})

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new twilio(accountSid, authToken);
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

let verificationCode ;
// 4WCLHYZW1NQ6YUAYJ1PYQ8AY
const sendSms = asyncHandler(async(err, req,res,next) => {
    const phoneNumber = req.body.phoneNumber;
    const name = req.body.name ;
    const address = req.body.address ;
  client.verify.services(verifyServiceSid)
    .verifications
    .create({
      to: phoneNumber,
      channel: 'sms'
    })
    .then((verification) => {
      console.log(`Verification created: ${verification.sid}`);
      verificationCode = verification.code;

      client.messages
        .create({
          body: `Your verification code is: ${verificationCode}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phoneNumber
        })
        .then((message) => {
          console.log(`SMS sent: ${message.sid}`);
          res.status(200).send(new ApiResponse(200 , {} , `SMS sent: ${message.sid}`))
        })
        .done();
    })
    .done();
})

const verifyOtp = asyncHandler(async (err,req,res,next) => {
    const otp = req.body.otp;

    if (otp === verificationCode) {
        res.status(200).send(new ApiResponse(200 , {} , `OTP verified successfully`))
    } else {
        res.status(200).send(new ApiError(404 , {} , `Invalid OTP`))
    }
})

export {sendSms , verifyOtp }