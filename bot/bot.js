import fetch from 'node-fetch';
import { createRequire } from 'module';
import { readFileSync } from 'fs';
import Discord from 'discord.io';

let auth = JSON.parse(readFileSync('./auth.json'));

let bot = new Discord.Client({
    token: auth.token,
    autorun: true
});

let currentPokemon = {};
let guessed = false;
let maxPts = 10;

bot.on('message', respond);

async function respond(user, userID, channelID, message, evt) {
    if (message.substring(0,1) === '?') { // if message starts with ?
        let args = message.substring(1).split(' '); // get each argument
        let cmd = args[0]; // get the first argument as the actual command
        args = args.splice(1); // remove the command from the arguments

        switch (cmd) {
            case 'newPokemon':
                bot.sendMessage({
                    to:channelID,
                    message:await getNewPokemon()
                });
                break;
            case 'guess':
                if (args[0].toLowerCase() === currentPokemon.name && !guessed) {
                    guessed = true;
                    bot.sendMessage({
                        to:channelID,
                        message:'You got it, **' + user + '**! It was **' + currentPokemon.name + '**.\n' +
                        'You have been awarded ' + maxPts + ' points!'
                    });
                } else if (!guessed) {
                    maxPts = (maxPts>0) ? maxPts-1 : 0;
                    bot.sendMessage({
                        to:channelID,
                        message:'Sorry, **' + args[0] + '** is not quite right.'
                    });
                } else {
                    bot.sendMessage({
                        to:channelID,
                        message:'The current Pokemon was already guessed. It was **' + currentPokemon.name + '**.\n' +
                        'Try `?newPokemon` to get a new one.'
                    });
                }
                break;
            case 'clue':
                if (currentPokemon[args[0]]) {
                    bot.sendMessage({
                        to:channelID,
                        message:'Sure: ' + currentPokemon[args[0]]
                    });
                } else {
                    bot.sendMessage({
                        to:channelID,
                        message:'I don\'t have that information, sorry.'
                    });
                }
                break;
            case 'help':
                bot.sendMessage({
                    to:channelID,
                    message:`Try these commands!
                    ?help: List of commands.
                    ?newPokemon: Get a new Pokemon to guess.
                    ?guess: Guess which Pokemon it is.
                    ?clue: Ask for a clue - specify what you're looking for.
                    `
                });
        }
    }
}

async function getNewPokemon() {
    guessed = false;
    maxPts = 10;
    let pokeId = Math.floor(Math.random() * 151) + 1
    let response = await fetch('https://pokeapi.co/api/v2/pokemon-species/' + pokeId);
    if (response.status === 200) {
        currentPokemon = await response.json();
        return `Who's That Pokemon? 
            Pokedex: ${currentPokemon.flavor_text_entries[0].flavor_text}
            Habitat: ${currentPokemon.habitat.name}`;
    }
}