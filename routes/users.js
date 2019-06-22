var express = require('express');
var router = express.Router();

const login = require('./controllers/users/login.js');
const dashboard = require('./controllers/users/dashboard.js');
const systemInformation = require('./controllers/users/system-information.js');

router.post('/api/login', login.validation, login.postLogin);

/* Users authentication api */
router.get('/api/*', function (req, res, next) {
  let session = req.cookies['session'];
  let sessionId, sessionToken;

  if (typeof session == 'undefined') return res.json({err: 'please login first'});

  sessionId = session['id'];
  sessionToken = session['token'];

  if (typeof sessionId == 'undefined' || sessionToken == 'undefined') {
    res.status(401).send({err: 'please login first'});
  } else {
    req.models.usersAccess.validateAccess(sessionId, sessionToken, function (err, userAccess) {
      if (err) return res.status(401).json({err: err.message});

      res.data = {
        user : userAccess
      };

      next();
    });
  }
});

router.get('/api/logout', login.getLogout);
router.get('/api/system-information', systemInformation.getSystemInformation);

router.get('/login', login.main);

/* Users authentication. */
router.get('/*', function (req, res, next) {
  let session = req.cookies['session'];
  let sessionId, sessionToken;

  if (typeof session == 'undefined') return res.redirect('/users/login');

  sessionId = session['id'];
  sessionToken = session['token'];

  if (typeof sessionId == 'undefined' || sessionToken == 'undefined') {
    res.redirect('/users/login');
  } else {
    req.models.usersAccess.validateAccess(sessionId, sessionToken, function (err, userAccess) {
      if (err) return res.redirect('/users/login');

      res.data = {
        user : userAccess
      };

      next();
    });
  }
});

router.get('/dashboard', dashboard.main);

module.exports = router;
