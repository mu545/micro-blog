module.exports = function (req, res) {
  res.locals.template = {
    name: 'dashboard',
    title: 'Dashboard'
  };

  res.render('dashboard/layout', res.locals);
};