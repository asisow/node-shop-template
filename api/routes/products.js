const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
    }
});

const fileFilter = function (req, file, cb) {
    //reject a file
    if (file.mimetype === 'images/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

const upload = multer({
    //dest: 'uploads/', filename: function(req,file, cb) {cb(null, file.fieldname + Date.now());
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5
    }
});

const Product = require('../models/product');

router.get('/', (req, res, next) => {
    Product.find()
        .select('_id name price productImage')
        .exec()
        .then(docs => {
            console.log(docs);
            //if (docs.length > 0) {
            res.status(200).json({
                count: docs.length,
                products: docs.map(doc => {
                    return {
                        _id: doc._id,
                        name: doc.name,
                        price: doc.price,
                        productImage: doc.productImage,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/products/' + doc._id
                        }   
                    }
                })
            });
            //} else {
            //    res.status(404).json({
            //        message: "No entries found"
            //    });
            //}
            
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.post('/',  upload.single('productImage'), (req, res, next) => {
    console.log(req.file)
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    });
    product
        .save()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: 'Successfuly created an object',
                createdProduct: {
                    _id: result._id,
                    name: result.name,
                    price: result.price,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/products/' + result._id
                    }  
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                message: 'An error occured: ',
                error: err
            });
        });
});

router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product
        .findById(id)
        .select('name price _id productImage')
        .exec()
        .then(doc => {
            console.log('From database: ', doc);
            if (doc) {
                res.status(200).json({
                    product: doc,
                    request: {
                        method: 'GET',
                        url: 'http://localhost:3000/'
                    }
                });
            } else {
                res.status(404).json({
                    message: "No valid object found"
                })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.patch('/:productId', (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};
    var msg = 'The ';
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
        msg += ops.propName;
    }
    msg = msg + ' of ' + id + ' has been updated:';
    console.log(msg);
    Product.updateOne({_id: id}, {$set: updateOps})
        .exec()
        .then(result => {
            console.log(result);
            res.status(200).json({
                message: msg,
                result: result,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/products/' + id
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

// Useful tool to delete all junk products from collection ***USE WITH CAUTION***
// router.delete('/', (req, res, next) => {
//     Product.deleteMany({})
//         .exec()
//         .then(result => {
//             res.status(200).json({
//                 message: 'all objects deleted'
//             })
//         })
//         .catch(err => {
//             res.status(500).json({
//                 error: err
//             })
//         });
// });

router.delete('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.deleteOne({_id: id})
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'object deleted',
                request: {
                    type: 'POST',
                    url: 'http://localhost:3000/products/',
                    body: {
                        name: String,
                        price: Number
                    }
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

