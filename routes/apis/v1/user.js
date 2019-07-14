const crypto = require('crypto');
const {param, body, validationResult} = require('express-validator/check');

function validationInput(req, res, next) {
  if (res.locals.user.user_role.role != 'admin') {
    res.status(403).json({err: 'not allowed to action'});
  } else {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({err: errors.array({onlyFirstError: true})});
    } else {
      next();
    }
  }
}

function isUserRoleIdExists(req, res, next) {
  req.models.userRoles.findOne(
    {_id: res.locals.input.role},
    function (err, userRole) {
      if (err) {
        res.status(400).json({err: err.message});
      } else if (!userRole) {
        res.status(400).json({err: 'uknown user role'})
      } else {
        res.locals.user_role = userRole;

        next();
      }
    });
}

function isUserInfoRegistered(req, res, next) {
  req.models.usersInfo.findOne(
    {email: res.locals.input.email},
    function (err, userInfo) {
      if (err) {
        res.status(400).json({err: err.message});
      } else if (userInfo) {
        res.status(400).json({err: 'email address has been used by other user'});
      } else {
        next();
      }
    });
};

function isUserAccessRegistered(req, res, next) {
  req.models.usersAccess.findOne(
    {username: res.locals.input.username},
    function (err, userAccess) {
      if (err) {
        res.status(400).json({err: err.message});
      } else if (userAccess) {
        res.status(400).json({err: 'username has been used by other user'});
      } else {
        next();
      }
    });
};

function createUserInfo(req, res, next) {
  let createUserInfo = new req.models.usersInfo({
    name: res.locals.input.name,
    email: res.locals.input.email,
    phone: res.locals.input.phone,
    registered: Date.now()
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

function createUserAccess(req, res, next) {
  let createUserAccess = new req.models.usersAccess({
    username: res.locals.input.username,
    password: crypto.createHash('md5').update(res.locals.input.password).digest('hex'),
    last_login: null,
    session: null,
    user_info: res.locals.user_info._id,
    user_role: res.locals.user_role._id
  });

  createUserAccess.save(function (err, userAccess) {
    if (err) {
      res.status(400).json({msg: err.message});
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
          {_id: res.locals.input.role},
          {$inc: {total_users: 1}},
          function (err) {
            if (err) res.status(400).json({err: err.message});
            else next();
          });
      }
    });
}

function isUserIdExists(req, res, next) {
  req.models.usersInfo.findOne(
    {_id: res.locals.input._id},
    function (err, userInfo) {
      if (err) {
        res.status(400).json({err: err.message});
      } else if (!userInfo) {
        res.status(400).json({err: 'could not found user'}); 
      } else {
        res.locals.user_info = userInfo;

        next();
      }
    });
};

function updateUserInfo(req, res, next) {
  let updateUserInfo = {
    name: res.locals.input.name,
    phone: res.locals.input.phone
  };

  req.models.usersInfo.updateOne(
    {_id: res.locals.input._id},
    {$set: updateUserInfo},
    function (err) {
      if (err) res.status(400).json({err: err.message});
      else next();
    });
}

function updateUserAccess(req, res, next) {
  let updateUserAccess = {
    user_role: res.locals.input.role
  };

  req.models.usersAccess.updateOne(
    {user_info: res.locals.input._id},
    {$set: updateUserAccess},
    function (err) {
      if (err) res.status(400).json({err: err.message});
      else next();
    }
  );
}

function createInput(req, res, next) {
  res.locals.input = {
    role: req.body.role,
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    username: req.body.username,
    password: req.body.password
  };

  next();
}

module.exports.post = [
  body('role')
    .exists({checkFalsy: true}).withMessage('role is required')
    .isMongoId().withMessage('role is not valid'),
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
  createInput,
  isUserRoleIdExists,
  isUserInfoRegistered,
  isUserAccessRegistered,
  createUserInfo,
  createUserAccess,
  increaseTotalUser,
  function (req, res) {
    let createdUser = {
      username: res.locals.user_access.username,
      user_info: {
        _id: res.locals.user_info._id,
        name: res.locals.user_info.name,
        email: res.locals.user_info.email,
        phone: res.locals.user_info.phone
      },
      user_role: {
        role: res.locals.user_role.role
      }
    };

    res.json({
      msg: 'successful created new user',
      user: createdUser
    });
  }
];

function updateInput(req, res, next) {
  res.locals.input = {
    _id: req.body._id,
    role: req.body.role,
    name: req.body.name,
    phone: req.body.phone,
  };

  next();
}

module.exports.put = [
  body('_id')
    .exists({checkFalsy: true}).withMessage('user id is required')
    .isMongoId().withMessage('user id not valid'),
  body('role')
    .exists({checkFalsy: true}).withMessage('role is required')
    .isMongoId().withMessage('role is not valid'),
  body('name')
    .exists({checkFalsy: true}).withMessage('name is required')
    .isLength({min: 6, max: 255}).withMessage('name is not valid')
    .matches(/^[a-z0-9 ]+$/i).withMessage('name is not valid'),
  body('phone')
    .exists({checkFalsy: true}).withMessage('phone number is required')
    .isLength({min: 10, max: 15}).withMessage('phone number is not valid')
    .isNumeric().withMessage('phone number is not valid'),
  validationInput,
  updateInput,
  isUserIdExists,
  isUserRoleIdExists,
  updateUserInfo,
  updateUserAccess,
  function (req, res) {
    res.json({msg: 'successful updated user'});
  }
];
