const {body, validationResult} = require('express-validator/check');

module.exports.validation = [
  body('username')
    .exists({checkFalsy: true}).withMessage('username is required')
    .isAlphanumeric().withMessage('username not valid')
    .isLength({min: 6, max: 35}).withMessage('username not valid'),
  body('password')
    .exists({checkFalsy: true}).withMessage('password is required')
    .isAlphanumeric().withMessage('password not valid')
    .isLength({min: 6, max: 35}).withMessage('password not valid')
];

module.exports.main = function (req, res) {
  res.render('auth/login');
};

module.exports.postLogin = function (req, res) {
  let errors = validationResult(req);

  if (!errors.isEmpty()) return res.status(400).json({err: errors.array({onlyFirstError: false})});

  req.models.userAccess.validateUser(
    req.body.username,
    req.body.password,
    function (err, userAccess) {
      if (err) return res.status(400).json({err: err.message});

      req.models.session.createSession(function (err, session, token) {
          if (err) return res.status(400).json({err: err.message});

          req.models.userAccess.updateSession(
            userAccess._id,
            session._id,
            function (err, result) {
              if (err) return res.status(400).json({err: err.message});

              res.cookie('session', {id: session._id, token: token}, {path: '/users', expires: new Date(Date.now() + (1000 * 60) * 120)})
                .json({msg: 'login successful'});
            });
        });
    });
};