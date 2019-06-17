const session = require('./session.js');

const models = {
  session
};

module.exports = function (req, res, next) {
  req.models = models;

  next();
};