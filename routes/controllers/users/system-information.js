module.exports.getSystemInformation = function (req, res) {
  req.models.systemInformation.findOne(function (err, systemInformation) {
    if (err) {
      res.status(400).json({err: err.message});
    } else {
      res.json({
        total_users: systemInformation.total_users,
        total_active_users: systemInformation.total_active_users
      });
    }
  });
};