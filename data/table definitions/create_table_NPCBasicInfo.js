var AWS = require('aws-sdk'); 
AWS.config.update({
    accessKeyId: 'AKIAJAVDR2Q7T2HYWJ3A', 
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