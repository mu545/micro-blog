const {query, validationResult} = require('express-validator/check');

function validationInput(req, res, next) {
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({err: errors.array({onlyFirstError: true})});
  } else {
    next();
  }
}

function searchInput(req, res, next) {
  res.locals.input = {
    length: req.query.length > 0 ? req.query.length : 10,
    offset: req.query.offset > 0 ? req.query.offset : 0
  };
  res.locals.query = {};

  let or = [];

  if (typeof req.query.label != 'undefined') {
    or.push({label: {$regex: new RegExp(req.query.label, 'i')}});
  }

  if (or.length > 0) res.locals.query.$or = or;

  next();
}

module.exports.get = [
  query('length')
    .optional()
    .isNumeric().withMessage('length is not valid')
    .toInt(),
  query('offset')
    .optional()
    .isNumeric().withMessage('offset is not valid')
    .toInt(),
  query('label')
    .optional()
    .isLength({min: 1, max: 35}).withMessage('label not valid')
    .isAlphanumeric().withMessage('label not valid'),
  validationInput,
  searchInput,
  function (req, res) {
    req.models.labels.find(res.locals.query)
      .countDocuments()
      .exec(function (err, totalLabels) {
        if (err) {
          res.status(400).json({err: err.message});
        } else if (totalLabels < 1) {
          res.status(400).json({err: 'could not found labels'});
        } else {
          req.models.labels.find(res.locals.query)
            .skip(res.locals.input.offset)
            .limit(res.locals.input.length)
            .exec(function (err, labels) {
              if (err) {
                res.status(400).json({err: err.message});
              } else if (!labels) {
                res.status(400).json({err: 'could not found labels'});
              } else {
                res.json({labels: labels, total: totalLabels});
              }
            });
        }
      });
  }
];