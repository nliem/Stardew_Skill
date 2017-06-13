//Upload JSON file with NPC birthday/gift preferences to Stardew_NPC_Basic_Info Table
var fs = require('fs');
var AWS = require('aws-sdk');
var inputFile = 'Universal_Definitions.json';
var tableName = 'Stardew_Universal_Definitions';

AWS.config.loadFromPath('../config.json');

var docClient = new AWS.DynamoDB.DocumentClient();

console.log("Importing Universal_Definitions data into DynamoDB");

var allUniversals = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

allUniversals.forEach(function(universal){
	var params = {
		TableName: tableName,
		Item:{
			"category": universal.category,
			"items": universal.items,
		}
	};

	docClient.put(params, function(err, data){
		if(err){
			console.error("Unable to add NPC " + universal.category + ". Error JSON: " + JSON.stringify(err, null, 2));
		} else{
			console.log("PutItem succeeded: " + universal.category);
		}
	});
});