const {Product} = require('../models/product');
const express = require('express');
const {Category} = require("../models/category");
const router = express.Router();
const mongoose = require('mongoose')


//get product list or get product list from ?category
router.get(`/`, async (req, res) => {
    let filter = {};
    if (req.query.categories){
        filter = {category: req.query.categories.split(',')};
    }

    const productList = await Product.find(filter).populate('category');

    if (!productList) {
        res.status(500).json({success: false})
    }
    res.send(productList);
})

//get product list by id
router.get(`/:id`, async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category');

    if (!product) {
        res.status(500).json({success: false})
    }
    res.send(product);
})

//create a new product list by category
router.post(`/`, async (req, res) => {

    const category = await Category.findById(req.body.category);
    if (!category) {
        return res.status(400).send('Invalid Category');
    }

    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReview: req.body.numReview,
        isFeatured: req.body.isFeatured,
    })

    product = await product.save();

    if (!product) {
        return res.status(500).send('The product cannot be created')
    }
    res.send(product);
})

//update the product by id
router.put('/:id', async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400).send('Invalid Product Id')
    }
    const category = await Category.findById(req.body.category);
    if (!category) {
        return res.status(400).send('Invalid Category')
    }

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.image,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReview: req.body.numReview,
            isFeatured: req.body.isFeatured,
        },
        {new: true}
    );

    if (!product) {
        return res.status(500).send('the product cannot be updated')
    }
    res.send(product)
})

//delete a category
router.delete('/:id', (req, res) => {
    Product.findByIdAndRemove(req.params.id).then(product => {
        if (product) {
            return res.status(200).json({
                success: true,
                message: "The product is deleted"
            })
        } else {
            return res.status(404).json({
                success: false,
                message: "product not found"
            })
        }
    }).catch(err => {
        return res.status(400).json({
            success: false,
            error: err
        })
    })
})

//get product count
router.get('/get/count', async (req, res) => {
    const productCount = await Product.countDocuments();
    if (!productCount) {
        res.status(500).json({success: false});
    }
    res.send({productCount: productCount});
});

//get featured products
router.get('/get/featured/:count', async (req, res) => {
    const count = req.params.count ? req.params.count : 0;
    const products = await Product.find({isFeatured: true}).limit(+count);
    if (!products) {
        res.status(500).json({success: false});
    }
    res.send(products);
});

module.exports = router;
