const models = {};

module.exports = function (req, res, next) {
  req.models = models;

  next();
};