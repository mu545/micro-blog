var express = require('express');
var router = express.Router();

const apis = require('./apis/index.js');
const controllers = require('./controllers/index.js');

/* Pages disallowed and not allowed authentication */
pagesPassAuth = [
  'GET/login',
  'POST/api/v1/auth'
];
pagesDenyAuth = [
  'GET/login'
];
pagesOptionalAuth = [
  'DELETE/api/v1/auth'
];

/* User authentication */
router.all('/*', [
  function (req, res, next) {
    let visitPage = req.method + req.path;

    res.locals = {
      auth: 'use',
      auth_err: null,
      user: null
    };

    if (pagesPassAuth.indexOf(visitPage) > -1) res.locals.auth = 'pass';
    else if (pagesDenyAuth.indexOf(visitPage) > -1) res.locals.auth = 'deny';
    else if (pagesOptionalAuth.indexOf(visitPage) > -1) res.locals.auth = 'optional';

    if (res.locals.auth === 'pass') return next();

    let session = req.cookies['session'];

    if (typeof session == 'undefined') return next();

    let sessionId = session['id'];
    let sessionToken = session['token'];

    if (typeof sessionId == 'undefined' || typeof sessionToken == 'undefined') {
      next();
    } else {
      req.models.usersAccess.validateAccess(
        sessionId,
        sessionToken,
        function (err, userAccess) {
          res.locals.auth_err = err;
          res.locals.user = userAccess;

          next();
        });
    }
  },
  function (req, res, next) {
    if (res.locals.auth === 'use') {
      if (res.locals.user === null) {
        if (req.xhr) {
          if (res.locals.auth_err) res.status(400).json({err: res.locals.auth_err.message});
          else res.status(401).json({err: 'please login first'});
        } else {
          res.redirect('/users/login');
        }
      } else {
        next();
      }
    } else if (res.locals.auth === 'deny') {
      if (res.locals.user !== null) {
        if (req.xhr) res.status(401).json({err: 'you has been login'});
        else res.redirect('/users/dashboard');
      } else {
        next();
      }
    } else if (res.locals.auth === 'optional') {
      next();
    } else {
      next();
    }
  }
]);

apis(router);
controllers(router);

module.exports = router;
