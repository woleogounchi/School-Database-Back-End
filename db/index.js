const Sequelize = require('sequelize');

// Instantiate an instance of the Sequelize class and configure 
// the instance to use the fsjstd-restapi.db SQLite database
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'fsjstd-restapi.db',
  // global options, allows to set the properties for all tables 
  // in one place rather than having to set them separately.
  define: {
    freezeTableName: true,
    timestamps: false,
  },
  logging: false
});

const db = {
  sequelize,
  Sequelize,
  models: {},
};

db.models.Course = require('./models/course.js')(sequelize);
db.models.User = require('./models/user.js/user.js')(sequelize);

module.exports = db;