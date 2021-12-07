const {Product} = require('../models/product');
const express = require('express');
const {Category} = require("../models/category");
const router = express.Router();


//get product list
router.get(`/`, async (req, res) =>{
    const productList = await Product.find();

    if(!productList) {
        res.status(500).json({success: false})
    }
    res.send(productList);
})

//get product list by id
router.get(`/:id`, async (req, res) =>{
    const product = await Product.findById(req.params.id).populate('category');

    if(!product) {
        res.status(500).json({success: false})
    }
    res.send(product);
})

//create a new product list by category
router.post(`/`, async (req, res) =>{

    const category = await Category.findById(req.body.category);
    if (!category){
        return res.status(400).send('Invalid Category');
    }

     let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        brand:req.body.brand,
        price:req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReview: req.body.numReview,
        isFeatured: req.body.isFeatured,
    })

    product = await product.save();

    if (!product){
        return res.status(500).send('The product cannot be created')
    }
    res.send(product);
})

//updating the product by id
router.put('/:id', async (req, res)=>{
    const category = await Category.findById(req.body.category);
    if (!category){
        return res.status(400).send('Invalid Category')
    }

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.image,
            brand:req.body.brand,
            price:req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReview: req.body.numReview,
            isFeatured: req.body.isFeatured,
        },
        {new: true}
    );

    if (!product){
        return res.status(500).send('the product cannot be updated')
    }
    res.send(product)
})

module.exports =router;
