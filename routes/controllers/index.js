const dashboard = require('./dashboard.js');
const login = require('./login.js');
const postCreate = require('./post-create.js');
const postLabels = require('./post-labels.js');
const postList = require('./post-list.js');
const postUpdate = require('./post-update.js');
const users = require('./users.js');

module.exports = function (router) {
  router.get('/dashboard', dashboard);
  router.get('/login', login);
  router.get('/post/create', postCreate);
  router.get('/post/labels', postLabels);
  router.get('/post/list', postList);
  router.get('/post/update', postUpdate);
  router.get('/users', users);
};