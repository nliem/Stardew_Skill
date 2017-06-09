var AWS = require('aws-sdk'); 
AWS.config.update({accessKeyId: 'AKIAJ5AMDOAVNDBRNWZQ', secretAccessKey: '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', region: "us-east-1"});
var dynamodb = new AWS.DynamoDB();

var params = {
    TableName: "Stardew",
    KeySchema: [{AttributeName: "_id", KeyType: "HASH"}],
    AttributeDefinitions: [{AttributeName: "_id", AttributeType: "N"}],
    ProvisionedThroughput: {       
        ReadCapacityUnits: 10, 
        WriteCapacityUnits: 10
    }
};

dynamodb.createTable(params, function(err, data) {
    if (err) {
        console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
    }
});