'use strict';
const express = require('express');
const path = require('path');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');
const result = require('dotenv').config();
const cors = require('cors');
const sessions = require('./controllers/sessionsController');

if (result.error) {
  throw result.error
}

const router = express.Router();
router.get('/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write('<h1>Hello from Express.js!</h1>');
  res.end();
});
router.get('/another', (req, res) => res.json({ route: req.originalUrl }));
router.post('/', (req, res) => res.json({ postBody: req.body }));


app.use(bodyParser.json());
app.use('/.netlify/functions/server', router);  // path must route to lambda
app.use('/', (req, res) => res.sendFile(path.join(__dirname, '../index.html')));

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//app.use(logger({ path: "log/express.log" }));
app.use(cookieParser());
console.log(process.env.SESSION_SECRET);
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});
app.use('/sessions', sessions);


module.exports = app;
module.exports.handler = serverless(app);
