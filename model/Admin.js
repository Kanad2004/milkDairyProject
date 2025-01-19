const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    adminName: {
      type: String,
      required: true,
    },
    adminEmail: {
      type: String,
      required: true,
    },
    adminPassword: {
      type: String,
      required: true,
    },
    
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Admin", adminSchema);
