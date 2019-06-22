const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  role: String,
  users_total: Number
});

module.exports = mongoose.model('user_roles', schema, 'user_roles');