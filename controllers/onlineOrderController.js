import { onlineOrder } from "../model/OnlineOrder.js";
import { SubAdmin } from "../model/SubAdmin.js";
import {Branch} from "../model/Branch.js";
// 📌 Get all orders
export const getAllOrders = async (req, res) => {
    try {
        const subAdmin = await SubAdmin.findById(req.subAdmin._id);
        const branch = await Branch.findById(subAdmin.branch);
        console.log("branch: ", branch);

        // Get today's start and end time
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        // Filter orders for the current day
        const orders = await onlineOrder.find({
            branch: branch.branchId,
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        });

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 📌 Get a specific order by ID
export const getOrderById = async (req, res) => {
    try {
        const order = await onlineOrder.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 📌 Create a new order
export const createOrder = async (req, res) => {
    const {orderData} = req.body ; 
    console.log("orderData: " , orderData);
    const {name , mobile, address , cartItems, branch} = orderData ; 

    try {
        const newOrder = new onlineOrder({ customerName: name, mobileNumber:mobile, address, products:cartItems , branch : branch});
        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 📌 Update an order by ID
export const updateOrder = async (req, res) => {
    try {
        const updatedOrder = await onlineOrder.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 📌 Delete an order by ID
export const deleteOrder = async (req, res) => {
    try {
        const deletedOrder = await onlineOrder.findByIdAndDelete(req.params.id);
        if (!deletedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
