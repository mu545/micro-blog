module.exports.main = function (req, res) {
  res.data.template = {
    name: 'dashboard',
    title: 'Dashboard'
  };

  res.render('dashboard/layout', res.data);
};