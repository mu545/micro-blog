module.exports = function (req, res) {
  if (res.locals.user.user_role.role != 'admin') return res.render('errors/403');

  res.locals.template = {
    name: 'users',
    title: 'Users'
  };

  res.render('dashboard/layout', res.locals);
};