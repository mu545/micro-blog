const crypto = require('crypto');
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  created: Date,
  expired: Date,
  token: String,
  user_id: mongoose.Schema.Types.ObjectId
});

schema.static('compareSession', function (sessionId, sessionToken, callback) {
  this.findById({_id: sessionId}, function (err, result) {
    if (err || !result) return callback(false, null);

    sessionToken = crypto.createHash('md5').update(cryptosessionToken).digest('hex');

    if (sessionToken === result.token) {
      callback(true, result);
    } else {
      callback(false, null);
    }
  });
});

module.exports = mongoose.model('Sessions', schema);