import express from "express"
import adminRouter from "./routes/adminRouter.js"
import subAdminRouter from "./routes/subAdminRouter.js"
// import customerRouter from "./routes/customerRouter.js";
import connectDB from "./db/index.js";
const app = express();
import dotenv from "dotenv"
import loanRouter from "./routes/loanRouter.js";
import farmerReportRoutes from "./routes/farmerTransactionRouter.js";
import trasactionRouter from "./routes/transactionRouter.js";
import branchRouter from "./routes/branchRouter.js";
import productRouter from "./routes/productRouter.js";
import farmerTransactionRouter from "./routes/farmerTransactionRouter.js"
import farmerRouter from "./routes/farmerRouter.js";


dotenv.config({ path: "./.env" });
//!Middleware
app.use(express.json());

//!Routes
app.use("/api/v1", adminRouter);
app.use("/api/v1", branchRouter);
app.use("/api/v1", subAdminRouter);
app.use("/api/v1", loanRouter);
app.use("/api/v1", farmerReportRoutes);
app.use("/api/v1", trasactionRouter);
app.use("/api/v1", productRouter);
app.use("/api/v1", farmerTransactionRouter);
app.use("/api/v1", farmerRouter);
// app.use("/", customerRouter);

const PORT = process.env.PORT || 8000;

connectDB().then(() => {
  app.on('err' , (err) => {
                  console.log("Error : " , err) ;
                  throw err ; 
              })
                  
  app.listen(process.env.PORT || 8000, () => {
      console.log("app is listening at the port :" , process.env.PORT) ;
  });
})
.catch((err) => {
  console.log("MONGO DB connection Failed . . . ") ;
})
