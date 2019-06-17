var express = require('express');
var router = express.Router();

const register = require('./controllers/users/register.js');
const login = require('./controllers/users/login.js');

router.post('/api/register', register.postRegister);
router.post('/api/login', login.postLogin);

/* Users authentication api */
router.get(['/api', '/api/*'], function (req, res) {
  let sessionId = req.cookies['session_id'];
  let sessionToken = req.cookies['session_token'];

  if (typeof sessionId == 'undefined' || typeof sessionToken == 'undefined') {
    res.status(401).send({msg: 'please login first'});
  } else {
    req.models.session.compareSession(sessionId, sessionToken, function (matched) {
      if (matched) {
        next();
      } else {
        res.status(401).send({msg: 'please login first'});
      }
    });
  }
});

router.get('/register', register.main);
router.get('/login', login.main);

/* Users authentication. */
router.get(['/', '/*'], function (req, res, next) {
  let sessionId = req.cookies['session_id'];
  let sessionToken = req.cookies['session_token'];

  if (typeof sessionId == 'undefined' || sessionToken == 'undefined') {
    res.redirect('/users/login');
  } else {
    req.models.session.compareSession(sessionId, sessionToken, function (matched) {
      if (matched) {
        next();
      } else {
        res.redirect('/users/login');
      }
    });
  }
});

module.exports = router;
