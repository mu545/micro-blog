const {query, validationResult} = require('express-validator/check');

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

function getInput(req, res, next) {
  res.locals.input = {
    length: req.query.length > 0 ? req.query.length : 10,
    offset: req.query.offset > 0 ? req.query.offset : 0,
    username: req.query.username
  };
  res.locals.query = {};

  let or = [];

  if (typeof req.query.username != 'undefined') {
    or.push({username: new RegExp(res.locals.input.username, 'i')});
  }

  if (or.length > 0) res.locals.query.$or = or;

  next();
};

module.exports.get = [
  query('length')
    .optional({checkFalsy: true})
    .isNumeric().withMessage('length not valid')
    .toInt(),
  query('offset')
    .optional({checkFalsy: true})
    .isNumeric().withMessage('offset not valid')
    .toInt(),
  query('username')
    .optional({checkFalsy: true})
    .isLength({min: 1, max: 35}).withMessage('username is not valid')
    .isAlphanumeric().withMessage('username is not valid'),
  validationInput,
  getInput,
  function (req, res) {
    req.models.usersAccess.find(res.locals.query)
      .countDocuments()
      .exec(function (err, totalUser) {
        if (err) {
          res.status(400).json({err: err.message});
        } else if (totalUser < 1) {
          res.status(400).json({err: 'could not users found'});
        } else {
          req.models.usersAccess.find(res.locals.query)
            .select('username')
            .populate('user_info', 'name email phone')
            .populate('user_role', 'role')
            .skip(res.locals.input.offset)
            .limit(res.locals.input.length)
            .exec(function (err, users) {
              if (err) res.status(400).json({err: err.message});
              else res.json({users: users, total: totalUser});
            });
        }
      });

  }
];