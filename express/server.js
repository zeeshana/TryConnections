'use strict';
const express = require('express');
const path = require('path');
const serverless = require('serverless-http');
const app = express();
const session = require('express-session');
const bodyParser = require('body-parser');
//const result = require('dotenv').config();

const oauth = require('oauth');
const _twitterConsumerKey = process.env.TWITTER_CONSUMER_KEY;
const _twitterConsumerSecret = process.env.TWITTER_CONSUMER_SECRET;
const twitterCallbackUrl = process.env.TWITTER_CALLBACK_URL;
const consumer = new oauth.OAuth("https://twitter.com/oauth/request_token", "https://twitter.com/oauth/access_token",_twitterConsumerKey, _twitterConsumerSecret, "1.0A", twitterCallbackUrl, "HMAC-SHA1");

/*
if (result.error) {
  throw result.error
}
*/
const env = 
{
"TWITTER_CONSUMER_KEY" : "H4tX5qvfKJP3Vzee9NyV3B405",
"TWITTER_CONSUMER_SECRET" : "Sa1JL41MHS4fBRj7PWtergE6hvAIn441Tbzx9ZHlYjeNgXu0I1",
"TWITTER_CALLBACK_URL" : "http://localhost:8100/login",
"SESSION_SECRET" : "Sa1JL41MHS4fBRj7PWter"
};

const router = express.Router();
router.get('/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write('<h1>Hello from Express.js!</h1>');
  res.end();
});
router.get('/another', (req, res) => res.json({ route: req.originalUrl }));
router.post('/', (req, res) => res.json({ postBody: req.body }));
router.get('/connect', (req, res) => {
	console.log('connect insite');
  consumer.getOAuthRequestToken(function (error, oauthToken,   oauthTokenSecret, results) {
    if (error) {
      res.send(error, 500);
    } else {
      req.session.oauthRequestToken = oauthToken;
      req.session.oauthRequestTokenSecret = oauthTokenSecret;
      const redirect = { 
redirectUrl: `https://twitter.com/oauth/authorize?oauth_token=${req.session.oauthRequestToken}`
    }
      res.send(redirect);
    }
  });
});


app.use(bodyParser.json());
app.use('/.netlify/functions/server', router);  // path must route to lambda
app.use('/', (req, res) => res.sendFile(path.join(__dirname, '../index.html')));

app.use(session({ secret: env.SESSION_SECRET, resave: false, saveUninitialized: true }));

module.exports = app;
module.exports.handler = serverless(app);
