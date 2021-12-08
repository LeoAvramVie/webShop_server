const {Order} = require('../models/order');
const express = require('express');
const {Category} = require("../models/category");
const {OrderItem} = require("../models/oderItem");
const {raw} = require("express");
const router = express.Router();

//get all orders / orderList
router.get(`/`, async (req, res) => {
    const orderList = await Order.find();

    if (!orderList) {
        res.status(500).json({success: false})
    }
    res.send(orderList);
})

//create order
router.post('/', async (req, res) => {
    const orderItemsIds = Promise.all(req.body.orderItems.map(async orderitem => {
        let newOrderItem = new OrderItem({
            quantity: orderitem.quantity,
            product: orderitem.product
        })

        newOrderItem = await newOrderItem.save()

        return newOrderItem._id
    }))
    const orderItemsIdsResolved = await orderItemsIds;

    let order = new Order({
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: req.body.totalPrice,
        user: req.body.user,
    })
    order = await order.save();

    if (!order) {
        return res.status(404).send('the order cannot be created')
    }
    res.send(order);
})

module.exports = router;
