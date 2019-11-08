# techdegree-project9
 This is the 9th project in Treehouse's Full Stack JavaScript Techdegree

## Overview of the project

 In this project, we’ll create a **REST API** using *Express*. The API will provide a way for users to administer a school database containing information about courses: users will be able interact with the database by retrieving a list of courses, as well as adding, updating and deleting courses in the database.

In addition, the project will require users to create an account and log-in to make changes to the database.

To complete this project, we’ll use our knowledge of *REST API* design, *Node.js*, and *Express* to create *API* routes, along with the *Sequelize ORM* for data modeling, validation, and persistence. To test the application, you'll use *Postman*, a popular application for exploring and testing REST APIs.

## Overview of the Provided Project Files

The following files have been supplied for us to use: 

* The `seed` folder containing a starting set of data for our database in the form of a JSON file (`data.json`) and a collection of files (`context.js`, `database.js`, and `index.js`) that can be used to create the app's database and populate it with data.

* The `app.js` file configures Express to serve a simple REST API. The `morgan` npm package has also been configured to log HTTP requests/responses to the console. Our job will be to update this file with the routes for the API.

* The `nodemon.js` file configures the nodemon Node.js module, which will be used to run our REST API.

* The `package.json` file (and the associated `package-lock.json` file) contain the project's npm configuration, which includes the project's dependencies.

* The `RESTAPI.postman_collection.json` file is a collection of Postman requests that can be used to test and explore our REST API.

## Getting Started

To get up and running with this project, the following commands have to be run from the root of the folder that contains this README file.

First, install the project's dependencies using `npm`.

```
npm install

```

Second, seed the SQLite database.

```
npm run seed
```

And lastly, start the application.

```
npm start
```

To test the Express server, browse to the URL [http://localhost:5000/](http://localhost:5000/).

