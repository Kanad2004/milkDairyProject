// import express from "express"
// import adminRouter from "./routes/adminRouter.js"
// // import customerRouter from "./routes/customerRouter.js";
// import connectDB from "./db/index.js";
// const app = express();

// //!Middleware
// app.use(express.json());

// //!Routes
// app.use("/", adminRouter);
// // app.use("/", customerRouter);a
// app.use()

// const PORT = process.env.PORT || 8000;

// connectDB().then(() => {
//   app.on('err' , (err) => {
//                   console.log("Error : " , err) ;
//                   throw err ; 
//               })
                  
//   app.listen(process.env.PORT || 8000, () => {
//       console.log("app is listening at the port :" , process.env.PORT) ;
//   });
// })
// .catch((err) => {
//   console.log("MONGO DB connection Failed . . . ") ;
// })

import express from "express";
import adminRouter from "./routes/adminRouter.js";
import subAdminRouter from "./routes/subAdminRouter.js"; // Import subAdmin routes if needed
import connectDB from "./db/index.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(cookieParser());
// Middleware for parsing JSON data
app.use(express.json());

// Routes
app.use("/api/v1", adminRouter); // Prefixing all admin routes with /admin
app.use("/api/v1", subAdminRouter); // Prefixing all subadmin routes with /subadmin (if you're using subadmin routes)

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
