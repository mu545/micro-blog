var express = require('express');
var router = express.Router();

const crypto = require('crypto');
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
    if (pagesDenyAuth.indexOf(visitPage) > -1) res.locals.auth = 'deny';
    if (pagesOptionalAuth.indexOf(visitPage) > -1) res.locals.auth = 'optional';

    if (res.locals.auth === 'pass') return next();

    let session = req.cookies['session'];

    if (typeof session == 'undefined') return next();

    let sessionId = session['id'];
    let sessionToken = crypto.createHash('md5')
                        .update(session['token'])
                        .digest('hex');

    if (typeof sessionId == 'undefined' || typeof sessionToken == 'undefined') {
      next();
    } else {
      req.models.usersAccess.findOne({session: sessionId})
          .populate('session')
          .populate('user_info')
          .populate('user_role')
          .exec(function (err, userAccess) {
            res.locals.user = userAccess;

            if (err) {
              res.locals.auth_err = err;
            } else if (!userAccess || userAccess.session == null) {
              res.locals.auth_err = new Error('no session found');
            } else if (userAccess.session.token !== sessionToken) {
              res.locals.auth_err = new Error('session is not valid');
            }

            next();
          });
    }
  },
  function (req, res, next) {
    if (res.locals.auth === 'use') {
      if (res.locals.user === null) {
        if (req.xhr) {
          if (res.locals.auth_err) {
            res.status(400).json({err: res.locals.auth_err.message});
          } else {
            res.status(401).json({err: 'please login first'});
          }
        } else {
          res.redirect('/users/login');
        }
      } else if (res.locals.user.session == null
        || res.locals.user.session.expired <= Date.now()) {
        res.cookie('session', null, {path: '/users', expires: new Date(Date.now() - 1)});

        if (req.xhr) {
          res.status(401).json({err: 'session is expired'});
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
