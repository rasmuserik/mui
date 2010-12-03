var number = random(1, 100);
var main = function (uiParams) {
    var guess = uiParams["guess"];
    var text;
    if (guess === undefined) {
        text = "I am thinking of a number between 1 and 100, try to guess it";
    } else if (guess > number) {
        text = "You guessed too high, try again";
    } else if (guess < number) {
        text = "You guessed too low, try again";
    } else {
        text = "Congratulations! You guessed it! Now I am thinking of a new number, let's see if you can guess it again";
        number = random(1, 100);
    };
    createUI([{
        "text": text
    }, {
        "input": "",
        "id": "guess",
        "type": "number"
    }, {
        "button": "Guess",
        "action": main
    }]);
};
