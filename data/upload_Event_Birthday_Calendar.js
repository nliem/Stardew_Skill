//Upload JSON file with Event and Birthday information to Stardew_Event_Birthday_Calendar table
var fs = require('fs');
var AWS = require('aws-sdk');
var inputFile = 'Event_Birthday_Calendar.json';
var tableName = 'Stardew_Event_Birthday_Calendar';
AWS.config.loadFromPath('../config.json');
var docClient = new AWS.DynamoDB.DocumentClient();

console.log("Importing Event_Birthday_Calendar data into DynamoDB");

var allEvents = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

allEvents.forEach(function(event){
	var params = {
		TableName: tableName,
		Item:{
			"season": event.season,
			"days": event.days
		}
	};

	docClient.put(params, function(err, data){
		if(err){
			console.error("Unable to add data for season " + event.season + " : " + JSON.stringify(err, null, 2));
		} else{
			console.log("PutItem succeeded: " + event.season);
		}
	});
});