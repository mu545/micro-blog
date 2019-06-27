const crypto = require('crypto');
const {param, body, validationResult} = require('express-validator/check');

function validationInput(req, res, next) {
  if (res.locals.user.user_role.role != 'admin') {
    res.status(403).json({err: 'not allowed to action'});
  } else {
    let errors = validationResult(req);

    if (!errors.isEmpty()) res.status(400).json({err: errors.array({onlyFirstError: true})});
    else next();
  }
}

function isRoleExists(req, res, next) {
  req.models.userRoles.findOne({role: req.body.role}, function (err, userRole) {
    if (err) {
      res.status(400).json({err: err.message});
    } else if (!userRole) {
      res.status(400).json({err: 'uknown user role'});
    } else {
      res.locals.createUser = {
        user_role: userRole
      };

      next();
    }
  });
}

function isUserInfoExists(req, res, next) {
  req.models.usersInfo.findOne({email: req.body.email}, function (err, userInfo) {
    if (err) res.status(400).json({err: err.message});
    else if (userInfo) res.status(400).json({err: 'email address has been used by other user'});
    else next();
  });
};

function isUserAccessExists(req, res, next) {
  req.models.usersAccess.findOne({username: req.body.username}, function (err, userAccess) {
    if (err) res.status(400).json({err: err.message});
    else if (userAccess) res.status(400).json({err: 'username has been used by other user'});
    else next();
  });
};

function createUserInfo(req, res, next) {
  let createUserInfo = new req.models.usersInfo({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    registered: Date.now()
  });

  createUserInfo.save(function (err, userInfo) {
    if (err) {
      res.status(400).json({err: err.message});
    } else {
      res.locals.createUser.user_info = userInfo;

      next();
    }
  });
}

function createUserAccess(req, res, next) {
  let createUserAccess = new req.models.usersAccess({
    username: req.body.username,
    password: req.body.password,
    last_login: null,
    session: null,
    user_info: res.locals.createUser.user_info._id,
    user_role: res.locals.createUser.user_role._id
  });

  createUserAccess.save(function (err, userAccess) {
    if (err) {
      res.status(400).json({msg: err.message});
    } else {
      res.locals.createUser.username = userAccess.username;

      next();
    }
  });
}

function newUserCreated(req, res, next) {
  req.models.systemInformation.newUserCreated(function (err) {
    if (err) res.status(400).json({err: err.message});
    else next();
  })
}

function updateUserRole(req, res, next) {
  req.models.userRoles.updateOne(
    {_id: res.locals.createUser.user_role._id},
    {$inc: {total_users: 1}},
    function (err) {
      if (err) res.status(400).json({err: err.message});
      else next();
    });
}

module.exports.post = [
  body('role')
    .exists({checkFalsy: true}).withMessage('role is required')
    .isAlpha().withMessage('role not valid')
    .isLength({min: 1, max: 255}).withMessage('role not valid'),
  body('name')
    .exists({checkFalsy: true}).withMessage('name is required')
    .matches(/^[a-z0-9 ]+$/i).withMessage('name not valid')
    .isLength({min: 6, max: 255}).withMessage('name not valid'),
  body('email')
    .exists({checkFalsy: true}).withMessage('email is required')
    .isEmail().withMessage('email not valid')
    .isLength({min: 1, max: 225}).withMessage('email not valid'),
  body('phone')
    .exists({checkFalsy: true}).withMessage('phone number is required')
    .isNumeric().withMessage('phone number not valid')
    .isLength({min: 10, max: 15}).withMessage('phone number not valid'),
  body('username')
    .exists({checkFalsy: true}).withMessage('username is required')
    .isAlphanumeric().withMessage('username not valid')
    .isLength({min: 6, max: 35}).withMessage('username not valid'),
  body('password')
    .exists({checkFalsy: true}).withMessage('password is required')
    .isAlphanumeric().withMessage('password not valid')
    .isLength({min: 6, max: 35}).withMessage('password not valid'),
  body('confirm')
    .custom(function (value, {req}) {
      if (value != req.body.password) return new Error('confirm password not match');
      else return value;
    }),
  validationInput,
  isRoleExists,
  isUserInfoExists,
  isUserAccessExists,
  createUserInfo,
  createUserAccess,
  newUserCreated,
  updateUserRole,
  function (req, res) {
    let createUser = {
      username: res.locals.createUser.username,
      user_info: {
        _id: res.locals.createUser.user_info._id,
        name: res.locals.createUser.user_info.name,
        email: res.locals.createUser.user_info.email,
        phone: res.locals.createUser.user_info.phone
      },
      user_role: {
        role: res.locals.createUser.user_role.role
      }
    };

    res.json({
      msg: 'successful created new user',
      user: createUser
    });
  }
];

function isUserIdExists(req, res, next) {
  req.models.usersInfo.findOne({_id: req.body._id}, function (err, userInfo) {
    if (err) {
      res.status(400).json({err: err.message});
    } else if (!userInfo) {
      res.status(400).json({err: 'could not found user'}); 
    } else {
      res.locals.updateUser = {
        user_info: userInfo
      };

      next();
    }
  });
};

function isUserRoleExists(req, res, next) {
  if (typeof req.body.role == 'undefined') return next();

  req.models.userRoles.findOne({role: req.body.role}, function (err, userRole) {
    if (err) {
      res.status(400).json({err: err.message});
    } else if (!userRole) {
      res.status(400).json({err: 'uknown user role'})
    } else {
      res.locals.updateUser.user_role = userRole;

      next();
    }
  });
}

function updateUserAccess(req, res, next) {
  let updateAccess = {};
  let totalUpdate = 0;

  if (typeof req.body.role != 'undefined') {
    updateAccess.user_role = res.locals.updateUser.user_role._id;
    totalUpdate++;
  }

  if (totalUpdate == 0) return next();

  req.models.usersAccess.updateOne(
    {user_info: res.locals.updateUser.user_info._id},
    {$set: updateAccess},
    function (err) {
      if (err) res.status(400).json({err: err.message});
      else next();
    }
  );
}

function updateUserInfo(req, res, next) {
  let updateInfo = {};
  let totalUpdate = 0;

  if (typeof req.body.name != 'undefined') {
    updateInfo.name = req.body.name;
    totalUpdate++;
  }
  if (typeof req.body.phone != 'undefined') {
    updateInfo.phone = req.body.phone;
    totalUpdate++;
  }

  if (totalUpdate == 0) return next();

  req.models.usersInfo.updateOne(
    {_id: res.locals.updateUser.user_info._id},
    {$set: updateInfo},
    function (err) {
      if (err) res.status(400).json({err: err.message});
      else next();
    });
}

module.exports.put = [
  body('_id')
    .exists({checkFalsy: true}).withMessage('user id is required')
    .isMongoId().withMessage('user id not valid'),
  body('role')
    .optional()
    .exists({checkFalsy: true}).withMessage('role is required')
    .isAlpha().withMessage('role not valid')
    .isLength({min: 1, max: 255}).withMessage('role not valid'),
  body('name')
    .optional()
    .exists({checkFalsy: true}).withMessage('name is required')
    .matches(/^[a-z0-9 ]+$/i).withMessage('name not valid')
    .isLength({min: 6, max: 255}).withMessage('name not valid'),
  body('phone')
    .optional()
    .exists({checkFalsy: true}).withMessage('phone number is required')
    .isNumeric().withMessage('phone number not valid')
    .isLength({min: 10, max: 15}).withMessage('phone number not valid'),
  validationInput,
  isUserIdExists,
  isUserRoleExists,
  updateUserAccess,
  updateUserInfo,
  function (req, res) {
    res.json({msg: 'successful updated user'});
  }
];
