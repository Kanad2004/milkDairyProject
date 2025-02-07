import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const adminSchema = new mongoose.Schema(
  {
    adminName: {
      type: String,
      required: true,
    },
    adminMobileNumber: {
      type: String,
      required: true,
<<<<<<< HEAD
      unique : true ,
=======
      unique: true,
>>>>>>> 14a5353bd279100d6e5c27cb46140631f278c929
    },
    adminPassword: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

adminSchema.pre("save", async function (next) {
  if (!this.isModified("adminPassword")) {
    return next();
  }
  this.adminPassword = this.adminPassword;
  next();
});

adminSchema.methods.isPasswordCorrect = async function (adminPassword) {
  console.log(this.adminPassword);
  return this.adminPassword === adminPassword;
};

<<<<<<< HEAD
adminSchema.methods.generateAccessToken = async function (){
  return jwt.sign({
      _id : this._id,
      adminMobileNumber:this.adminMobileNumber ,
      adminName : this.adminName ,
  },
  process.env.ACCESS_TOKEN_SECRET , {
      expiresIn : process.env.ACCESS_TOKEN_EXPIRY
  })
}

adminSchema.methods.generateRefToken = async function (){
  return jwt.sign({
      _id : this._id,
  },
  process.env.REFRESH_TOKEN_SECRET , {
      expiresIn : process.env.REFRESH_TOKEN_EXPIRY
  })
}
adminSchema.index({ adminMobileNumber: 1 });
export const Admin = mongoose.model("Admin" , adminSchema)
=======
adminSchema.methods.generateAccessToken = async function (adminPassword) {
  return jwt.sign(
    {
      _id: this._id,
      adminMobileNumber: this.adminMobileNumber,
      adminName: this.adminName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

adminSchema.methods.generateRefToken = async function (adminPassword) {
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

export const Admin = mongoose.model("Admin", adminSchema);
>>>>>>> 14a5353bd279100d6e5c27cb46140631f278c929
