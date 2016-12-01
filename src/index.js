
var Alexa = require('alexa-sdk');

exports.handler = function(event, context, callback){

    var alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    alexa.execute();

};

var handlers = {
    'LaunchRequest': function () {
        this.attributes['repCounts'] = [];
        
        var say = 'Welcome to Workout Buddy! How long would you like to do a Tabata workout for?';
        this.emit(':ask', say, 'try again');
    },

    'DurationIntent': function() {
        var myDuration = this.event.request.intent.slots.duration.value;
        var numRounds = this.event.request.intent.slots.rounds.value;
        var workoutLengthText = '';
        if (numRounds === undefined) {
            numRounds = myDuration * 2;
            workoutLengthText = myDuration + ' minute';
        } else {
            workoutLengthText = numRounds + ' round';
        }
        
        this.attributes['numRounds'] = numRounds;
        this.attributes['curRound'] = 1;

        var say = 'You asked for a ' + workoutLengthText + ' workout. Get ready.'
                  + ' <break time="300ms"/> ' + threeSecondCountdown('Go')
                  + audioFile() 
                  + threeSecondCountdown('Rest')
                  + ' How many reps did you finish?'
        this.emit(':ask', say, 'try again');
    },

    'RepCountIntent': function() {
        var myReps = parseInt(this.event.request.intent.slots.reps.value);
        var repCounts = this.attributes['repCounts'];
        var numRounds = this.attributes['numRounds'];
        var curRound = this.attributes['curRound'];

        repCounts.push(myReps);
        curRound = curRound + 1;
        
        this.attributes['curRound'] = curRound;
        this.attributes['repCounts'] = repCounts;
        
        var say = '';
        if (curRound <= numRounds) {
            say = 'Okay. Get ready for round ' + curRound + '.'
                  + ' <break time="5s"/> ' + threeSecondCountdown('Go')
                  + audioFile() 
                  + threeSecondCountdown('Rest')
                  + ' How many reps did you finish?'
        
            this.emit(':ask', say, 'try again');
        } else {
            var score = arrayMin(repCounts);
            say = 'Okay. Well done on completing your workout! Your score is ' + score + ' reps.'
        
            this.emit(':tell', say, 'try again');
        }
    },

    'AMAZON.HelpIntent': function () {
        this.emit(':ask', 'Say how many minutes or rounds you would like to do a Tabata workout for.', 'try again');
    },

    'AMAZON.StopIntent': function () {
        var say = 'Goodbye';

        this.emit(':tell', say );
    }
}

function audioFile() {
    return ' <audio src="https://s3.amazonaws.com/alexa-workout-buddy/tabata-workout-encoded.mp3" /> ';
}

function threeSecondCountdown(prompt) {
    return 'Three'
         + ' <break time="1s"/> Two'
         + ' <break time="1s"/> One'
         + ' <break time="1s"/> ' + prompt + '.';
}

function arrayMin(arr) {
  return arr.reduce(function (p, v) {
    return ( p < v ? p : v );
  });
}