const crypto = require('crypto');
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  created: Number,
  expired: Number,
  token: String
});

schema.static('createSession', function (callback) {
  let sessionToken = crypto.createHash('md5')
                      .update(crypto.randomBytes(48).toString())
                      .digest('hex');

  let createSession = new this({
    created: Date.now(),
    expired: Date.now() + ((1000 * 60) * 120),
    token : crypto.createHash('md5').update(sessionToken).digest('hex')
  });

  createSession.save(function (err, session) {
    if (err) return callback(err);

    callback(null, session, sessionToken);
  });
});

module.exports = mongoose.model('session', schema, 'sessions');