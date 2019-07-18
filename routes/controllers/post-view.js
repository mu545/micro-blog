module.exports = function (req, res) {
  res.locals.template = {
    name: 'post-view',
    title: 'Post'
  };

  res.render('public/layout');
};