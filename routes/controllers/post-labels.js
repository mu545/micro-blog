module.exports = function (req, res) {
  res.locals.template = {
    name: 'post-labels',
    title: 'List labels post'
  };

  res.render('dashboard/layout');
};