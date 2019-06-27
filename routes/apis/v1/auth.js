const crypto = require('crypto');
const {body, validationResult} = require('express-validator/check');

function validationInput(req, res, next) {
  let errors = validationResult(req);

  if (!errors.isEmpty()) res.status(400).json({err: errors.array({onlyFirstError: true})});
  else next();
}

function validateUser(req, res, next) {
  req.models.usersAccess.findOne(
    {username: req.body.username},
    function (err, userAccess) {
      if (err) {
        res.status(400).json({err: err.message});
      } else if (!userAccess) {
        res.status(400).json({err: 'uknown username'});
      } else {
        let userPassword = crypto.createHash('md5').update(req.body.password).digest('hex');

        if (userAccess.password === userPassword) {
          res.locals = {
            currentUser : {
              _id: userAccess._id,
              username: userAccess.username,
              last_login: null,
              session: null,
              user_info: userAccess.user_info,
              user_role: userAccess.user_role
            }
          };

          next();
        } else {
          res.status(400).json({err: 'wrong password'});
        }
      }
    });
}

function createSession(req, res, next) {
  let sessionToken = crypto.createHash('md5')
                      .update(crypto.randomBytes(48).toString())
                      .digest('hex');

  let createSession = new req.models.session({
    created: Date.now(),
    expired: Date.now() + ((1000 * 60) * 120),
    token: crypto.createHash('md5').update(sessionToken).digest('hex')
  });

  createSession.save(function (err, session) {
    if (err) {
      res.status(400).json({err: err.message});
    } else {
      res.locals.currentUser.last_login = new Date(session.created);
      res.locals.currentUser.session = {
        _id: session._id,
        created: session.created,
        expired: session.expired,
        token: sessionToken
      }

      next();
    }
  });
}

function updateUserSession(req, res, next) {
  req.models.usersAccess.updateOne(
    {_id: res.locals.currentUser._id},
    {$set: {last_login: new Date(res.locals.currentUser.session.created), session: res.locals.currentUser.session._id}},
    function (err) {
      if (err) res.status(400).json({err: err.message});
      else next();
    });
}

function newUserOnline(req, res, next) {
  req.models.systemInformation.newUserOnline(function (err) {
    if (err) res.status({err: err.message});
    else next();
  });
}

module.exports.post = [
  body('username')
    .exists({checkFalsy: true}).withMessage('username is required')
    .isAlphanumeric().withMessage('username not valid')
    .isLength({min: 6, max: 35}).withMessage('username not valid'),
  body('password')
    .exists({checkFalsy: true}).withMessage('password is required')
    .isAlphanumeric().withMessage('password not valid')
    .isLength({min: 6, max: 35}).withMessage('password not valid'),
  validationInput,
  validateUser,
  createSession,
  updateUserSession,
  newUserOnline,
  function (req, res) {
    let currentUser = {
      username: res.locals.currentUser.username,
      last_login: res.locals.currentUser.last_login,
      session: {
        _id: res.locals.currentUser.session._id,
        created: res.locals.currentUser.session.created,
        expired: res.locals.currentUser.session.expired,
        token: res.locals.currentUser.session.token
      },
      user_info: res.locals.currentUser.user_info,
      user_role: res.locals.currentUser.user_role,
    };

    res.cookie(
      'session',
      {id: res.locals.currentUser.session._id, token: res.locals.currentUser.session.token},
      {path: '/users', expires: new Date(res.locals.currentUser.session.expired)}
    ).json({msg: 'login successful', user : currentUser});
  }
];

function destroyUserSession(req, res, next) {
  if (res.locals.user == null) return res.json({msg: 'no auth found'});

  req.models.session.deleteOne(
    {_id: res.locals.user.session._id},
    function (err) {
      if (err) {
        res.status(400).json({err: err.message});
      } else {
        res.locals.currentUser = {
          _id: res.locals.user._id,
          session : {
            _id: null,
            created: Date.now(),
            expired: Date.now() - 1
          }
        };

        res.cookie(
          'session',
          {id: res.locals.user.session._id, token: res.locals.user.session.token},
          {path: '/users', expires: new Date(res.locals.currentUser.session.expired)}
        );

        next();
      }
    }
  );
}

function newUserOffline(req, res, next) {
  req.models.systemInformation.newUserOffline(function (err) {
    if (err) res.status({err: err.message});
    else next();
  });
};

module.exports.delete = [
  destroyUserSession,
  updateUserSession,
  newUserOffline,
  function (req, res) {
    res.json({msg: 'logout successful'});
  }
];