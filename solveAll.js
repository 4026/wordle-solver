"use strict";

const fs = require("fs");
const { loadWords, guess, handleGuessResult } = require("./commonFunctions");
const { has, toPairs } = require("lodash");

(async function main() {
    const words = loadWords(5);

    const answers = fs.readFileSync("answers.txt", "utf-8")
        .split("\n");

    const guessCounts = {};
    const failures = [];
    const overshoots = {};

    for (let i = 0; i < answers.length; ++i) {
        let answer = answers[i];

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
        let guesses = 0;
        let success = false;
        while (remainingWords.length > 0)
        {
            ++guesses;
            const nextGuess = guess(remainingWords);
            if (nextGuess === answer) {
                success = true;
                break;
            }
    
            let response = "";
            for (let j = 0; j < answer.length; ++j) {
                if (nextGuess[j] === answer[j]) {
                    response += "p";
                } else if (answer.includes(nextGuess[j])) {
                    response += "y";
                } else {
                    response += "n";
                }
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

        if (success) {
            if (has(guessCounts, guesses)) {
                ++guessCounts[guesses];
            } else {
                guessCounts[guesses] = 1;
            }

            if (guesses >= 10) {
                if (has(overshoots, guesses)) {
                    overshoots[guesses].push(answer);
                } else {
                    overshoots[guesses] = [ answer ];
                }
            }
        } else {
            failures.push(answer);
        }
    }

    const guessPairs = toPairs(guessCounts);
    guessPairs.sort((a, b) => a[0] - b[0]);
    guessPairs.forEach(([guesses, count]) => {
        const bar = `${"=".repeat(count / 10)}${(count % 10) >= 5 ? '-' : ''}`;
        console.log(`${guesses.padStart(2)}: ${count.toString().padStart(4)} ${bar}`);
        if (has(overshoots, guesses)) {
            console.log(`    (${overshoots[guesses].join(", ")})`);
        }
    });

    if (failures.length > 0) {
        console.log(`Additionally, we failed to guess these words that are not in our wordlist:\n${failures.join(", ")}`);
    }
        
})();