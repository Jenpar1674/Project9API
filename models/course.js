'use strict';
module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define('Course', {
    title: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: "Title is required"
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      validate: {
        notEmpty: {
          msg: "Description is required"
        }
      }
    },
    estimatedTime: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    materialsNeeded: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {});
  Course.associate = function(models) {
    // associations can be defined here
    Course.belongsTo(models.User, { 
      foreignKey: {
        fieldName: 'userId',
        allowNull: false,
      }
    });
  };
  return Course;
};

// 'use strict';
// module.exports = (sequelize, DataTypes) => {
//   const Course = sequelize.define('Course', {
//     id: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       autoIncrement: true
//   },
//   userId: {
//       type: DataTypes.INTEGER,
//       allowNull: true
//   },
//   title: {
//       type: DataTypes.STRING,
//       allowNull: false
//   },
//   description: {
//       type: DataTypes.TEXT,
//       allowNull: false
//   },
//   estimatedTime: {
//       type: DataTypes.STRING,
//       allowNull: true
//   },
//   materialsNeeded: {
//       type: DataTypes.STRING,
//       allowNull: true
//   }
// });
//   Course.associate = function(models) {
//     Course.belongsTo(models.User);
//     }
//     // associations can be defined here
//   };
//   return Course;
