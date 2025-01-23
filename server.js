import express from "express";
import adminRouter from "./routes/adminRouter.js";
import subAdminRouter from "./routes/subAdminRouter.js"; 
import branchRouter from "./routes/branchRouter.js"
import customerRouter from "./routes/customerRouter.js"
import productRouter from "./routes/productRouter.js"
import connectDB from "./db/index.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv"

const app = express();

dotenv.config({
  path : "./env"
}) ;

app.use(cookieParser());
// Middleware for parsing JSON data
app.use(express.json());

// Routes
app.use("/api/v1/admin", adminRouter); // Prefixing all admin routes with /admin
app.use("/api/v1/subadmin", subAdminRouter); // Prefixing all subadmin routes with /subadmin (if you're using subadmin routes)
app.use("/api/v1/branch" , branchRouter);
app.use("/api/v1/customer" , customerRouter) ;
app.use("/api/v1/product" , productRouter);

// Connect to MongoDB and start the server
connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`App is listening on port ${process.env.PORT || 8000}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection failed:", err);
  });