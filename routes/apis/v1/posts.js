const {query, validationResult} = require('express-validator/check');

function validationInput(req, res, next) {
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({err: errors.array({onlyFirstError: true})});
  } else {
    next();
  }
}

function getInput(req, res, next) {
  res.locals.input = {
    length: req.query.length > 0 ? req.query.length : 10,
    offset: req.query.offset > 0 ? req.query.offset : 0
  };
  res.locals.query = {};

  let or = [];

  if (typeof req.query.title != 'undefined') {
    or.push({title: {$regex: new RegExp(req.query.title, 'i')}});
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
  query('title')
    .optional()
    .matches(/^[a-z0-9 ]+$/i).withMessage('title is not valid'),
  validationInput,
  getInput,
  function (req, res) {
    req.models.posts.find(res.locals.query)
      .countDocuments()
      .exec(function (err, totalPosts) {
        if (err) {
          res.status(400).json({err: err.message});
        } else if (totalPosts < 1) {
          res.status(400).json({err: 'could not found posts'});
        } else {
          req.models.posts.find(res.locals.query)
            .select('title subtitle created updated')
            .populate('labels', '_id label')
            .populate('created_by', '_id name')
            .skip(res.locals.input.offset)
            .limit(res.locals.input.length)
            .exec(function (err, posts) {
              if (err) {
                res.status(400).json({err: err.message});
              } else if (!posts) {
                res.status(400).json({err: 'could not found posts'});
              } else {
                res.json({posts: posts, total: totalPosts});
              }
            });
        }
      });
  }
];