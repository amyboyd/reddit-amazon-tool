const mongoose = require('mongoose');
const config = require('../config');

mongoose.connect(config.mongodbConnection);

module.exports = mongoose;
