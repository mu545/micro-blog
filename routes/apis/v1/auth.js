const crypto = require('crypto');
const {body, validationResult} = require('express-validator/check');

function validationInput(req, res, next) {
  let errors = validationResult(req);

  if (!errors.isEmpty()) res.status(400).json({err: errors.array({onlyFirstError: true})});
  else next();
}

function validateUser(req, res, next) {
  req.models.usersAccess.findOne(
    {username: res.locals.input.username},
    function (err, userAccess) {
      if (err) {
        res.status(400).json({err: err.message});
      } else if (!userAccess) {
        res.status(400).json({err: 'uknown username'});
      } else {
        let userPassword = crypto.createHash('md5')
                            .update(res.locals.input.password)
                            .digest('hex');

        if (userAccess.password === userPassword) {
          res.locals.user = {
            _id: userAccess._id,
            username: userAccess.username,
            last_login: null,
            session: null,
            user_info: userAccess.user_info,
            user_role: userAccess.user_role
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
      res.locals.user.last_login = new Date(session.created);
      res.locals.user.session = {
        _id: session._id,
        created: session.created,
        expired: session.expired,
        token: sessionToken
      };
      res.locals.increase_total_user_active = 1;

      next();
    }
  });
}

function updateUserSession(req, res, next) {
  req.models.usersAccess.updateOne(
    {_id: res.locals.user._id},
    {
      $set: {
        last_login: new Date(res.locals.user.session.created),
        session: res.locals.user.session._id
      }
    },
    function (err) {
      if (err) {
        res.status(400).json({err: err.message});
      } else {
        next();
      }
    });
}

function increaseTotalUserActive(req, res, next) {
  req.models.systemInformation.updateOne(
    {},
    {$inc: {total_active_users: res.locals.increase_total_user_active}},
    function (err) {
      next();
    });
}

function deleteSession(req, res, next) {
  let currentDate = Date.now();

  req.models.session.deleteOne(
    {_id: res.locals.user.session._id},
    function (err) {
      if (err) {
        res.status(400).json({err: err.message});
      } else {
        res.locals.user.session._id = null;
        res.locals.user.session.expired = currentDate;
        res.locals.increase_total_user_active = -1;

        next();
      }
    });
}

function deleteExpiredSessions(req, res, next) {
  req.models.session.deleteMany(
    {expired: {$lte: Date.now()}},
    function (err, sessionDeleted) {
      if (err) {
        console.error(err);
      } else {
        res.locals.increase_total_user_active = sessionDeleted.deletedCount > 0 ? -sessionDeleted.deletedCount : 0;

        increaseTotalUserActive(req, res, function () {
          // Ok
        });
      }
    });

  next();
}

function createInput(req, res, next) {
  res.locals.input = {
    username: req.body.username,
    password: req.body.password
  };

  next();
}

module.exports.post = [
  body('username')
    .exists({checkFalsy: true}).withMessage('username is required')
    .isLength({min: 6, max: 35}).withMessage('username is not valid')
    .isAlphanumeric().withMessage('username is not valid'),
  body('password')
    .exists({checkFalsy: true}).withMessage('password is required')
    .isLength({min: 6, max: 35}).withMessage('password is not valid')
    .isAlphanumeric().withMessage('password not valid'),
  validationInput,
  createInput,
  validateUser,
  createSession,
  updateUserSession,
  increaseTotalUserActive,
  deleteExpiredSessions,
  function (req, res) {
    let currentUser = {
      username: res.locals.user.username,
      last_login: res.locals.user.last_login,
      session: {
        _id: res.locals.user.session._id,
        created: res.locals.user.session.created,
        expired: res.locals.user.session.expired,
        token: res.locals.user.session.token
      },
      user_info: res.locals.user.user_info,
      user_role: res.locals.user.user_role,
    };

    res.cookie(
      'session',
      {id: res.locals.user.session._id, token: res.locals.user.session.token},
      {path: '/users', expires: new Date(res.locals.user.session.expired)}
    ).json({msg: 'login successful', user : currentUser});
  }
];

module.exports.delete = [
  deleteSession,
  updateUserSession,
  increaseTotalUserActive,
  deleteExpiredSessions,
  function (req, res) {
    res.cookie(
      'session',
      null,
      {path: '/users', expires: new Date(res.locals.user.session.expired)}
    ).json({msg: 'logout successful'});
  }
];