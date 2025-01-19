const express = require("express");
const { addCustomer } = require("../controllers/customerController");
const customerRouter = express.Router();

customerRouter.post("/api/v1/customer/addCustomer", addCustomer);

module.exports = customerRouter;
