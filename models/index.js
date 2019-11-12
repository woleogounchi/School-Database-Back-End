// Create an instance of the Sequelize class and  
// configure it to use fsjstd-restapi.db
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: '../fsjstd-restapi.db'
});