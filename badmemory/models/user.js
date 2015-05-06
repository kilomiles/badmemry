var Sequelize = require('sequelize');

module.exports.setup = function(sequelize, models) {
  user = sequelize.define('user', {
    username: {type: Sequelize.STRING(30), primaryKey: true}, //set username as primary key
    email: Sequelize.STRING(50),
    password: Sequelize.STRING(60),
    // ... this is the ideal length for a bcrypt salted hash, as suggested by
    // http://security.stackexchange.com/questions/15738/database-field-type-for-password-storage

  },
  {
    tableName: 'user_info',
    timestamps: false
  });

  return user;
};
