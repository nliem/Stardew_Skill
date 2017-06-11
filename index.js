'use strict';

/**
Skill for accessing quick resources for Stardew Valley

*/

/*Helper which builds all of the responses*/

var AWS = require("aws-sdk");

AWS.config = new AWS.Config();

AWS.config.accessKeyID = "AKIAJ5AMDOAVNDBRNWZQ";
AWS.config.secretAccessKey = "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";
AWS.config.region = "us-east-1";

var dynamodb = new AWS.DynamoDB.DocumentClient();

var NPC_Data_Table = "Stardew_Data";

function buildSpeechletResponse(title, output, repromptText, shouldEndSession){
	return{
		outputSpeech: {
			type: 'PlainText',
			text: output,
		},
		card:{
			type: 'Simple',
			title: 'SessionSpeechelet - ${title}',
			content: 'SessionSpeechelet - ${output}'
		},
		reprompt:{
			outputSpeech:{
				type: 'PlainText',
				text: repromptText,
			}
		},
		shouldEndSession
	};
}

function buildResponse(sessionAttributes, speechletResponse){
	return{
		version: '1.0',
		sessionAttributes,
		response: speechletResponse
	};
}

/*Functions to control the skill's behavior*/

function getWelcomeResponse(callback){
	const sessionAttributes = {}; //optional session attributes could be added here
	const cardTitle = 'Welcome';
	const speechOutput = 'Welcome to Stardew. Please ask me about an NPC by saying phrases like ' + 
		'What gifts does Clint love?' + ' or ' + 'When is Emily\'s birthday?';
	const repromptText = 'Please ask me about an NPC by saying phrases like ' + 
		'What gifts does Clint love?' + ' or ' + 'When is Emily\'s birthday?';
	const shouldEndSession = false;

	callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function handleSessionEndRequest(callback){
	const cardTitle = 'Session Ended';
	const speechOutput = 'Thank you for using Stardew.';
	const shouldEndSession = true;
	callback({}, buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
}

function handleBirthdayIntent(intent, session, callback){
	const cardTitle = intent.name;
	const npcSlot = intent.slots.NPC;
	let repromptText = '';
	let sessionAttributes = {};
	const shouldEndSession = false;
	let speechOutput = '';

	if (npcSlot.value){
		var NPC = npcSlot.value;
		var birthday = '';
		var hadThe = false;
		
		//ensure that possessive/'the' version of NPC's name is properly formatted
		var possesive = "\'s";
		if(NPC.indexOf(possesive) !== -1){
			//NPC string is possessive
			NPC = NPC.substring(0, (NPC.length-2));
		}

		var the = "The";
		if(NPC.indexOf(the) !== -1){
			//NPC string contains 'the'
			NPC = NPC.substring(4);
			hadThe = true;
		}

		console.log("NPC to Query: " + NPC);

		var params = {
			TableName : NPC_Data_Table,
			Key : {
				"name" : NPC
			}
		};		
		
		dynamodb.get(params, function(err, data){
			if(err || data.Item == null){
				console.error("Unable to fetch NPC item: ", JSON.stringify(err, null, 2));
				speechOutput = "I can't recognize the NPC you are asking about. Please try again.";
				repromptText = "Sorry, I didn't understand the NPC you are asking about. Try again.";
				callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
			} else{
				console.log("GetItem succeeded: ", JSON.stringify(data, null, 2));
				birthday = data.Item.birthday.toString();
				console.log("Birthday Value: " + birthday);
				console.log("TOEIJOWEIJWEOFIWEJ");
				console.log("Post query Birthday Value: " + birthday);

				if(hadThe){
					speechOutput = "The ";
				}
				speechOutput += NPC + "\'s birthday is on " + birthday + ".";
				repromptText = "You can ask me about other NPC's birthdays and gift preferences.";
				callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
			}
		});



	} else{
		speechOutput = "I can't recognize the NPC you are asking about. Please try again.";
		repromptText = "Sorry, I didn't understand the NPC you are asking about. Try again.";
		callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
	}

	
}

function handleGiftIntent(intent, session, callback){
	const cardTitle = intent.name;
	const npcSlot = intent.slots.NPC;
	const preferenceSlot = intent.slots.Preference;
	let repromptText = '';
	let sessionAttributes = {};
	const shouldEndSession = false;
	let speechOutput = '';
	var NPC, preference, gifts;

	if(npcSlot && preferenceSlot){
	    NPC = npcSlot.value;
		preference = preferenceSlot.value;
	} else{
		throw new Error('Insufficient information for handleGiftIntent');
	}

	if(preference === 'loves'){
		preference = 'love';
	}
	if(preference === 'likes'){
		preference = 'like';
	}

	if(NPC === "Clint" || NPC === "Clint's"){
		gifts = Clint[preference];
	} else if (NPC === "Emily" || NPC === "Emily's"){
		gifts = Emily[preference];
	} else{
		throw new Error('Invalid NPC for handleGiftIntent');
	}

	var giftsPhrase = '';
	for(var i = 0; i < gifts.length; i++){
		if(i === (gifts.length - 1)){
			giftsPhrase += ', and ' + gifts[i];
		} else if (i === 0){
			giftsPhrase += gifts[i];
		} else{
			giftsPhrase += ', ' + gifts[i];
		}
	}

	speechOutput = NPC + ' ' + preference + "s the following items: " + giftsPhrase;
	repromptText = "You can ask me about other NPC's birthdays and gift preferences.";

	callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

/*Event handlers*/

function onSessionStarted(sessionStartedRequest, session){
	console.log('onSessionStarted requestId=${sessionStartedRequest.requestId}, sessionId=${session.sessionID}');
}

function onLaunch(launchRequest, session, callback){
	console.log('onLaunch requestId=${launchRequest.requestId}, sessionId=${session.sessionID}');

	getWelcomeResponse(callback);
}

//Called when user specifies an intent for this skill
function onIntent(intentRequest, session, callback){
	console.log('onIntent requestId=${intentRequest.requestId}, sessionId=${session.sessionId}');

	const intent = intentRequest.intent;
	const intentName = intent.name;

	//dispatch intent to appropriate handler
	if(intentName === 'BirthdayIntent'){
		handleBirthdayIntent(intent, session, callback);
	}
	else if(intentName === 'GiftIntent'){
		handleGiftIntent(intent, session, callback);
	}
	else{
		throw new Error ('Invalid Intent');
	}
}

function onSessionEnded(sessionEndedRequest, session){
	console.log('onSessionEnded requestId=${sessionEndedRequest.requestId}, sessionId=${session.sessionId}');
	//optional cleanup logic here
}

/*Main Handler*/

//Routes the incoming request based on type (LaunchRequest, IntentRequest, etc.)
//The JSON body of th erequest is provided in the event parameter
exports.handler = (event, context, callback) => {
	try{
		console.log('event.session.application.applicationId=${event.session.application.applicationId}');

		/*
        if (event.session.application.applicationId !== 'amzn1.echo-sdk-ams.app.[unique-value-here]') {
             callback('Invalid Application ID');
        }
        */

        if (event.session.new){
        	onSessionStarted({requestId: event.request.requestId}, event.session);
        }
        if (event.request.type === 'LaunchRequest'){
        	onLaunch(event.request, event.session, (sessionAttributes, speechletResponse) => 
        		{callback(null, buildResponse(sessionAttributes, speechletResponse));});
        } else if (event.request.type === 'IntentRequest'){
        	onIntent(event.request, event.session, (sessionAttributes, speechletResponse) =>
        		{callback(null, buildResponse(sessionAttributes, speechletResponse));});
        } else if (event.request.type === 'sessionEndedRequest'){
        	onSessionEnded(event.request, event.session);
        	callback();
        }
	} catch (error){
		callback(error);
	}
};
