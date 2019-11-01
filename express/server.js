'use strict';
const express = require('express');
const path = require('path');
const serverless = require('serverless-http');
const app = express();
const cors = require('cors');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const uuid = require('uuid');

//const result = require('dotenv').config();
var Parse = require('parse/node');
 Parse.initialize("z5etbrSgUBGg93mKcmWajXsAU2eDHLkO0Zrsoolb", "X5BDbzZUvn7MmFwyZnQOpB1zwR1WuTGtG10AK9h8");
 Parse.serverURL = 'https://parseapi.back4app.com/';
	

const env = 
{
"TWITTER_CONSUMER_KEY" : "H4tX5qvfKJP3Vzee9NyV3B405",
"TWITTER_CONSUMER_SECRET" : "Sa1JL41MHS4fBRj7PWtergE6hvAIn441Tbzx9ZHlYjeNgXu0I1",
//"TWITTER_CALLBACK_URL" : "https://elated-snyder-eade88.netlify.com/login",
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

//router.get('/connect', cors(corsOptions) ,(req, res) => {
router.get('/connect',(req, res) => {
	 console.log("------------------------ connect ---------------------------");
	console.log('connect inside');
  consumer.getOAuthRequestToken(function (error, oauthToken,   oauthTokenSecret, results) {
	  console.log("oauthToken : " + oauthToken);
	  console.log("oauthTokenSecret : " + oauthTokenSecret);
	  console.log("results : ");
	  console.log(results);
	  
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
	
	getAuthToken(req, res).then(()=> {
		
		console.log('getAuthToken - Done...');
		getUserDetails(req, res);
	
	});
	
	//const promise2 = getUserDetails();
	
	//Promise.all([promise1,promise2]).then(values => console.log(values););
 
});

router.get('/verify', (req, res) => {
	console.log("calling verify function");
	console.log("req.session.oauthAccessToken" + req.session.oauthAccessToken);
		consumer.get("https://api.twitter.com/1.1/account/verify_credentials.json",req.session.oauthRequestToken, req.session.oauthRequestTokenSecret, function (error, data, response) {
			console.log('inside');
				  if (error) {
						console.log(error);
						return res.send(error, 500);
					  //res.redirect('/sessions/connect');
					  // res.send("Error getting twitter screen name : " + util.inspect(error), 500);
				  } else {
					  var parsedData = JSON.parse(data);
						console.log(parsedData);
					// req.session.twitterScreenName = response.screen_name;    
					return res.send('You are signed in: ' + parsedData.screen_name);
				  } 
				});
});

function getAuthToken(req, res)
{
	return new Promise((resolve,reject) => {
			 consumer.getOAuthAccessToken(req.query.oauth_token, req.session.oauthRequestTokenSecret, req.query.oauth_verifier,(error, oauthAccessToken, 	oauthAccessTokenSecret, results) => {
					  console.log("------------------------ saveAccessTokens ---------------------------");
					  console.log("oauthAccessToken : " + oauthAccessToken);
					  console.log("oauthAccessTokenSecret : " + oauthAccessTokenSecret);
					  console.log("results : ");
					  console.log(results);
					if (error) {
					  //logger.error(error);
					  console.log(error);
					  res.send(error, 500);
					  reject("500 error hai");
					}
					else {
						console.log('Inside ELSE ');
						//console.log(results);
					  req.session.oauthAccessToken = oauthAccessToken;
					  req.session.oauthAccessTokenSecret = oauthAccessTokenSecret
					  
					  // here we have to save the user to back4app api with token.
					  // next time we will check if user is available in back4app then allow access.
						console.log('Calling verify credentials');
					 
						//return getUserDetails();
						
						console.log('Ending Else');
					  //return res.send({ message: 'token saved' });
					  resolve();
					}
					
		  });
  
	});
	
}


async function getUserByUsername(username)
{
	console.log('inside getUserByUsername');
	const query = new Parse.Query(Parse.User);
	query.equalTo("username",username );
	
	return await query.first();
	
	
}


async function getUserDetails(req,res){
	return new Promise((resolve,reject) => {
	console.log("calling verify function");
	console.log("req.session.oauthAccessToken" + req.session.oauthAccessToken);

	consumer.get("https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true", req.session.oauthAccessToken, req.session.oauthAccessTokenSecret, function (error, data, response) {
			console.log('inside');
				  if (error) {
						console.log(error);
						res.send(error, 500);
					  //res.redirect('/sessions/connect');
					  // res.send("Error getting twitter screen name : " + util.inspect(error), 500);
				  } else {
					  var parsedData = JSON.parse(data);
						console.log(parsedData);
					// req.session.twitterScreenName = response.screen_name;  
					if(parsedData.email == null || parsedData.email == "" )
					{
						//return error;
					}
					
					
	//const U = Parse.Object.extend("GameScore");
					
					
	console.log('Is Object Already there ?');
	//const object =  await getUserByUsername(parsedData.screen_name);
					
	const query = new Parse.Query(Parse.User);
	query.equalTo("username",parsedData.screen_name );
	
	query.first().then(object => {
					console.log(object);
					
					if(object != null && object.get('username') != '')
					{
						res.status(200).json({"message":"User already registered" ,"username" : object.get("username"), "token": object.get("oauth_verifier") });
						return;
						
					}
					else
					{
					var user = new Parse.User();
					user.set("userId", parsedData.id + "");
					user.set("username", parsedData.screen_name);
					user.set("password", req.query.oauth_verifier);
					user.set("oauth_verifier", req.query.oauth_verifier);
					user.set("email", parsedData.email);
					user.set("twitterAccessToken", req.session.oauthAccessToken);
					user.set("twitterAccessTokenSecret", req.session.oauthAccessTokenSecret);
					user.set("phone", "");
				  
					user.signUp().then(function(user) {
						console.log('User created successful with name: ' + user.get("username") + ' and email: ' + user.get("email"));
						
						//TODO: insert into person table
						const Person = Parse.Object.extend("Person");
						var person = new Person();
						person.set("handle", parsedData.screen_name);
						person.set("name", parsedData.name);
						person.set("tagline", ""); 
						person.set("website", parsedData.website);
						person.set("website_short_url", parsedData.website_short_url);
						person.set("email", parsedData.email);
						person.set("dob", parsedData.dob);
						person.set("joined", new Date());
						person.set("location", "");
						person.set("photo", "https://avatars.io/twitter/" + parsedData.screen_name);
						person.set("accessToken", "");
						person.set("providerId", "");
						person.set("secret", "Twitter");
						person.set("signInMethod", "");
						person.set("uid", parsedData.id + "");
						person.set("publishedProfile", true);
						person.set("role", "user");
						
						 person.save().then((response) => {
							console.log("Person Save :" + response);
							res.status(200).json({"message":"New user has been created" ,"username" : user.get("username"), "token":req.query.oauth_verifier});
						  }, (error) => {
								console.log("Person Save Error :" + error)
								user.destroy();
								res.status(error.code).json({"Person save - Error":error.message});
						  });
 
						
					}).catch(function(error){
						user.destroy();
						console.log("Signup - Error: " + error.code + " " + error.message);
						res.status(error.code).json({"error":error.message});
						
					});
						
						
					}
					
	}).catch(error=>{
					
res.status(error.code).json({"error":error.message});
	});
					
				  } 
				});
		
		
				
	});
}



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
