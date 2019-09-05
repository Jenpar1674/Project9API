'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: DataTypes.INTEGER,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    emailAddress: DataTypes.STRING,
    password: DataTypes.STRING
  }, {});
  User.associate = function(models) {
    
      User.hasMany(models.Course);
    }
    // associations can be defined here
  };
  return User;
