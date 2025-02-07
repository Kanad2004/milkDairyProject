import express from "express";
import adminRouter from "./routes/adminRouter.js";
<<<<<<< HEAD
import subAdminRouter from "./routes/subAdminRouter.js"; 
import branchRouter from "./routes/branchRouter.js"
import customerRouter from "./routes/customerRouter.js"
import productRouter from "./routes/productRouter.js"
import newofferRouter from "./routes/newofferRouter.js";
import farmerRouter from "./routes/farmerRouter.js"
import onlineCustomerRouter from "./routes/onlinecustomerRouter.js";
=======
import subAdminRouter from "./routes/subAdminRouter.js";
import branchRouter from "./routes/branchRouter.js";

import productRouter from "./routes/productRouter.js";
>>>>>>> 14a5353bd279100d6e5c27cb46140631f278c929
import connectDB from "./db/index.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import farmerRouter from "./routes/farmerRouter.js";
import cors from "cors";

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
<<<<<<< HEAD
app.use("/api/v1/branch" , branchRouter);
app.use("/api/v1/customer" , customerRouter) ;
app.use("/api/v1/product" , productRouter);
app.use("/api/v1/newoffer" , newofferRouter);
app.use("/api/v1/farmer" , farmerRouter);
app.use("/api/v1/online-customer" , onlineCustomerRouter);
=======
app.use("/api/v1/branch", branchRouter);
app.use("/api/v1/customer", farmerRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/farmer", farmerRouter);

>>>>>>> 14a5353bd279100d6e5c27cb46140631f278c929
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
