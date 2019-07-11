module.exports = function (req, res) {
  res.locals.template = {
    name: 'post-update',
    title: 'Update post'
  };

  res.render('dashboard/layout');
};