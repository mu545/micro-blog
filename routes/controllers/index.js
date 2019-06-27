const dashboard = require('./dashboard.js');
const login = require('./login.js');
const users = require('./users.js');

module.exports = function (router) {
  router.get('/dashboard', dashboard);
  router.get('/login', login);
  router.get('/users', users);
};