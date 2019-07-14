const {query, validationResult} = require('express-validator/check');

function validationInput(req, res, next) {
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({err: err.array({onlyFirstError: true})});
  } else {
    next();
  }
}

function getInput(req, res, next) {
  res.locals.input = {
    length: req.query.length > 0 ? req.query.length : 10,
    offset: req.query.offset > 0 ? req.query.offset : 0,
    role: req.query.role
  };
  res.locals.query = {};

  let or = [];

  if (typeof res.locals.input.role != 'undefined') {
    or.push({role: {$regex: new RegExp(res.locals.input.role, 'i')}});
  }

  if (or.length > 0) req.locals.query.$or = or;

  next();
}

module.exports.get = [
  query('length')
    .optional()
    .isNumeric().withMessage('length is not valid'),
  query('offset')
    .optional()
    .isNumeric().withMessage('offset is not valid'),
  query('role')
    .optional()
    .isAlphanumeric().withMessage('role is not valid'),
  validationInput,
  getInput,
  function (req, res) {
    req.models.userRoles.find(res.locals.query, function (err, userRoles) {
      if (err) res.status(400).json({err: err.message});
      else res.json({roles: userRoles});
    });
  }
];