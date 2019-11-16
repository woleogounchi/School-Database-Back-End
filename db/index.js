'use strict';
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

// Instantiate an instance of the Sequelize class and configure 
// the instance to use the fsjstd-restapi.db SQLite database
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'fsjstd-restapi.db',
});
const models = {}; 
// Use authenticate() to test the connection to the 
// database and log a message to the console indicating
// if the connection was successfully made or failed
(async () => {
    await sequelize.authenticate();

    try {
        console.log('Connection successful');
        fs
            .readdirSync(path.join(__dirname, 'models'))
            .forEach((file) => {
                console.log(`Importing database model file ${file}`);
                const model = sequelize.import(path.join(__dirname, 'models', file));
                models[model.name] = model;
            });

        Object.keys(models).forEach((modelName) => {
            if (models[modelName].associate) {
                console.log(`Configuring the association for the ${modelName} model...`);
                models[modelName].associate(models);
            }
        });
    } catch (err) {
        console.log('Sorry there was a problem connecting')
    }

})();

const db = {
  sequelize,
  Sequelize,
  models: {},
};

module.exports = db;