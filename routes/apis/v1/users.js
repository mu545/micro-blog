const {body, validationResult} = require('express-validator/check');

function validationInput(req, res, next) {
  if (res.locals.user.user_role.role != 'admin') {
    res.status(403).json({err: 'not allowed to action'});
  } else {
    let errors = validationResult(req);

    if (!errors.isEmpty()) res.status(400).json({err: errors.array({onlyFirstError: true})});
    else next();
  }
}

function searchUserQuery(req, res, next) {
  res.locals.query = {}

  let or = [];

  if (typeof req.query.name != 'undefined') or.push({name: req.query.name});
  if (typeof req.query.email != 'undefined') or.push({email: req.query.email});
  if (or.length > 0) res.locals.query.$or = or;

  next();
};

module.exports.get = [
  body('length')
    .optional()
    .isNumeric().withMessage('length not valid'),
  body('offset')
    .optional()
    .isNumeric().withMessage('offset not valid'),
  body('name')
    .optional()
    .matches(/^(a-z0-9)+$/i).withMessage('name not valid')
    .isLength({min: 1, max: 255}).withMessage('name not valid'),
  body('email')
    .optional()
    .isEmail().withMessage('email not valid')
    .isLength({min: 1, max: 225}).withMessage('email not valid'),
  validationInput,
  searchUserQuery,
  function (req, res) {
    req.models.usersAccess.find(res.locals.query)
      .select('username')
      .populate('user_info', 'name email phone')
      .populate('user_role', '-_id role')
      .exec(function (err, users) {
        if (err) res.status(400).json({err: err.message});
        else res.json({users: users});
      });
  }
];