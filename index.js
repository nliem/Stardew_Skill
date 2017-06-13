'use strict';

/**
Skill for accessing quick resources for Stardew Valley

*/

var AWS = require("aws-sdk");

var dynamodb = new AWS.DynamoDB.DocumentClient();

var NPC_Basic_Info = "Stardew_NPC_Basic_Info";
var Universal_Definitions = "Stardew_Universal_Definitions";
var Event_Birthday_Calendar = "Stardew_Event_Birthday_Calendar";

/*
		HELPER FUNCTIONS
*/

/*Helper which builds all of the responses*/
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

/*Parses NPC slot value to return the base NPC value*/
function processNPC(NPC){
	var result = "";
	var possessive = "\'s";
	var The = "The";
	var the = "the";

	if(NPC.indexOf(possessive) !== -1){
		NPC = NPC.substring(0, (NPC.length-2));
	}
	if(NPC.indexOf(the) !== -1 || NPC.indexOf(The)!== -1){
		NPC = NPC.substring(4);
	}
	result = NPC.charAt(0).toUpperCase() + NPC.slice(1);
	if(result === 'Mayor'){
		result = 'Lewis';
	}

	return result;
}

/*Parses Preference slot value to return the base Preference value*/
function processPreference(preference){
	var result = preference;
	var lastChar = preference.charAt(preference.length - 1);
	if(lastChar === 'd' || lastChar === 's'){
		result = preference.substring(0, (preference.length-1))
	}
	return result;
}

/*
		FUNCTIONS TO CONTROL THE SKILL'S BEHAVIOR
*/

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
		var NPC = processNPC(npcSlot.value);
		var birthday = '';

		console.log("NPC to Query: " + NPC);

		var params = {
			TableName : NPC_Basic_Info,
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
				if(NPC === "Wizard" || NPC === "Dwarf"){
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
	    NPC = processNPC(npcSlot.value);
		preference = processPreference(preferenceSlot.value);
	} else{
		throw new Error('Insufficient information for handleGiftIntent');
	}

	var params = {
		TableName : NPC_Basic_Info,
		Key : {
			"name" : NPC
		}
	};

	dynamodb.get(params, function(err, data){
		if(err || data.Item == null){
			console.error("Unable to fetch NPC " + NPC + ": " + JSON.stringify(err, null, 2));
			speechOutput = "I can't recognize the NPC you are asking about. Please try again.";
			repromptText = "Sorry, I didn't understand the NPC you are asking about. Try again.";
			callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
		} else{
			console.log("GetItem succeeded: " + JSON.stringify(data, null, 2));
			var giftsList = data.Item[preference];
			console.log("Gift list for " + preference + " : " + giftsList);
			var giftsPhrase = "";
			for(var i = 0; i < giftsList.length; i++){
				if(i === (giftsList.length - 1)){
					giftsPhrase += ', and ' + giftsList[i];
				} else if (i === 0){
					giftsPhrase += giftsList[i];
				} else{
					giftsPhrase += ', ' + giftsList[i];
				}
			}

			if(NPC === "Wizard" || NPC === "Dwarf"){
				speechOutput = "The ";
			}
			if(preference === "neutral"){
				speechOutput += NPC + " feels neutral about the following items: " + giftsPhrase;
			} else{
				speechOutput += NPC + " " + preference + "s the following items: " + giftsPhrase;
			}
			repromptText = "You can ask me about other NPC's birthdays and gift preferences.";
			callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
		}
	});
}

function handleUniversalIntent(intent, session, callback){
	const cardTitle = intent.name;
	const preferenceSlot = intent.slots.Preference;
	let repromptText = '';
	let speechOutput = '';
	let sessionAttributes = {};
	const shouldEndSession = false;
	var preference;

	if(preferenceSlot){
		preference = processPreference(preferenceSlot.value);
	} else{
		throw new Error('Insufficient information for handleUniversalIntent');
	}

	var params = {
		TableName: Universal_Definitions,
		Key: {
			"category": preference
		}
	};

	dynamodb.get(params, function(err, data){
		if(err || data.Item == null){
			console.error("Unable to fetch Universal definition for " + preference + " : " + JSON.stringify(err, null, 2));
			speechOutput = "I can't recognize the Universal Preference you are asking about. Please try again.";
			repromptText = "Sorry, I didn't understand the Universal Preference you are asking about. Try again.";
			callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
		} else{
			console.log("GetItem succeeded: " + JSON.stringify(data, null, 2));
			var universals = data.Item.items;
			var universalsPhrase = '';
			for(var i = 0; i < universals.length; i++){
				if(i === 0){
					universalsPhrase += universals[i];
				} else if(i === (universals.length-1)){
					universalsPhrase += ', and ' + universals[i];
				} else{
					universalsPhrase += ', ' + universals[i];
				}
			}

			speechOutput = "The Universals " + preference + "s are : " + universalsPhrase;
			repromptText = "You can ask me for other Universal definitions and NPC information.";
			callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
		}
	});
}

function handleEventIntent(intent, session, callback){
	const cardTitle = intent.name;
	const seasonSlot = intent.slots.Season;
	const dateSlot = intent.slots.Date;
	let repromptText = '';
	let speechOutput = '';
	let sessionAttributes = {};
	const shouldEndSession = false;
	var season, rawSeason, date;

	if(seasonSlot && dateSlot){
		rawSeason = seasonSlot.value;
		console.log(rawSeason);
		season = rawSeason.charAt(0).toUpperCase() + rawSeason.slice(1);
		console.log(season);
		date = dateSlot.value.toString();
	} else{
		throw new Error('Insufficient information for handleEventIntent');
	}

	var params = {
		TableName: Event_Birthday_Calendar,
		Key: {
			"season": season
		}
	};

	console.log("Attempting to retrieve object with key: "  + season);
	dynamodb.get(params, function(err, data){
		if(err || data == null){
			console.error("Unable to fetch the event for " + season + " " + date + " : " + JSON.stringify(err, null, 2));
			speechOutput = "I can't recognize the date you're asking about. Please try again.";
			repromptText = "Sorry, I didn't recognize the date you're asking about. Try again.";
			callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
		} else{
			console.log("GetItem succeeded: " + JSON.stringify(data, null, 2));
			var eventDescription = data.Item[date];
			if(eventDescription === null){
				speechOutput = "Sorry, the date you specified is out of range. Please try again. Each season has 28 days."
			} else{
				speechOutput = eventDescription;
			}
			repromptText = "You can ask me about other dates or about NPC's'.";
			callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
		}
	});
}

/*
		EVENT HANDLER FUNCTIONS
*/

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
	} else if(intentName === 'GiftIntent'){
		handleGiftIntent(intent, session, callback);
	} else if(intentName === 'UniversalIntent'){
		handleUniversalIntent(intent, session, callback);
	} else if(intentName === 'EventIntent'){
		handleEventIntent(intent, session, callback);
	} else{
		throw new Error ('Invalid Intent');
	}
}

function onSessionEnded(sessionEndedRequest, session){
	console.log('onSessionEnded requestId=${sessionEndedRequest.requestId}, sessionId=${session.sessionId}');
	//optional cleanup logic here
}

/*
		MAIN HANDLER
*/

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
