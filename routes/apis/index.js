const auth = require('./v1/auth.js');
const systemInformation = require('./v1/system-information.js');
const user = require('./v1/user.js');
const users = require('./v1/users.js');

module.exports = function (router) {
  router.route('/api/v1/auth')
    .post(auth.post)
    .delete(auth.delete);

  router.route('/api/v1/system-information')
    .get(systemInformation.get);

  router.route('/api/v1/user')
    .post(user.post)
    .put(user.put);

  router.route('/api/v1/users')
    .get(users.get);
};