# Who's That Poké-Bot

A Discord Bot that allows you to play "Who's that Pokémon?" using the [PokéAPI](https://pokeapi.co/).

## How to add to your Discord server

This bot is not currently deployed on a server, so you will have to run it yourself. After pulling this repository, you will need to create an `auth.json` file in the `bot` folder consisting of your token object like so:

``` json
{
    "token":"your.token.here"
}
```

Aside from this (and in order to get your token), you can follow [this tutorial](https://www.howtogeek.com/364225/how-to-make-your-own-discord-bot/).

## How to play

This bot uses a few commands, all starting with `?`. 

### `?help`

List of commands.

### `?newpokemon [hard_mode]`

Sets a new Pokémon for you to guess. This essentially starts a new round of guessing. By default, this will give you the Pokémon's Pokédex entry and its habitat.

If you add `hard_mode`, you will instead be given the Pokémon's height, weight, and type.

### `?guess `***`your_guess`***

Allows you to make a guess. It is not case sensitive, and when you guess correctly, you will earn points.

If you guess on the first try, you will get 10 points, and for every guess, the amount of points will go down by one. 

After you guess correctly, you will need to use `?newPokemon` to reset to a new round. If you try to guess again, the bot will prompt you to do so.

### `?clue `***`desired_clue`***

Offers a clue based on the criteria that you specify. Your options are:

- `color`
- `shape`
- `type` or `types`
- `flavor_text`
- `habitat`
- `height`
- `weight`