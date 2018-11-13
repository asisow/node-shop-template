const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Order = require('../models/order');
const Product = require('../models/product');

router.get('/', (req, res, next) => {
    Order.find()
        .select('_id product quantity')
        .populate('product', '_id name')
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

router.post('/',(req, res, next) => {
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
            return order.save()
        })
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
                    url: 'http://localhost:3000/orders/'
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.get('/:orderId', (req, res, next) => {
    Order.findById(req.params.orderId)
        .select('_id product quantity')
        .populate('product', '_id name price')
        .exec()
        .then(order => {
            if (!order) {
                return res.status(404).json({
                    message: 'no orders with id ' + req.params.orderId + ' was found'
                })
            }
            res.status(200).json({
                order: order,
                request: {
                    method: 'GET',
                    url: 'http://localhost:3000/orders/' + order._id
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        });
});

router.delete('/:orderId', (req, res, next) => {
    const id = req.params.orderId;
    Order.deleteOne({_id: id})
        .exec()
        .then(order => {
            res.status(200).json({
                message: 'order with id ' + id + ' was deleted',
                request: {
                    method: 'DELETE',
                    url: 'http://localhost:3000/orders/' + id
                }
            });
        })        
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });  
});

module.exports = router;

