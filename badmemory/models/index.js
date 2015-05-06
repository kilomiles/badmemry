module.exports.setup = function(sequelize) {
  var Sequelize = sequelize;

  var models = {};

  // NB: The following models are activated in the order that they depend on one
  // another; later models may include earlier ones as foreign keys. Observe
  // that the definition of `models.sentence` makes use of the definition of
  // `models.word` and that both rely on the definition of `models.user`.
  models.user = require('./user').setup(sequelize, models);
  models.page = require('./page').setup(sequelize, models);
  models.word = require('./word').setup(sequelize, models);
  models.sentence = require('./sentence').setup(sequelize, models);

  /* TODOXXX set up relationships and join tables */

  return models;
};
