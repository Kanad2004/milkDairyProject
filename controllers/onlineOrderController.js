import {onlineCustomerOrders} from "../model/onlineCustomer.js";

// Get all orders
export const getAllOrders = async (req, res) => {
    try {
        const orders = await onlineCustomerOrders.find();
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a specific order by ID
export const getOrderById = async (req, res) => {
    try {
        const order = await onlineCustomerOrders.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new order
export const createOrder = async (req, res) => {
    try {
        const { orders } = req.body; // Expecting an array of orders
        const newOrder = new onlineCustomerOrders({ orders });
        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update an order by ID
export const updateOrder = async (req, res) => {
    try {
        const updatedOrder = await onlineCustomerOrders.findByIdAndUpdate(
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

// Delete an order by ID
export const deleteOrder = async (req, res) => {
    try {
        const deletedOrder = await onlineCustomerOrders.findByIdAndDelete(req.params.id);
        if (!deletedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
