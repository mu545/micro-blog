const {body, query, validationResult} = require('express-validator/check');

function validationInput(req, res, next) {
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({err: errors.array({onlyFirstError: true})});
  } else {
    next();
  }
}

function isLabelsExists(req, res, next) {
  let queryLabels = [];

  for (var labelId of res.locals.input.labels) {
    if (queryLabels.indexOf(labelId) < 0) queryLabels.push(labelId);
  }

  req.models.labels.find(
    {_id: {$in: queryLabels}},
    function (err, labels) {
      if (err) {
        res.status(400).json({err: err.message});
      } else if (!labels) {
        res.status(400).json({err: 'uknown label'});
      } else {
        res.locals.labels = [];

        for (var label of labels) {
          if (queryLabels.indexOf(label._id.toString()) > -1) {
            res.locals.labels.push(label._id);
          } else {
            res.status(400).json({err: `uknown label ${label._id}`})

            break;
          }
        }

        if (res.locals.labels.length == queryLabels.length) next();
      }
    }
  );
}

function createPost(req, res, next) {
  let createPost = new req.models.posts({
    title: res.locals.input.title,
    subtitle: res.locals.input.subtitle,
    labels: res.locals.input.labels,
    created_by: res.locals.user.user_info._id,
    created: new Date(),
    updated: null,
    content: res.locals.input.content
  });

  createPost.save(function (err) {
    if (err) res.status(400).json({err: err.message});
    else next();
  });
}

function increaseLabelsTotalPosts(req, res, next) {
  req.models.labels.updateMany(
    {_id: {$in: res.locals.labels}},
    {$inc: {total_posts: 1}},
    function (err) {
      if (err) res.status(400).json({err: err.message});
      else next();
    });
}

function isPostIdExists(req, res, next) {
  req.models.posts.findOne(
    {_id: res.locals.input._id},
    function (err, post) {
      if (err) {
        res.status(400).json({err: err.message});
      } else if (!post) {
        res.status(400).json({err: 'could not found post'});
      } else {
        res.locals.post = post;

        next();
      }
    });
}

function updatePost(req, res, next) {
  let updatePost = {
    title: res.locals.input.title,
    subtitle: res.locals.input.subtitle,
    labels: res.locals.input.labels,
    content: res.locals.input.content,
    updated: new Date()
  };

  req.models.posts.updateOne(
    {_id: res.locals.input._id},
    {$set: updatePost},
    function (err) {
      if (err) {
        res.status(400).json({err: err.message});
      } else {
        res.locals.input.labels = res.locals.post.labels;

        next();
      }
    });
}

function deletePost(req, res, next) {
  req.models.posts.deleteOne(
    {_id: res.locals.input._id},
    function (err) {
      if (err) {
        res.status(400).json({err: err.message});
      } else {
        res.locals.input.labels = res.locals.post.labels;

        next();
      }
    });
}

function decreaseLabelsTotalPosts(req, res, next) {
  req.models.labels.updateMany(
    {_id: {$in: res.locals.input.labels}},
    {$inc: {total_posts: -1}},
    function (err) {
      if (err) res.status(400).json({err: err.message});
      else next();
    });
}

function createInput(req, res, next) {
  res.locals.input = {
    title: req.body.title,
    subtitle: req.body.subtitle,
    labels: req.body.labels,
    content: req.body.content
  };

  next();
}

module.exports.post = [
  body('title')
    .exists({checkNull: true, checkFalsy: true}).withMessage('title is required')
    .matches(/^[a-z0-9 ]+$/i).withMessage('title is not valid'),
  body('subtitle')
    .exists({checkFalsy: true}).withMessage('subtitle is required')
    .matches(/^[a-z0-9 ]+$/i).withMessage('subtitle is not valid'),
  body('labels')
    .exists({checkNull: true, checkFalsy: true}).withMessage('labels is required')
    .isArray().withMessage('labels is not valid')
    .isMongoId().withMessage('labels is not valid'),
  body('content')
    .exists({checkNull: true, checkFalsy: true}).withMessage('content is required'),
  validationInput,
  createInput,
  isLabelsExists,
  createPost,
  increaseLabelsTotalPosts,
  function (req, res) {
    res.json({msg: 'successful created new post'});
  }
];

function getInput(req, res, next) {
  res.locals.input = {
    _id: req.query._id
  };

  next();
}

module.exports.get = [
  query('_id')
    .exists({checkNull: true, checkFalsy: true}).withMessage('post id is required')
    .isMongoId().withMessage('post id is not valid'),
  validationInput,
  getInput,
  isPostIdExists,
  function (req, res) {
    let post = {
      _id: res.locals.post._id,
      title: res.locals.post.title,
      subtitle: res.locals.post.subtitle,
      labels: res.locals.post.labels,
      content: res.locals.post.content
    };

    res.json({post: post});
  }
];

function updateInput(req, res, next) {
  res.locals.input = {
    _id: req.body._id,
    title: req.body.title,
    subtitle: req.body.subtitle,
    labels: req.body.labels,
    content: req.body.content
  };

  next();
}

module.exports.put = [
  body('title')
    .exists({checkNull: true, checkFalsy: true}).withMessage('title is required')
    .matches(/^[a-z0-9 ]+$/i).withMessage('title is not valid'),
  body('subtitle')
    .exists({checkFalsy: true}).withMessage('subtitle is required')
    .matches(/^[a-z0-9 ]+$/i).withMessage('subtitle is not valid'),
  body('labels')
    .exists({checkNull: true, checkFalsy: true}).withMessage('labels is required')
    .isArray().withMessage('labels is not valid')
    .isMongoId().withMessage('labels is not valid'),
  body('content')
    .exists({checkNull: true, checkFalsy: true}).withMessage('content is required'),
  validationInput,
  updateInput,
  isPostIdExists,
  isLabelsExists,
  updatePost,
  decreaseLabelsTotalPosts,
  increaseLabelsTotalPosts,
  function (req, res) {
    res.json({msg: 'successful updated post'});
  }
];

function deleteInput(req, res, next) {
  res.locals.input = {
    _id: req.body._id
  };

  next();
}

module.exports.delete = [
  body('_id')
    .exists({checkNull: true, checkFalsy: true}).withMessage('post id is required')
    .isMongoId().withMessage('post id is not valid'),
  validationInput,
  deleteInput,
  isPostIdExists,
  deletePost,
  decreaseLabelsTotalPosts,
  function (req, res) {
    res.json({msg: 'successful deleted post'});
  }
];