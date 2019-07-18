const {body, validationResult} = require('express-validator/check');

function validationInput(req, res, next) {
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({err: errors.array({onlyFirstError: true})});
  } else {
    next();
  }
}

function isLabelExists(req, res, next) {
  req.models.labels.findOne(
    {label: res.locals.input.label},
    function (err, label) {
      if (err) res.status(400).json({err: err.message});
      else if (label) res.status(400).json({err: 'label has been created'});
      else next();
    });
}

function createLabel(req, res, next) {
  let createLabel = new req.models.labels({
    label: res.locals.input.label,
    total_posts: 0
  });

  createLabel.save(function (err, label) {
    if (err) {
      res.status(400).json({err: err.message});
    } else {
      res.locals.label = label;

      next();
    }
  });
}

function isLabelIdExists(req, res, next) {
  req.models.labels.findOne(
    {_id: res.locals.input._id},
    function (err, label) {
      if (err) {
        res.status(400).json({err: err.message});
      } else if (label) {
        res.locals.label = label;

        next();
      } else {
        res.status(400).json({err: 'could not found label'});
      }
    });
};

function updateLabel(req, res, next) {
  let updateLabel = {
    label: res.locals.input.label
  };

  req.models.labels.updateOne(
    {_id: res.locals.input._id},
    {$set: updateLabel},
    function (err) {
      if (err) res.status(400).json({err: err.message});
      else next();
    }
  );
};

function createInput(req, res, next) {
  res.locals.input = {
    label: req.body.label
  };

  next();
}

module.exports.post = [
  body('label')
    .exists({checkNull: true, checkFalsy: true}).withMessage('label is required')
    .isLength({min: 6, max: 35}).withMessage('label is not valid')
    .isAlphanumeric().withMessage('label is not valid'),
  validationInput,
  createInput,
  isLabelExists,
  createLabel,
  function (req, res) {
    let createLabel = {
      label: res.locals.label.label,
      total_posts: res.locals.label.total_posts
    };

    res.json({msg: 'successful create new label', label: createLabel});
  }
];

function updateInput(req, res, next) {
  res.locals.input = {
    _id: req.body._id,
    label: req.body.label
  };

  next();
}

module.exports.put = [
  body('_id')
    .exists({checkNull: true, checkFalsy: true}).withMessage('label id is required')
    .isMongoId().withMessage('label id not valid'),
  body('label')
    .exists({checkNull: true, checkFalsy: true}).withMessage('label is required')
    .isLength({min: 6, max: 35}).withMessage('label is not valid')
    .isAlphanumeric().withMessage('label is not valid'),
  validationInput,
  updateInput,
  isLabelIdExists,
  isLabelExists,
  updateLabel,
  function (req, res) {
    res.json({msg: 'successful updated label'});
  }
];