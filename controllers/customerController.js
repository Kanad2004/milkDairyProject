import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Admin } from "../model/Admin.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Customer from "../model/Customer.js";

const addCustomer = asyncHandler(async (req, res) => {
    const {customerName , mobileNumber , address} = req.body ;
    const admin = req.admin ; 

    if([customerName , mobileNumber , address].some((field) => field?.trim === "")){
        throw new ApiError(400 , "All Fields are required ")
    }

    const customer = await Customer.findOne({mobileNumber})

    if(customer){
        throw new ApiError(409, "Customer with this mobile number already exists")
    }

    const newCustomer = await Customer.create({
        customerName,
        mobileNumber, 
        address ,
        admin
    })

    if(!newCustomer){
        throw new ApiError(500 , "Customer is not added successfully")
    }

    return res.status(201).json(
        new ApiResponse(200, newCustomer, "Customer Registered Successfully ! ")
    )

});

const getAllCustomers = asyncHandler(async (req,res) => {
    const customers = await Customer.find({}).populate("admin", "adminName");
  return res
    .status(200)
    .json(new ApiResponse(200, customers, "All customers fetched"));
});


const getCustomerById = asyncHandler(async (req, res) => {
    const { customerId } = req.params;
  
    const customer = await Customer.findById(customerId).populate("admin", "adminName");
  
    if (!customer) {
      throw new ApiError(404, "Customer not found");
    }
  
    return res.status(200).json(new ApiResponse(200, customer, "Customer found"));
  });

  const updateCustomer = asyncHandler(async (req, res) => { 
    const { customerId } = req.params;                  
    const { customerName, mobileNumber, address } = req.body;

    const customer = await Customer.findById(customerId);                   

    if (!customer) {                

        throw new ApiError(404, "Customer not found");              
    }    
    if (customerName) {                     

        customer.customerName = customerName;                 
    }

    if (mobileNumber) {                     

        customer.mobileNumber = mobileNumber;                 
    }

    if (address) {                     

        customer.address = address;                 
    }

    const updatedCustomer = await customer.save();

    return res.status(200).json(new ApiResponse(200, updatedCustomer, "Customer updated successfully"));
  });

    const deleteCustomer = asyncHandler(async (req, res) => {
        const { customerId } = req.params;
        const customer = await Customer.findById(customerId);
        if (!customer) {
          throw new ApiError(404, "Customer not found");
        }
        await customer.remove();
        return res.status(200).json(new ApiResponse(200, {}, "Customer deleted successfully"));
      });

export { addCustomer, getAllCustomers, getCustomerById, updateCustomer, deleteCustomer };


// export {addCustomer , getAllCustomers}