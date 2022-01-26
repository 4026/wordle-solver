"use strict";

const readline = require("readline");

const { loadWords, guess, handleGuessResult } = require("./commonFunctions");

(async function main() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const words = loadWords(5);
        
    let mustContain = [];
    let mustNotContain = [];
    let positionConstraints = [
        [],
        [],
        [],
        [],
        [],
    ];

    console.log("Use N for incorrect letters, Y for correct letters, P for letters in the correct position.\n");

    let remainingWords = words;
    while (true)
    {
        console.log(`\n${remainingWords.length} words left...`);
        if (mustContain.length > 0) {
            console.log(`Must Contain: ${mustContain.join(",")}.`);
        }
        if (mustNotContain.length > 0) {
            console.log(`Must not contain: ${mustNotContain.join(",")}`);
        }
        if (remainingWords.length < 10) {
            console.log(`Remaining: ${remainingWords.join(",")}`);
        }

        const nextGuess = guess(remainingWords);
        console.log(`Guess: ${nextGuess}`);

        const response = await new Promise(resolve => rl.question("Result? ", resolve));

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
})();