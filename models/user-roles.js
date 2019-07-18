const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  role: String,
  total_users: Number
});

module.exports = mongoose.model('user_roles', schema, 'user_roles');