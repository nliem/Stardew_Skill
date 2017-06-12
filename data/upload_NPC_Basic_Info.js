//Upload JSON file with NPC birthday/gift preferences to Stardew_NPC_Basic_Info Table
var $ = jQuery = require('jquery');
var fs = require('fs');
var AWS = require('aws-sdk');
var inputFile = 'NPC_Basic_Info.json';
var tableName = 'Stardew_NPC_Basic_Info';

AWS.config.update({
	accessKeyId: 'AKIAJBQOQ6VGLIRJBSMA',
	secretAccessKey: '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',
	region: 'us-east-1'
});

var docClient = new AWS.DynamoDB.DocumentClient();

console.log("Importing NPC_Basic_Info data into DynamoDB");

var allNPC = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

allNPC.forEach(function(NPC){
	var params = {
		TableName: tableName,
		Item:{
			"name": NPC.name,
			"birthday": NPC.birthday,
			"love": NPC.love,
			"like": NPC.like,
			"neutral": NPC.neutral,
			"dislike": NPC.dislike,
			"hate": NPC.hate
		}
	};

	docClient.put(params, function(err, data){
		if(err){
			console.error("Unable to add NPC " + NPC.name + ". Error JSON: " + JSON.stringify(err, null, 2));
		} else{
			console.log("PutItem succeeded: " + NPC.name);
		}
	});
});