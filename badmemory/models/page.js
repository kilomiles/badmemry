var Sequelize = require('sequelize');

module.exports.setup = function(sequelize, models) {
  page = sequelize.define('page', {
    title: Sequelize.TEXT,
    url: Sequelize.TEXT
  });

  models.user.hasOne(page, {as: 'user', foreignKey: 'userId'});

  return page;
};
