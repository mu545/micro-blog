module.exports = function (req, res) {
  res.locals.template = {
    name: 'home',
    title: 'Home'
  };

  res.render('public/layout');
};