const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: String,
  email: String,
  mobile: String,
  registered: Date
});

module.exports = mongoose.model('users_info', schema, 'users_info');