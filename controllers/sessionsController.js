const express = require('express');
const router = express.Router();
const CryptoJS = require("crypto-js");
const oauth = require('oauth');
const _twitterConsumerKey = process.env.TWITTER_CONSUMER_KEY;
const _twitterConsumerSecret = process.env.TWITTER_CONSUMER_SECRET;
const twitterCallbackUrl = process.env.TWITTER_CALLBACK_URL;
const consumer = new oauth.OAuth("https://twitter.com/oauth/request_token", "https://twitter.com/oauth/access_token",_twitterConsumerKey, _twitterConsumerSecret, "1.0A", twitterCallbackUrl, "HMAC-SHA1");

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

module.exports = router;