const express = require("express");
const adminRouter = require("./routes/adminRouter");
const customerRouter = require("./routes/customerController");
const app = express();

//!Middleware
app.use(express.json());

//!Routes
app.use("/", adminRouter);
app.use("/", customerRouter);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on PORT : ${PORT}`);
});
