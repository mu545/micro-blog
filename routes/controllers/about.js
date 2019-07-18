module.exports = function (req, res) {
  res.locals.template = {
    name: 'about',
    title: 'About'
  };

  res.render('public/layout');
};