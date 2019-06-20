const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  role: String
});

module.exports = mongoose.model('User_roles', schema);