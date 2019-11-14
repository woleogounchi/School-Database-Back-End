const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class User extends Sequelize.Model {}
  User.init({
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please provide a value for "firstName"',
        },
        notEmpty: {
          msg: 'Please provide a value for "firstName"',
        },
      },
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please provide a value for "lastName"',
        },
        notEmpty: {
          msg: 'Please provide a value for "lastName"',
        },
      },
    },
    emailAddress: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please provide a value for "emailAddress"',
        },
        notEmpty: {
          msg: 'Please provide a value for "emailAddress"',
        },
      },
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please provide a value for "password"',
        },
        notEmpty: {
          msg: 'Please provide a value for "password"',
        },
      },
    }
  }, { sequelize });

  return User;
};