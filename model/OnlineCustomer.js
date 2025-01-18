const mongoose = require("mongoose");

const onlineCustomerSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("OnlineCustomer", onlineCustomerSchema);
