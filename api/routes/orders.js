const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Order = require('../models/order');
const Product = require('../models/product');

router.get('/', (req, res, next) => {
    Order.find()
        .select('_id product quantity')
        .exec()
        .then(result => {
            res.status(200).json({
                count: result.length,
                orders: result.map(doc => {
                    return {
                        _id: doc._id,
                        productID: doc.product,
                        quantity: doc.quantity,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/orders/' + doc._id
                        }
                    }
                })
            });
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.post('/', (req, res, next) => {
    Product.findById(req.body.productId)
        .then(product => {
            if (!product) {
                return res.status(404).json({
                    message: 'Product with provided ID not found'
                });
            };
            const order = new Order ({
                _id: mongoose.Types.ObjectId(),
                quantity: req.body.quantity,
                product: req.body.productId
            });
            order.save()
                .then(result => {
                    console.log("Created order: ", result);
                    res.status(201).json({
                        message: 'Order was created',
                        createdObject: {
                            _id: result._id,
                            productId: result.product,
                            quantity: result.quantity
                        },
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/orders/' + result._id
                        }
                    });
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        error: err
                    });
                });
        })
        .catch(err => {
            res.status(500).json({
                message: 'Product not found',
                erroe: err
            })
        });
    
});

router.get('/:orderID', (req, res, next) => {
    res.status(200).json({
        message: 'Order details',
        orderId: req.params.orderId
    });
});

router.delete('/:orderID', (req, res, next) => {
    const id = req.params.orderID;
    Product.deleteOne({_id: id})
        .exec()
        .then(result => {
            res.status(200).json(result);
        })        
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });  
});

module.exports = router;

