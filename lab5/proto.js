/*jshint globalstrict: true, devel: true, node:true */
'use strict';

String.prototype.erLik = function(text) {

    var word = this.toLowerCase();
    var wordToCompare = text.toLowerCase();

    var wordsAreTheSame = undefined;

    // str.charAt(index)  --> (0, str.length - 1)
    // if (word.charAt(0) == wordToCompare.charAt(0){
    //     wordsAreTheSame = true;
    // }

    function replaceCharacters(str) {

        var characters = str;
        characters = characters.replace("é", "e");
        characters = characters.replace("è", "e");
        characters = characters.replace("ê", "e");
        characters = characters.replace("ó", "o");
        characters = characters.replace("ò", "o");
        characters = characters.replace("ô", "o");
        characters = characters.replace("å", "aa");
        characters = characters.replace("æ", "ae");
        characters = characters.replace("ø", "oe");

        return characters;
    }

    word = replaceCharacters(word);
    wordToCompare = replaceCharacters(wordToCompare);

    if (word == wordToCompare)
    {
        wordsAreTheSame = true;
    }
    else
    {
        wordsAreTheSame = false;
    }
    return wordsAreTheSame;
};


// var test = new String("bokmål");
// console.log(test.erLik("bokmaal"));
// console.log(test.erLik("bokmal"));
