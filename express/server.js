'use strict';
const express = require('express');
const path = require('path');
const serverless = require('serverless-http');
const app = express();
const cors = require('cors');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
//const result = require('dotenv').config();
const env = 
{
"TWITTER_CONSUMER_KEY" : "H4tX5qvfKJP3Vzee9NyV3B405",
"TWITTER_CONSUMER_SECRET" : "Sa1JL41MHS4fBRj7PWtergE6hvAIn441Tbzx9ZHlYjeNgXu0I1",
"TWITTER_CALLBACK_URL" : "http://localhost:8100/login",
"SESSION_SECRET" : "Sa1JL41MHS4fBRj7PWter"
};

const oauth = require('oauth');
const _twitterConsumerKey = env.TWITTER_CONSUMER_KEY;
const _twitterConsumerSecret = env.TWITTER_CONSUMER_SECRET;
const twitterCallbackUrl = env.TWITTER_CALLBACK_URL;
const consumer = new oauth.OAuth("https://twitter.com/oauth/request_token", "https://twitter.com/oauth/access_token",_twitterConsumerKey, _twitterConsumerSecret, "1.0A", twitterCallbackUrl, "HMAC-SHA1");

/*
if (result.error) {
  throw result.error
}
*/
const corsOptions = {
  origin: 'https://elated-snyder-eade88.netlify.com',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}


const router = express.Router();

router.get('/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write('<h1>Hello from Express.js!</h1>');
  res.end();
});
//router.get('/another', (req, res) => res.json({ route: req.originalUrl }));
//router.post('/', (req, res) => res.json({ postBody: req.body }));

router.get('/connect', cors(corsOptions) ,(req, res) => {
	console.log('connect inside');
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

router.get('/saveAccessTokens', (req, res) => {
	console.log("calling save access token");
  consumer.getOAuthAccessToken(
  req.query.oauth_token,
  req.session.oauthRequestTokenSecret,
  req.query.oauth_verifier,
  (error, oauthAccessToken, oauthAccessTokenSecret, results) => {
    if (error) {
      //logger.error(error);
	  console.log(error);
      res.send(error, 500);
    }
    else {
		console.log(results);
      req.session.oauthAccessToken = oauthAccessToken;
      req.session.oauthAccessTokenSecret = oauthAccessTokenSecret
	  
	  // here we have to save the user to back4app api with token.
	  // next time we will check if user is available in back4app then allow access.
	  
      return res.send({ message: 'token saved' });
    }
  });
});



app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(session({ secret: env.SESSION_SECRET, resave: false, saveUninitialized: true }));
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

app.use('/.netlify/functions/server', router);  // path must route to lambda
app.use('/', (req, res) => res.sendFile(path.join(__dirname, '../index.html')));


module.exports = app;
module.exports.handler = serverless(app);
