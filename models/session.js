const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  created: Number,
  expired: Number,
  token: String
});

module.exports = mongoose.model('session', schema, 'sessions');