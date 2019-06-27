const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  total_users: Number,
  total_active_users: Number
});

schema.static('newUserCreated', function (callback) {
  this.updateOne({}, {$inc: {total_users: 1}}, callback);
});

schema.static('newUserOnline', function (callback) {
  this.updateOne({}, {$inc: {total_active_users: 1}}, callback);
});

schema.static('newUserOffline', function (callback) {
  this.updateOne({}, {$inc: {total_active_users: -1}}, callback);
});

module.exports = mongoose.model('systemInformation', schema, 'system_information');