const express = require("express");
const router = express.Router();
const Order = require("../models/order");
const { validateOrder } = require("../validation/order.validation");

//get all orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    console.log("Error fetching orders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//get order by id
router.get("/:id", async (req, res) => {
  try {
    const orderID = req.params.id;
    const order = await Order.findById(orderID);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    console.log("Error fetching order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//add order
router.post("/", async (req, res) => {
  try {
    const { error } = validateOrder(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const newOrder = req.body;
    const order = new Order(newOrder);
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    console.log("Error adding order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//update order
router.put("/:id", async (req, res) => {
  try {
    const orderID = req.params.id;
    const { error } = validateOrder(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const updatedOrder = await Order.findByIdAndUpdate(orderID, req.body, {
      new: true,
    });
    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.log("Error updating order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//cancel order
router.delete("/:id", async (req, res) => {
  try {
    const orderID = req.params.id;
    const order = await Order.findByIdAndDelete(orderID);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json({ message: "Order cancelled successfully" });
  } catch (error) {
    console.log("Error cancelling order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
