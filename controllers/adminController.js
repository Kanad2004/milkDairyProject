import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {Admin} from "../model/Admin.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

const registerUser = asyncHandler(async (req,res) => {

    const {adminName , adminEmail , adminPassword } = req.body ;
    
    if([adminName , adminEmail , adminPassword].some((field) => field?.trim === "")){
        throw new ApiError(400 , "All Fields are required ")
    }

    const admin = await Admin.findOne({adminEmail})

    if(admin){
        throw new ApiError(409, "Admin with email already exists")
    }
    
    const newAdmin = await Admin.create({
        adminName,
        adminEmail, 
        adminPassword ,
    })
    const createdUser = await User.findById(newUser._id).select(
        "-adminPassword -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500 , "User is not registered successfully")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully ! ")
    )
})