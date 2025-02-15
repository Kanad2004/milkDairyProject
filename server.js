import express from "express";
import adminRouter from "./routes/adminRouter.js";
import subAdminRouter from "./routes/subAdminRouter.js";
import branchRouter from "./routes/branchRouter.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import productRouter from "./routes/productRouter.js";
import connectDB from "./db/index.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import farmerRouter from "./routes/farmerRouter.js";
import newofferRouter from "./routes/newofferRouter.js";
import cors from "cors";
import mongoose from "mongoose";

const app = express();
app.use(
  cors({
    // origin:process.env.CORS_ORIGIN,
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());
// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Credentials', 'true');
//     next();
// });

dotenv.config({
  path: "./.env",
});

// Routes
app.use("/api/v1/admin", adminRouter); // Prefixing all admin routes with /admin
app.use("/api/v1/subadmin", subAdminRouter); // Prefixing all subadmin routes with /subadmin (if you're using subadmin routes)
app.use("/api/v1/branch", branchRouter);
app.use("/api/v1/customer", farmerRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/farmer", farmerRouter);
app.use("/api/v1/new-offer", newofferRouter);

// Connect to MongoDB and start the server

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`App is listening on port ${process.env.PORT || 8000}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connecti on failed:", err);
  });
