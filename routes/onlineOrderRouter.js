import express from "express";
import {
    getAllOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder,
    placeOrder
} from "../controllers/onlineOrderController.js";
import { authenticateSubAdmin, authorizeRoleSubAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Get all orders
router.get("/get-all-orders", authenticateSubAdmin, authorizeRoleSubAdmin(["subAdmin"]), getAllOrders);

// Get an order by ID
router.get("/get-order-byid/:id", authenticateSubAdmin, authorizeRoleSubAdmin(["subAdmin"]), getOrderById);

// Create a new order
router.post("/create-order", createOrder);

// Update an order by ID
router.put("/update-order/:id", authenticateSubAdmin,  authorizeRoleSubAdmin(["subAdmin"]), updateOrder);

// Delete an order by ID
router.delete("/delete-order/:id", authenticateSubAdmin, authorizeRoleSubAdmin(["subAdmin"]) , deleteOrder);

router.put("/place-order/:id" , authenticateSubAdmin , authorizeRoleSubAdmin(['subAdmin']) , placeOrder);
export default router;
