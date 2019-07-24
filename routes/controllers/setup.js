const fs = require('fs');
const crypto = require('crypto');
const mongoose = require('mongoose');
const {body, validationResult} = require('express-validator/check');

function validationInput(req, res, next) {
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({err: errors.array({onlyFirstArray: true})});
  } else {
    next();
  }
}

function updateEnv(req, res, next) {
  let environment = `
    SETUP_START=${process.env.SETUP_START || false}
    SETUP_MONGO=${process.env.SETUP_MONGO || false}
    SETUP_USER=${process.env.SETUP_USER || false}

    MONGO_STRING=${process.env.MONGO_STRING || false}
    MONGO_USERNAME=${process.env.MONGO_USERNAME || false}
    MONGO_PASSWORD=${process.env.MONGO_PASSWORD || false}
  `;

  fs.writeFile('./.env', environment.replace(/^\s*/mg, ''), function (err) {
    if (err) {
      res.status(400).json({err: err.message});
    } else {
      next();
    }
  });
}

function connectToMongo(req, res, next) {
  mongoose.connect(res.locals.input.mongo_string, {
      useNewUrlParser: true,
      user: res.locals.input.username,
      pass: res.locals.input.password
    },
    function (err) {
      if (err) {
        res.status(400).json({err: err.message});
      } else {
        next();
      }
    });
}

function dummySystemInformation(req, res, next) {
  let createSystemInformation = new req.models.systemInformation({
    total_users: 0,
    total_active_users: 0
  });

  createSystemInformation.save(function (err) {
    if (err) {
      res.status(400).json({err: err.message});
    } else {
      next();
    }
  });
}

function dummyUserRoles(req, res, next) {
  let createUserRoles = [
      {role: 'admin', total_users: 0},
      {role: 'author', total_users: 0},
      {role: 'user', total_users: 0}
    ];

  req.models.userRoles.create(createUserRoles, function (err, userRoles) {
    if (err) {
      res.status(400).json({err: err.message});
    } else {
      res.locals.user_roles = userRoles;

      next();
    }
  });
}

function getUserAdminId(req, res, next) {
  req.models.userRoles.findOne(
    {role: 'admin'},
    function (err, userRole) {
      if (err) {
        res.status(400).json({err: err.message});
      } else if (!userRole) {
        res.status(400).json({err: 'no user role admin'});
      } else {
        res.locals.user_role = userRole;

        next();
      }
    });
}

function dummyUserInfo(req, res, next) {
  let createUserInfo = new req.models.usersInfo({
    name: res.locals.input.name,
    email: res.locals.input.email,
    phone: res.locals.input.phone,
    registered: new Date()
  });

  createUserInfo.save(function (err, userInfo) {
    if (err) {
      res.status(400).json({err: err.message});
    } else {
      res.locals.user_info = userInfo;

      next();
    }
  });
}

function dummyUserAccess(req, res, next) {
  let createUserAccess = new req.models.usersAccess({
    username: res.locals.input.username,
    password: crypto.createHash('md5')
                .update(res.locals.input.password)
                .digest('hex'),
    last_login: null,
    session: null,
    user_info: res.locals.user_info,
    user_role: res.locals.user_role
  });

  createUserAccess.save(function (err, userAccess) {
    if (err) {
      res.status(400).json({err: err.message});
    } else {
      res.locals.user_access = userAccess;

      next();
    }
  });
}

function increaseTotalUser(req, res, next) {
  req.models.systemInformation.updateOne(
    {},
    {$inc: {total_users: 1}},
    function (err) {
      if (err) {
        res.status(400).json({err: err.message});
      } else {
        req.models.userRoles.updateOne(
          {_id: res.locals.user_role._id},
          {$inc: {total_users: 1}},
          function (err) {
            if (err) res.status(400).json({err: err.message});
            else next();
          });
      }
    });
}

let getSetup = [
  function (req, res) {
    if (typeof process.env.SETUP_START === 'undefined'
      || process.env.SETUP_START === 'false') {
      res.locals.template = {
        name: 'setup-start',
        title: 'Start'
      };
    } else if (typeof process.env.SETUP_MONGO === 'undefined'
      || process.env.SETUP_MONGO === 'false') {
      res.locals.template = {
        name: 'setup-mongo',
        title: 'Mongo'
      };
    } else if (typeof process.env.SETUP_USER === 'undefined'
      || process.env.SETUP_USER === 'false') {
      res.locals.template = {
        name: 'setup-user',
        title: 'User'
      };
    } else {
      res.locals.template = {
        name: 'setup-complete',
        title: 'Complete'
      };
    }

    res.render('setup/layout');
  }
];

let postStart = [
  function (req, res, next) {
    process.env.SETUP_START = true;

    updateEnv(req, res, function () {
      res.json({msg: 'successful created environment file'});
    });
  }
];

function inputPostMongo(req, res, next) {
  res.locals.input = {
    mongo_string: req.body.mongo_string,
    username: req.body.username,
    password: req.body.password
  };

  next();
}

let postMongo = [
  body('mongo_string')
    .exists().withMessage('mongo string is required'),
  body('username')
    .exists().withMessage('username is required'),
  body('password')
    .exists().withMessage('password is required'),
  validationInput,
  inputPostMongo,
  connectToMongo,
  dummySystemInformation,
  dummyUserRoles,
  function (req, res) {
    process.env.SETUP_MONGO = true;
    process.env.MONGO_STRING = res.locals.input.mongo_string;
    process.env.MONGO_USERNAME = res.locals.input.username;
    process.env.MONGO_PASSWORD = res.locals.input.password;

    updateEnv(req, res, function () {
      res.json({msg: 'successful setup mongo connection'});
    });
  }
];

function inputPostUser(req, res, next) {
  res.locals.input = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    username: req.body.username,
    password: req.body.password
  };

  next();
}

let postUser = [
  body('name')
    .exists({checkFalsy: true}).withMessage('name is required')
    .isLength({min: 6, max: 255}).withMessage('name is not valid')
    .matches(/^[a-z0-9 ]+$/i).withMessage('name is not valid'),
  body('email')
    .exists({checkFalsy: true}).withMessage('email is required')
    .isLength({min: 1, max: 225}).withMessage('email is not valid')
    .isEmail().withMessage('email is not valid'),
  body('phone')
    .exists({checkFalsy: true}).withMessage('phone number is required')
    .isLength({min: 10, max: 15}).withMessage('phone number is not valid')
    .isNumeric().withMessage('phone number is not valid'),
  body('username')
    .exists({checkFalsy: true}).withMessage('username is required')
    .isLength({min: 6, max: 35}).withMessage('username is not valid')
    .isAlphanumeric().withMessage('username is not valid'),
  body('password')
    .exists({checkFalsy: true}).withMessage('password is required')
    .isLength({min: 6, max: 35}).withMessage('password is not valid')
    .isAlphanumeric().withMessage('password is not valid'),
  body('confirm')
    .custom(function (value, {req}) {
      if (value != req.body.password) return new Error('confirm password not match');
      else return value;
    }),
  validationInput,
  inputPostUser,
  getUserAdminId,
  dummyUserInfo,
  dummyUserAccess,
  increaseTotalUser,
  function (req, res) {
    process.env.SETUP_USER = true;

    updateEnv(req, res, function () {
      res.json({msg: 'successful setup user'});
    });
  }
];

module.exports = function (router) {
  router.get('/*', getSetup);
  router.post('/api/v1/start', postStart);
  router.post('/api/v1/mongo', postMongo);
  router.post('/api/v1/user', postUser);
};