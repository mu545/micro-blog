const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  title: String,
  subtitle: String,
  labels: [{type: mongoose.Schema.Types.ObjectId, ref: 'labels'}],
  created_by: {type: mongoose.Schema.Types.ObjectId, ref: 'users_info'},
  created: Date,
  updated: Date,
  content: String
});

module.exports = mongoose.model('posts', schema, 'posts');