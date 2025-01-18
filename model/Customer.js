const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: String,
    required: true,
    unique: true, //can be changed later
  },
  address: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Customer", customerSchema);
