const session = require('./session.js');
const userRoles = require('./user-roles.js');
const userAccess = require('./user-access.js');
const userInfo = require('./user-info.js');

const models = {
  session,
  userRoles,
  userAccess,
  userInfo
};

module.exports = function (req, res, next) {
  req.models = models;

  next();
};