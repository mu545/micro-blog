const labels = require('./labels.js');
const posts = require('./posts.js');
const session = require('./session.js');
const systemInformation = require('./system-information.js');
const userRoles = require('./user-roles.js');
const usersAccess = require('./users-access.js');
const usersInfo = require('./users-info.js');

const models = {
  labels,
  posts,
  session,
  systemInformation,
  userRoles,
  usersAccess,
  usersInfo
};

module.exports = function (req, res, next) {
  req.models = models;

  next();
};