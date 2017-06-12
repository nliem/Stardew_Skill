var AWS = require('aws-sdk'); 
AWS.config.update({
    accessKeyId: 'AKIAJBQOQ6VGLIRJBSMA', 
    secretAccessKey: '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', 
    region: "us-east-1"
});
var dynamodb = new AWS.DynamoDB();

var params = {
    TableName: "Stardew_NPC_Basic_Info",
    KeySchema: [{AttributeName: "name", KeyType: "HASH"}],
    AttributeDefinitions: [{AttributeName: "name", AttributeType: "S"}],
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