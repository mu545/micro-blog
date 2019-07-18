module.exports = function (req, res) {
  res.locals.template = {
    name: 'post-create',
    title: 'Create new post'
  };

  res.render('dashboard/layout');
};