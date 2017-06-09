var $ = jQuery = require('jquery'); 
var fs = require('fs'); 
require('./jquery.csv.js');  
var AWS = require('aws-sdk');
var inputFile = "stardew.csv"
 

function populate_table(data){
		
	AWS.config.update({accessKeyId: 'AKIAJ5AMDOAVNDBRNWZQ', secretAccessKey: '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', region: "us-east-1"});
	var dynamodb = new AWS.DynamoDB.DocumentClient();

	for(i=0;i<data.length;i++){
		var manager = new Row_Manager(data[i]);
		var stardew_data = create_json(manager.get_npc_name(), manager.get_birthday(), manager.get_love(), manager.get_like(), manager.get_neutral(), manager.get_dislike(), manager.get_hate());
	    var params = {
	        TableName: "Stardew_Data",
	        Item: stardew_data
	    };
		dynamodb.put(params, function(err, data) {
		       if (err) {
		           console.error("Unable to add npc",manager.get_npc_name(), ". Error JSON:", JSON.stringify(err, null, 2));
		       } else {
		           console.log("PutItem succeeded:", manager.get_npc_name());
		       }
		});	    
	}	
}


function create_json(name, birthday, love, like, neutral, dislike, hate){
	var result = {"name":name, "birthday":birthday, "love":love, "like":like, "neutral":neutral, "dislike":dislike, "hate":hate};
	//console.log(result)
	return result;


}
function Row_Manager(row){
	this.row = row;
	this.get_npc_name = function(){
		if(this.row[0]){
			return this.row[0]
		}
	}
	this.get_birthday = function(){
		if(this.row[1]){
			return this.row[1]
		}
	}
	this.get_love = function(){
		if(this.row[2]){
			return this.row[2]
		}
	}
	this.get_like = function(){
		if(this.row[3]){
			return this.row[3]
		}
	}
	this.get_neutral = function(){
		if(this.row[4]){
			return this.row[4]
		}
	}
	this.get_dislike = function(){
		if(this.row[5]){
			return this.row[5]
		}
	}
	this.get_hate = function(){
		if(this.row[6]){
			return this.row[6]
		}
	}
}


fs.readFile(inputFile, 'utf8', function(err, data){
	  if (err) throw err;
  	 
  	  var csv_array = $.csv.toArrays(data);
  	  //console.log(csv_array);
  	  populate_table(csv_array);
});




