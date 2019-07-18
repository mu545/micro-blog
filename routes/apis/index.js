const auth = require('./v1/auth.js');
const label = require('./v1/label.js');
const labels = require('./v1/labels.js');
const post = require('./v1/post.js');
const posts = require('./v1/posts.js');
const systemInformation = require('./v1/system-information.js');
const userRoles = require('./v1/user-roles.js');
const user = require('./v1/user.js');
const users = require('./v1/users.js');

module.exports = function (router) {
  router.route('/api/v1/auth')
    .post(auth.post)
    .delete(auth.delete);

  router.route('/api/v1/label')
    .post(label.post)
    .put(label.put);

  router.route('/api/v1/labels')
    .get(labels.get);

  router.route('/api/v1/post')
    .post(post.post)
    .get(post.get)
    .put(post.put)
    .delete(post.delete);

  router.route('/api/v1/posts')
    .get(posts.get);

  router.route('/api/v1/system-information')
    .get(systemInformation.get);

  router.route('/api/v1/user-roles')
    .get(userRoles.get);

  router.route('/api/v1/user')
    .post(user.post)
    .put(user.put);

  router.route('/api/v1/users')
    .get(users.get);
};