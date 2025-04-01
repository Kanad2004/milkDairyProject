import mongoose, { mongo } from "mongoose"

const productSchema = new mongoose.Schema(
  { 
    productName: {
      type : String , 
      required : true ,
    },
    productImage : {
        type : String , 
        required : true , 
    },
    productPrice: {
        type : Number , 
       required: true , 
    },
    quantity : {
        type : Number , 
        required : true , 
    },
  } 
)

const onlineOrderSchema = new mongoose.Schema(

  {
    customerName : {
      type : String , 
      required : true , 
    },
    mobileNumber : {
      type : String ,
      required : true , 
    },
    address : {
      type : String , 
      required : true ,
    },
    branch : {
      type : Number ,
      required : true , 
    }, 
    products: [productSchema],

  },
  
  {
    timestamps: true,
  }
);

export const onlineOrder = mongoose.model("onlineOrder", onlineOrderSchema);
