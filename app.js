"use strict";
const createError = require("http-errors");
const path = require("path");
// load modules
const express = require("express");
const logger = require("morgan");
//const routes = require('./routes');
const models = require("./models");
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const coursesRouter = require("./routes/courses");
// variable to enable global error logging
const enableGlobalErrorLogging =
  process.env.ENABLE_GLOBAL_ERROR_LOGGING === "true";

// create the Express app
const app = express();

app.use(logger("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/api/users", usersRouter);
app.use("/api/courses", coursesRouter);

// Redirect to api route
app.get("/", function(req, res, next) {
  res.redirect("/api");
});

// setup morgan which gives us http request logging
//app.use(morgan('dev'));

// TODO setup your api routes here

const sequelize = models.sequelize;
//const { User, Course } = models;

// setup a friendly greeting for the root route
// app.get('/', (req, res) => {
//   res.json({
//     message: 'Welcome to the REST API project!',
//   });
// });
// Redirect to api route
// app.get("/", function(req, res, next) {
//   res.redirect("/api");
// });
//send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: "Route Not Found"
  });
});

// setup a global error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500).json({
    message: err.message,
    error: {}
  });

  // render the error page
  res.status(err.status || 500);
  res.json(err);
});

//set our port
app.set("port", process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get("port"), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});

module.exports = app;
