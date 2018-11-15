const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const User = require('../models/user')

router.post('/signup', (req, res, next) => {
    const user = new User 
})

module.exports = router;