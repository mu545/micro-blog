const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  label: String,
  total_posts: Number
});

module.exports = mongoose.model('labels', schema, 'labels');