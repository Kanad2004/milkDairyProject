import mongoose from "mongoose"

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
  this.adminPassword = await bcrypt.hash(this.adminPassword , 10)
  next()
})

adminSchema.methods.isPasswordCorrect = async function (adminPassword){
  return await bcrypt.compare(adminPassword,this.adminPassword);
}

adminSchema.methods.generateAccessToken = async function (adminPassword) {
  return jwt.sign(
    {
      _id: this._id,
      adminEmail: this.adminEmail,
      adminName: this.adminName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

adminSchema.methods.generateRefToken = async function (adminPassword){
  return jwt.sign({
      _id : this._id,
  },
  process.env.REFRESH_TOKEN_SECRET , {
      expiresIn : process.env.REFRESH_TOKEN_EXPIRY
  })
}

export const Admin = mongoose.model("Admin", adminSchema);
