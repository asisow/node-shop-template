const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: {type: String },
    password: { type: String }
});

module.exports = mongoose.model('Product', productSchema);