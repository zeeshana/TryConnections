const result = require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
//const logger = require('express-logger');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const cors = require('cors');
const sessions = require('./controllers/sessionsController');
const app = express();

if (result.error) {
  throw result.error
}
 
console.log(result.parsed)

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//app.use(logger({ path: "log/express.log" }));
app.use(cookieParser());
console.log(process.env.SESSION_SECRET);
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));
/*
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    path: '/',
    httpOnly: true
  }
  }));
  */
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});
app.use('/sessions', sessions);
app.listen(3000, () => {
  console.log('App running on port 3000!');
});