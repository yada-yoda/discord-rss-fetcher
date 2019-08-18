![health status](https://healthchecks.io/badge/757a86c5-43a4-4c74-a134-72ba9e7b391b/xJed9T7a.svg)

# Discord RSS fetcher
<!--summary-->
A Discord bot to post the latest articles from an RSS feed into a channel, optionally mentioning a role when posting
<!--/summary-->

## Features
<!--features-->
- Multiple feeds per server
- Commands to configure feeds in different channels
- Optional role to be mentioned when a feed article is posted
- Detects if a user "beats me to it" by posting the URL before the bot can (useful for slow feeds)
- Specific handling for YouTube links, detects both long and short YouTube URLs
<!--/features-->

## Use cases
- You want to stay up to date with an RSS feed
- You want your Discord server to be notified of events via an RSS feed

## Getting started
### Invite
- By using this bot you agree to the terms laid out in the [Privacy & Terms](./docs/privacy-and-terms) document
- If you agree, use my [public invite](https://discordapp.com/oauth2/authorize?client_id=575106301261119498&scope=bot&permissions=0x00014c00) to invite the bot to your server

### Setup
Use `@RSS Poster help` to view available commands

**Admin only**
These commands require administrator permission in the Discord server
- `@RSS Poster add-feed <url> <#channel> [@role]` to add a new feed
- `@RSS Poster view-feeds` to view configured feeds for this server
- `@RSS Poster remove-feed <feed-id>` to remove a feed by it's ID (found using the `view-feeds` command)

Example:
`@RSS Poster add-feed http://lorem-rss.herokuapp.com/feed?unit=second&interval=30 #rss-posts @subscribers`

## Permissions
The bot requires certain permissions, which you are prompted for on the invite screen.
Each permission has a reason for being required, explained below.

| Permission           | Reason                                                              |
|----------------------|---------------------------------------------------------------------|
| Read messages        | Detect when you use commands                                        |
| Send messages        | Respond when you use commands; post new RSS links                   |
| Read message history | Check if any new RSS links have been posted during downtime         |
| Embed links          | Responses to 'help' requests use message embeds for nice formatting |

## Self hosting
1. Install [Node.js v10](https://nodejs.org/en/) and 
2. Clone the repository, or download and extract the zip file (preferrably from the [release page](https://github.com/benji7425/discord-rss-fetcher/releases))
3. Create a new file *config.json* from a copy of *config.sample.json*; paste your bot token in the `token` field (between the quotes)
4. Run `npm run full-start` to compile and run the bot
	- If you see yellow 'WARN' messages about peer dependencies, you can safely ignore these

**Note for git users**  
If you cloned the repository with git, make sure you `git reset --hard vX.Y` to a specific version, as latest master isn't always production ready!

## Need help?

I am available for contact via my [support Discord server](https://discordapp.com/invite/SSkbwSJ). I will always do my best to respond, however I am often busy so can't always be available right away, and as this is a free service I may not always be able to resolve your query.

## Built With
- [Node.js](https://nodejs.org/en/) - *Runtime*
- [discord.js](https://github.com/discordjs/discord.js) - *Discord library*
- [disharmony](https://github.com/benji7425/disharmony) - *Bot framework*
- [rss-parser](https://github.com/bobby-brennan/rss-parser) - *RSS parsing library*

## Versioning
[SemVer](http://semver.org/) is used for versioning; view available versions on the [tags page](https://github.com/your/project/tags)

## License
This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details
