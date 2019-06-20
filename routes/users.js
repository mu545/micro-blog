var express = require('express');
var router = express.Router();

const login = require('./controllers/users/login.js');

router.post('/api/login', login.validation, login.postLogin);

/* Users authentication api */
router.get(['/api', '/api/*'], function (req, res) {
  let session = req.cookies['session'];
  let sessionId, sessionToken;

  if (typeof session == 'undefined') return res.json({err: 'please login first'});

  sessionId = session['id'];
  sessionToken = session['token'];

  if (typeof sessionId == 'undefined' || sessionToken == 'undefined') {
    res.status(401).send({err: 'please login first'});
  } else {
    req.models.session.compareSession(sessionId, sessionToken, function (err) {
      if (!err) next();
      else res.status(401).json({err: err.message});
    });
  }
});

router.get('/login', login.main);

/* Users authentication. */
router.get(['/', '/*'], function (req, res, next) {
  let session = req.cookies['session'];
  let sessionId, sessionToken;

  if (typeof session == 'undefined') return res.redirect('/users/login');

  sessionId = session['id'];
  sessionToken = session['token'];

  if (typeof sessionId == 'undefined' || sessionToken == 'undefined') {
    res.redirect('/users/login');
  } else {
    req.models.session.compareSession(sessionId, sessionToken, function (err) {
      if (!err) next();
      else res.redirect('/users/login');
    });
  }
});

module.exports = router;
