const mongoose = require("mongoose");

const subAdminSchema = new mongoose.Schema(
  {
    subAdminName: {
      type: String,
      required: true,
    },
    subAdminEmail: {
      type: String,
      required: true,
    },
    subAdminPassword: {
      type: String,
      required: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SubAdmin", subAdminSchema);
