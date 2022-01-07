const {Order} = require('../models/order');
const express = require('express');
const {OrderItem} = require("../models/oderItem");
const mongoose = require("mongoose");
const {Category} = require("../models/category");
const {Product} = require("../models/product");
const router = express.Router();

//get all orders / orderList
router.get(`/`, async (req, res) => {

    const orderList = await Order.find()
        .populate('user', 'name')
        .sort({'dateOrdered': -1});


    if (!orderList) {
        res.status(500).json({success: false})
    }
    res.send(orderList);
})

//get order by ID
router.get(`/:id`, async (req, res) => {

    const order = await Order.findById(req.params.id)
        .populate('user', 'name')
        .populate({
            path:'orderItems', populate: {
                path: 'product', populate: 'category'}
        } );


    if (!order) {
        res.status(500).json({success: false})
    }
    res.send(order);
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
    //total price of an order (calculation)
    const totalPrices = await Promise.all(orderItemsIdsResolved.map(async (orderItemId) => {
        const oderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
        const totalPrice = (oderItem.product.price * oderItem.quantity);
        return totalPrice;
    }));

    const totalPrice = totalPrices.reduce((a,b) => a + b,0)

    let order = new Order({
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user,
    })
    order = await order.save();

    if (!order) {
        return res.status(404).send('the order cannot be created')
    }
    res.send(order);
})

//update status of an order
router.put(`/:id`, async (req, res) => {
    const updatedOrder = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status,
        },
        { new: true }
    );

    if (!updatedOrder) return res.status(400).send("the order cannot be update!");

    res.send(updatedOrder);

});

//delete order
router.delete('/:id', (req, res) => {
    //delete the related orderItem from orderItemTable
    Order.findByIdAndRemove(req.params.id).then(async order => {
        if (order) {
            order.orderItems.map(async orderItem => {
                await OrderItem.findByIdAndRemove(orderItem)
            })
            return res.status(200).json({
                success: true,
                message: "The order is deleted"
            })
        } else {
            return res.status(404).json({
                success: false,
                message: "order not found"
            })
        }
    }).catch(err => {
        return res.status(400).json({
            success: false,
            error: err
        })
    })
})

//show total sales of the eshop
router.get("/get/totalsales", async (req, res)=>{
    const totalSales = await Order.aggregate([
        {$group: { _id: null, totalsales: {$sum: '$totalPrice'}}}
    ])
    if (!totalSales){
        return res.status(400).send('The order sales cannot be generated')
    }
    res.send({totalSales: totalSales.pop().totalsales})
})

//count orders
router.get('/get/count', async (req, res) => {
    const orderCount = await Order.countDocuments();

    if (!orderCount) {
        res.status(500).json({success: false});
    }
    res.send({orderCount: orderCount});
});

//get List of Order History
router.get(`/get/userorders/:userid`, async (req, res) => {

    const userOrderList = await Order.find({user: req.params.userid}).populate({
        path:'orderItems', populate: {
            path: 'product', populate: 'category'}
    } ).sort({'dateOrdered': -1});


    if (!userOrderList) {
        res.status(500).json({success: false})
    }
    res.send(userOrderList);
})


module.exports = router;
