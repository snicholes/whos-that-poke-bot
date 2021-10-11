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
                if (args[0] === 'hard_mode') {
                    await getNewPokemon();
                    bot.sendMessage({
                        to:channelID,
                        message:`Who's That Pokemon? 
Height: ${await giveClue('height')}
Weight: ${await giveClue('weight')}
Type(s): ${await giveClue('type')}`
                    });
                } else {
                    bot.sendMessage({
                        to:channelID,
                        message:await getNewPokemon()
                    });
                }
                break;
            case 'guess':
                if (args[0].toLowerCase() === currentPokemon.name && !guessed) {
                    guessed = true;
                    bot.sendMessage({
                        to:channelID,
                        message:'You got it, **' + user + '**! It was **' + currentPokemon.name + '**.\n' +
                        'You have been awarded ' + Math.floor(maxPts) + ' points!'
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
                let clue = await giveClue(args[0]);
                if (clue) {
                    maxPts = (maxPts>0) ? maxPts-.5 : 0;
                    bot.sendMessage({
                        to:channelID,
                        message:'Sure: ' + clue
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
\`?help\`: List of commands.
\`?newPokemon\`: Get a new Pokemon to guess.
    \`hard_mode\`: Get a new Pokemon with only type, height, and weight to start
\`?guess\`: Guess which Pokemon it is.
\`?clue\`: Ask for a clue - specify what you're looking for.
    \`color\`
    \`shape\`
    \`type\` OR \`types\`
    \`flavor_text\`
    \`habitat\`
    \`height\`
    \`weight\``});
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
        let flavorText;
        let i = 0;
        while (!flavorText) {
            if (currentPokemon.flavor_text_entries[i].language.name === 'en')
                flavorText = currentPokemon.flavor_text_entries[i].flavor_text;
            else
                i++;
        }
        if (flavorText.toLowerCase().includes(currentPokemon.name)) {
            flavorText.replace(currentPokemon.name.toUpperCase(), 'POKéMON');
        }
        return `Who's That Pokemon? 
Pokedex: ${flavorText}
Habitat: ${currentPokemon.habitat.name}`;
    }
}

async function giveClue(requestedClue) {
    switch (requestedClue) {
        case 'color':
            return currentPokemon.color.name;
        case 'shape':
            return currentPokemon.shape.name;
        case 'type':
        case 'types':
            let responseT = await fetch('https://pokeapi.co/api/v2/pokemon/' + currentPokemon.id);
            if (responseT.status === 200) {
                let pokeData = await responseT.json();
                let typesStr = pokeData.types[0].type.name;
                if (pokeData.types.length > 1)
                    typesStr += ' ' + pokeData.types[1].type.name;
                return typesStr;
            } else return null;
        case 'flavor_text':
            return currentPokemon.flavor_text_entries[0].flavor_text;
        case 'habitat':
            return currentPokemon.habitat.name;
        case 'height':
            let responseH = await fetch('https://pokeapi.co/api/v2/pokemon/' + currentPokemon.id);
            if (responseH.status === 200) {
                let pokeData = await responseH.json();
                return (pokeData.height / 10) + ' m';
            } else return null;
        case 'weight':
            let responseW = await fetch('https://pokeapi.co/api/v2/pokemon/' + currentPokemon.id);
            if (responseW.status === 200) {
                let pokeData = await responseW.json();
                return (pokeData.weight / 10) + ' kg';
            } else return null;
        default:
            return null;
    }
}