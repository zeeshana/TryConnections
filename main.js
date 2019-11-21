var moment = require("moment");

 Parse.Cloud.define("hello", function(request, response){
 	console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@ hellooooooooooooo");
	response.success("Hello world!");
	
 });

 
  Parse.Cloud.define("registerActivity", function(request, response){
 	console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@ hellooooooooooooo");
	response.success("Hello world!");
	
 });



 
 //require("./app.js");