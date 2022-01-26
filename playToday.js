"use strict";

const fs = require("fs");
const { loadWords, guess, handleGuessResult } = require("./commonFunctions");

(async function main() {
    const words = loadWords(5);
    
    const answers = fs.readFileSync("answers.txt", "utf-8")
        .split("\n");

    const dayIndex = Math.floor((Date.now() - (new Date("2021-06-19T00:00:00.000Z").getTime())) / 86400000);
    const todayAnswer = answers[dayIndex];

    let mustContain = [];
    let mustNotContain = [];
    let positionConstraints = [
        [],
        [],
        [],
        [],
        [],
    ];

    let remainingWords = words;
    let emojiResponses = [];
    while (remainingWords.length > 0)
    {
        const nextGuess = guess(remainingWords);

        let response = "";
        let emojiResponse = "";
        for (let j = 0; j < todayAnswer.length; ++j) {
            if (nextGuess[j] === todayAnswer[j]) {
                response += "p";
                emojiResponse += String.fromCodePoint(0x1F7E9);
            } else if (todayAnswer.includes(nextGuess[j])) {
                response += "y";
                emojiResponse += String.fromCodePoint(0x1F7E8);
            } else {
                response += "n";
                emojiResponse += String.fromCodePoint(0x2B1C);
            }
        }

        console.log(`${nextGuess.toUpperCase()}`);
        emojiResponses.push(emojiResponse);

        if (nextGuess === todayAnswer) {
            break;
        }

        ({ 
            prunedWords: remainingWords,
            mustContain,
            mustNotContain,
            positionConstraints
        } = handleGuessResult(
            remainingWords,
            mustContain,
            mustNotContain,
            positionConstraints,
            nextGuess,
            response
        ));
    }

    console.log(`\nWordle ${dayIndex} ${emojiResponses.length}/6\n${emojiResponses.join("\n")}`);
})();