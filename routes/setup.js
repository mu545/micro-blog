var express = require('express');
var router = express.Router();

const setup = require('./controllers/setup.js');

setup(router);

module.exports = router;