"use strict";
const fs = require("fs");
const { fromPairs, uniq, isArray } = require("lodash/fp");

const loadWords = function (length) {
    const rawWords = fs.readFileSync("word-list-raw.txt", "utf-8");
    const nonAlpha = /[^a-z]/;

    const words = rawWords
        .split("\n")
        .filter(word => word.length === length && !nonAlpha.test(word));

    return words;
};

const guess = function guess(availableWords) {

    // Determine frequency of letters in available words
    const letterCounts = fromPairs("abcdefghijklmnopqrstuvwxyz".split('').map(l => [l, 0]));

    availableWords.forEach(word => {
        for (let i = 0; i < word.length; ++i) {
            ++letterCounts[word[i]];
        }
    });

    // Find word with greatest letter frequency
    let bestScore = 0;
    let bestWord = "";
    for (let i = 0; i < availableWords.length; ++i)
    {
        const word = availableWords[i];
        let score = uniq(word.split("")).reduce((carry, letter) => carry + letterCounts[letter], 0);

        if (score > bestScore) {
            bestWord = word;
            bestScore = score;
        }
    }

    return bestWord;
};

const handleGuessResult = (availableWords, oldMustContain, oldMustNotContain, oldPositionConstraints, guess, response) => {
    let mustContain = [...oldMustContain];
    let mustNotContain = [...oldMustNotContain];
    let positionConstraints = [...oldPositionConstraints];

    for (let i = 0; i < response.length; ++i) {
        switch (response[i].toLowerCase())
        {
            case "n":
                mustNotContain.push(guess[i]);
                break;

            case "y":
                mustContain.push(guess[i]);
                if (isArray(positionConstraints[i])) {
                    positionConstraints[i].push(guess[i]);
                }
                break;
            
            case "p":
                mustContain.push(guess[i]);
                positionConstraints[i] = guess[i];
                break;
        }
    }

    mustContain = uniq(mustContain);
    mustNotContain = uniq(mustNotContain);

    // Prune wordlist
    const mustNotContainRegex = new RegExp(`[${mustNotContain.join("")}]`);

    

    const prunedWords = availableWords.filter(word => {
        if (mustNotContainRegex.test(word)) {
            return false;
        }

        for (let i = 0; i < mustContain.length; ++i) {
            if (!word.includes(mustContain[i])) {
                return false;
            }
        }

        for (let i = 0; i < word.length; ++i)
        {
            if (isArray(positionConstraints[i])) {
                if (positionConstraints[i].includes(word[i])) {
                    return false;
                }
            } else if (positionConstraints[i] !== word[i]) {
                return false;
            }
        }

        return true;
    });

    return { prunedWords, mustContain, mustNotContain, positionConstraints };
};


module.exports = { loadWords, guess, handleGuessResult };