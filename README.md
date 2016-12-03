# Features

- Posts latest link from RSS feed into specified Discord channel
- Configurable polling interval
- Doesn't post the link if it has already been posted in last 100 messages
- YouTube mode - detects both youtube.com and youtu.be links, and doesn't post again if *either* have already been posted (BETA)

Feel free to contact me with suggestions and feature requests - if you need a new feature, just let me know and I will see what I can do! (No promises though :p)

# Installation

1. Make sure you have nodejs (v6+) and npm installed
2. Clone repo or download zip and extract somewhere
3. Open a terminal in cloned/extracted folder
4. Run `npm install` and wait for it to finish
5. Edit *config.json* to include your RSS feed and channel ID
6. Create *bot-config.json* to include your bot token: 
`{
	"token": "abc123blahblahblahyourtokengoeshere"
}`
7. Run `node feed-bot.js`
