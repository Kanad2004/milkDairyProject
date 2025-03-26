import mongoose, { mongo } from "mongoose"


const orderSchema = new mongoose.Schema(
  {
    branch : {
      type : Number ,
      required : true , 
    },  
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
    }
  } 
)
const onlineOrderSchema = new mongoose.Schema(
  {
    orders: [orderSchema]
  },
  
  {
    timestamps: true,
  }
);

export const onlineOrder = mongoose.model("onlineOrder", onlineOrderSchema);
