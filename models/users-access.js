const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  username: String,
  password: String,
  last_login: Date,
  session: {type: mongoose.Schema.Types.ObjectId, ref: 'session'},
  user_info: {type: mongoose.Schema.Types.ObjectId, ref: 'users_info'},
  user_role: {type: mongoose.Schema.Types.ObjectId, ref: 'user_roles'}
});

module.exports = mongoose.model('users_access', schema, 'users_access');