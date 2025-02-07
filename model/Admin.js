import mongoose from "mongoose"

const adminSchema = new mongoose.Schema(
  {
    adminName: {
      type: String,
      required: true,
    },
    adminMobileNumber: {
      type: String,
      required: true,
      unique : true ,
    },
    adminPassword: {
      type: String,
      required: true,
    },
    refreshToken : {
      type : String
  }
    
  },
  {
    timestamps: true,
  }
);

adminSchema.pre("save" , async function (next) {
  if(!this.isModified("adminPassword")){
      return next() ;
  }
  this.adminPassword = await bcrypt.hash(this.adminPassword , 10)
  next()
})

adminSchema.methods.isPasswordCorrect = async function (adminPassword){
  return await bcrypt.compare(adminPassword,this.adminPassword);
}

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
