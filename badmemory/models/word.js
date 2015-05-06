var Sequelize = require('sequelize');

module.exports.setup = function(sequelize, models) {
  /* XXX This is inefficient, but each user has their own separate wordlist. While this means a potential massive duplication among users studying the same language, the security issue of having database rows belonging to multiple units is not something I wanted to bother with at this point. */
  word = sequelize.define('word', {
    text: Sequelize.STRING(127), // no word worth studying is longer than this
    definition: Sequelize.TEXT,   // will be fetched from dictionary
    examples: Sequelize.TEXT // value to be set by Glosbe 
  });

  models.user.hasOne(word, {as: 'user', foreignKey: 'userId'});

  return word;
};
