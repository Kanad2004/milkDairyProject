import express from "express"
import adminRouter from "./routes/adminRouter.js"
import customerRouter from "./routes/customerRouter.js";
import connectDB from "./db/index.js";
const app = express();

//!Middleware
app.use(express.json());

//!Routes
app.use("/", adminRouter);
app.use("/", customerRouter);

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
