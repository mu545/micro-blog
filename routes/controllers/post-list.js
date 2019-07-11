module.exports = function (req, res) {
  res.locals.template = {
    name: 'post-list',
    title: 'List posts'
  };

  res.render('dashboard/layout');
};