import mongoose from "mongoose";

const subAdminSchema = new mongoose.Schema(
  {
    subAdminName: {
      type: String,
      required: true,
    },
    subAdminPassword: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
    },
    profilePicture: {
      type: String,
    },
    mobileNumber: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
      required: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

subAdminSchema.pre("save", async function (next) {
  if (!this.isModified("subAdminPassword")) {
    return next();
  }
  this.subAdminPassword = this.subAdminPassword;
  next();
});

subAdminSchema.methods.isPasswordCorrect = async function (subAdminPassword) {
  console.log(this.subAdminPassword);
  return this.subAdminPassword === subAdminPassword;
};

subAdminSchema.methods.generateAccessToken = async function (subAdminPassword) {
  return jwt.sign(
    {
      _id: this._id,
      mobileNumber: this.mobileNumber,
      subAdminName: this.subAdminName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

subAdminSchema.methods.generateRefToken = async function (subAdminPassword) {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const SubAdmin = mongoose.model("SubAdmin", subAdminSchema);
