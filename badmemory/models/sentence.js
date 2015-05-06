var Sequelize = require('sequelize');

module.exports.setup = function(sequelize, models) {
  // TODOXXX text setter needs to automatically populate list of words
  // TODOXXX setters for SuperMemo2 data fields
  sentence = sequelize.define('sentence', {
    text: Sequelize.TEXT,

    // SuperMemo data fields -- XXX will need to handle the included time zones
    lastStudied: Sequelize.DATE,
    nextStudied: Sequelize.DATE,
    numReviews: Sequelize.INTEGER,

    // The difference between lastStudied and nextStudied:
    interval: Sequelize.INTEGER, // units in days

    // Roughly how much the interval gets multiplied by in the next review:
    eFactor: Sequelize.FLOAT

    // XXX I use a FLOAT value for the interval because (a) Sequelize does not
    // support a time-interval type which would make sense to use here, and (b) 
    // the user will never review cards *exactly* when the algorithm suggests
    // anyways, so some imprecision in how the interval is calculated is quite
    // tolerable for our purposes. This complicates the arithmetic for
    // calculating nextStudied a bit.
  });

  // All in all, Sequelize's associations look weirdly backwards:
  models.user.hasOne(sentence, {as: 'user', foreignKey: 'userId'});
  models.page.hasOne(sentence);  // obtained from some particular page
  // TODOXXX reference the list of words in the sentence

  return sentence;
};
