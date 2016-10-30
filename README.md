# Features

- Posts latest link from RSS feed into specified Discord channel
- Doesn't post the link if it has already been posted in last 100 messages
- Configurable polling interval

# Planned features

- Add checking for >100 messages (currently if 100 messages are sent after posting the link, it will be re-posted straight away because it wont be detected in the previous 100)
- Add checking for link within other messages (currently only checks for messages identical to the link)
- Addition of user-defined URLs to match as 'sent' (ie if a user posts a youtu.be link, the bot will still post a youtube.com link, even if they point to the same palce - I would like to add a setting whereby you can specify alternate hosts to match)

Feel free to contact me with suggestions and feature requests - if you need a new feature, just let me know and I will see what I can do! (No promises though :p)

# Installation

1. Make sure you have nodejs (v6+) and npm installed
2. Clone repo or download zip and extract somewhere
3. Open a terminal in cloned/extracted folder
4. Run `npm install` and wait for it to finish
5. Edit *config.json* to include your RSS feed and channel ID
6. Create *botConfig.json* to include your bot token: 
`{
	"token": "abc123blahblahblahyourtokengoeshere"
}`
7. Run `node feed-bot.js`
