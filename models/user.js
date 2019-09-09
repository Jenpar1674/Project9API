// 
'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    firstName: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: "First Name is required"
        }
      }
    },
    lastName: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: "Last Name is required"
        }
      }
    },
    emailAddress: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: "Email Address is required"
        },
        isEmail: true,
      }
    },
    password: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: "Password is required"
        }
      }
    },
  }, {});
  User.associate = function(models) {
    // associations can be defined here
    User.hasMany(models.Course, { 
      foreignKey: {
        fieldName: 'userId',
        allowNull: false,
      }
    });
  };
  return User;
};