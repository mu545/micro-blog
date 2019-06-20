const crypto = require('crypto');
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  username: String,
  password: String,
  last_login: Date,
  session_id: {type: mongoose.Schema.Types.ObjectId, ref: 'session'},
  user_id: {type: mongoose.Schema.Types.ObjectId, ref: 'user_info'},
  user_role: {type: mongoose.Schema.Types.ObjectId, ref: 'user_roles'}
});

schema.static('validateUser', function (username, userPassword, callback) {
  this.findOne({username: username}, function (err, userAccess) {
    if (err) return callback(err);
    else if (!userAccess) return callback(new Error('no user found'));

    userPassword = crypto.createHash('md5').update(userPassword).digest('hex');

    if (userAccess.password === userPassword) callback(null, userAccess);
    else callback(new Error('password not valid'));
  });
});

schema.static('updateSession', function (_id, sessionId, callback) {
  this.updateOne(
    mongoose.Schema.Types.ObjectId(_id),
    {session_id: sessionId},
    function (err, result) {
      callback(err, result);
    });
});

module.exports = mongoose.model('User_access', schema);