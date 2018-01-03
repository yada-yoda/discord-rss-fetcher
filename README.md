# Discord RSS Bot

<!--summary-->
Posts the latest URLs from an RSS feed, optionally @mention-ing a role when posted
<!--/summary-->

## Features

<!--features-->
- Multiple feeds per server
- Configurable channel per feed
- Optional, configurable role per feed, mentioned when a URL is posted
- In-chat setup commands
- Detects if a user "beats me to it" and posts the URL before the feed updates (useful for slow feeds)
- Detects users posting both full and short YouTube urls if using a YouTube RSS feed
<!--/features-->

## Invite

By inviting this bot to your server you agree to the [terms and conditions](#privacy-statement) laid out in the privacy section of this document.  
If you agree, invite to your server with [this link](https://discordapp.com/oauth2/authorize?client_id=343909688045469698&scope=bot&permissions=0x00014c00).

## Setup

You can ask the bot for help with commands by typing `@RSS Bot help`

### Add a new feed

`@RSS Bot add-feed <url> <#channel> [@role]`  
- *url* must be an RSS feed URL
- *#channel* must be a channel mention
- *@role* must be a role mention (make sure "Anyone can mention this role" is turned on during setup)

Example:
`@RSS Bot add-feed http://lorem-rss.herokuapp.com/feed?unit=second&interval=30 #rss-posts @subscribers`

### View feeds configured for this server

`@RSS Bot view-feeds`  
This will display a list of RSS feeds configured for this server, along with a unique ID for each

### Remove a configured feed

`@RSS Bot remove-feed <feed-id>`  

To remove a feed you will need it's unique ID, which you can find by running the above *view-feeds* command

Example:
`@RSS Bot remove-feed ABc-123dEF`

## Permissions

The bot requires certain permissions, which you are prompted for on the invite screen.
Each permission has a reason for being required, explained below.

| Permission           | Reason                                                       |
|----------------------|--------------------------------------------------------------|
| Read messages        | Detect when you use commands                                 |
| Send messages        | Respond when you use commands; post new RSS links            |
| Read message history | Check if any new RSS links have been posted during downtime  |
| Embed links   | Responses to 'help' requests use message embeds for nice formatting |

## Privacy statement

In accordance with the [Discord developer Terms of Service](https://discordapp.com/developers/docs/legal), by inviting this bot to your Discord server you agree that this bot may collect and store the relevant data needed to function, including but not limited to:

- Details about the server being joined (server name, server ID, server roles and permissions)  
- Details about the users in the server (usernames, nicknames and user IDs)  
- The contents of messages necessary to function (invoked commands and their parameters)  

This bot will only collect data which is necessary to function.  
No data collected will be shared with any third parties.  

Should you wish for the data stored about your server to be removed, please contact me via [my support Discord](https://discordapp.com/invite/SSkbwSJ) and I will oblige as soon as I am able. Please note that this will require you to remove the bot from your server.


## Want to host your own instance?

1. Clone the repository, or download and extract the zip file (preferrably from the release page)
2. Make sure you have *npm* and *git* installed
3. Run `npm install`
4. Add *token.json* in the root folder (make sure to include the quotes ""): `"your-token-goes-here"`
5. Run `npm start`

**Note for git users**  
If you cloned the repository with git, make sure you `git reset --hard vX.Y` to a specific version, as latest master isn't always production ready!

## Need help?

I am available for contact via my [support Discord server](https://discordapp.com/invite/SSkbwSJ). I will always do my best to respond, however I am often busy so can't always be available right away, and as this is a free service I may not always be able to resolve your query.
