module.exports = function (req, res) {
  res.locals.template = {
    name: 'contact',
    title: 'Contact'
  };

  res.render('public/layout');
};