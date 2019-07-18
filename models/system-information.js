const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  total_users: Number,
  total_active_users: Number
});

module.exports = mongoose.model('systemInformation', schema, 'system_information');