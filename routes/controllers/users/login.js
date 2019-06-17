module.exports.main = function (req, res) {
  res.send('login page');
};

module.exports.postLogin = function (req, res) {
  res.send('login api');
};