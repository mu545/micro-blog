const crypto = require('crypto');
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  username: String,
  password: String,
  last_login: Date,
  session: {type: mongoose.Schema.Types.ObjectId, ref: 'session'},
  user_info: {type: mongoose.Schema.Types.ObjectId, ref: 'users_info'},
  user_role: {type: mongoose.Schema.Types.ObjectId, ref: 'user_roles'}
});

schema.static('validateAccess', function (sessionId, sessionToken, callback) {
  this.findOne({session: sessionId})
    .populate('session')
    .populate('user_info')
    .populate('user_role')
    .exec(function (err, userAccess) {
      if (err) {
        callback(err);
      } else if (!userAccess) {
        callback(new Error('no session found'));
      } else {
        sessionToken = crypto.createHash('md5')
                        .update(sessionToken)
                        .digest('hex');

        if (userAccess.session.token === sessionToken) callback(null, userAccess);
        else callback(new Error('session not valid'), userAccess);
      }
    });
});

module.exports = mongoose.model('users_access', schema, 'users_access');